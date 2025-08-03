import { useCurrentUser } from "@/hooks/use-auth";
import { ChatData, ChatMessage } from "@/types/chat.types";
import { WSMessage } from "@/types/websocket.types";
import { connectChatSocket } from "@/utils/chatSocket";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface ChatWebSocketContextType {
  conversations: ChatData[];
  conversationMessages: { [conversationId: string]: ChatMessage[] };
  typingUsers: {
    [conversationId: string]: { userId: string; userName: string }[];
  };
  isLoading: boolean;
  connectionError: boolean;
  subscribeToConversation: (
    conversationId: string,
    callback: (message: WSMessage) => void
  ) => void;
  unsubscribeFromConversation: (conversationId: string) => void;
  refreshConversations: () => void;
  reconnectWebSocket: () => void;
  addOptimisticMessage: (
    conversationId: string,
    message: Partial<ChatMessage>
  ) => void;
  sendWebSocketMessage: (message: any) => void;
  // Add temporary contact tracking
  setTemporaryContact: (
    conversationId: string,
    contact: {
      name: string;
      profile_image_url?: string;
      user_id: string;
    }
  ) => void;
  getTemporaryContact: (conversationId: string) => {
    name: string;
    profile_image_url?: string;
    user_id: string;
  } | null;
  clearTemporaryContact: (conversationId: string) => void;
}

const ChatWebSocketContext = createContext<
  ChatWebSocketContextType | undefined
>(undefined);

export const useChatWebSocket = () => {
  const context = useContext(ChatWebSocketContext);
  if (!context) {
    throw new Error(
      "useChatWebSocket must be used within a ChatWebSocketProvider"
    );
  }
  return context;
};

interface ChatWebSocketProviderProps {
  children: ReactNode;
}

export const ChatWebSocketProvider: React.FC<ChatWebSocketProviderProps> = ({
  children,
}) => {
  const { user } = useCurrentUser();
  const [conversations, setConversations] = useState<ChatData[]>([]);
  const [conversationMessages, setConversationMessages] = useState<{
    [conversationId: string]: ChatMessage[];
  }>({});
  const [typingUsers, setTypingUsers] = useState<{
    [conversationId: string]: { userId: string; userName: string }[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Add temporary contacts state
  const [temporaryContacts, setTemporaryContacts] = useState<{
    [conversationId: string]: {
      name: string;
      profile_image_url?: string;
      user_id: string;
    };
  }>({});

  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<{
    [conversationId: string]: ((message: WSMessage) => void)[];
  }>({});
  const typingTimeouts = useRef<{
    [key: string]: ReturnType<typeof setTimeout>;
  }>({});

  // Add temporary contact functions
  const setTemporaryContact = (
    conversationId: string,
    contact: {
      name: string;
      profile_image_url?: string;
      user_id: string;
    }
  ) => {
    console.log(
      "📝 Setting temporary contact for conversation:",
      conversationId,
      contact
    );
    setTemporaryContacts((prev) => ({
      ...prev,
      [conversationId]: contact,
    }));
  };

  const getTemporaryContact = (conversationId: string) => {
    return temporaryContacts[conversationId] || null;
  };

  const clearTemporaryContact = (conversationId: string) => {
    console.log(
      "🗑️ Clearing temporary contact for conversation:",
      conversationId
    );
    setTemporaryContacts((prev) => {
      const updated = { ...prev };
      delete updated[conversationId];
      return updated;
    });
  };

  // Clear temporary contact when actual conversation data is received
  useEffect(() => {
    // Clear temporary contacts when we have actual conversation data
    conversations.forEach((conv) => {
      if (temporaryContacts[conv.id]) {
        clearTemporaryContact(conv.id);
      }
    });
  }, [conversations]);

  // Subscribe to a specific conversation
  const subscribeToConversation = (
    conversationId: string,
    callback: (message: WSMessage) => void
  ) => {
    if (!subscribersRef.current[conversationId]) {
      subscribersRef.current[conversationId] = [];
    }
    subscribersRef.current[conversationId].push(callback);
  };

  // Unsubscribe from a specific conversation
  const unsubscribeFromConversation = (conversationId: string) => {
    delete subscribersRef.current[conversationId];
  };

  // Add a function to establish WebSocket connection
  const establishWebSocketConnection = () => {
    if (!user?.id) return;

    setIsLoading(true);
    setConnectionError(false);

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear all typing timeouts
    Object.values(typingTimeouts.current).forEach((timeout) => {
      clearTimeout(timeout);
    });
    typingTimeouts.current = {};

    wsRef.current = connectChatSocket({
      userId: user.id,
      conversationId: "all",
      onMessage: (msg: WSMessage) => {
        // Handle different WebSocket message types
        switch (msg.type) {
          case "all_conversations":
            // Initial conversation list - data is array of {conversation, messages}
            if (msg.data && Array.isArray(msg.data)) {
              // Extract conversations
              const conversations = msg.data.map(
                (item: any) => item.conversation
              );
              setConversations(conversations);

              // Store messages for each conversation
              const messagesMap: { [conversationId: string]: ChatMessage[] } =
                {};
              msg.data.forEach((item: any) => {
                // Handle null or missing messages array
                const messages = item.messages || [];
                const chatMessages: ChatMessage[] = Array.isArray(messages)
                  ? messages.map((message: any) => ({
                      id: message.id,
                      conversation_id: message.conversation_id,
                      sender_id: message.sender_id,
                      content: message.content,
                      message_type: message.message_type,
                      order: message.order || null,
                      file_url: message.file_url || null,
                      file_name: message.file_name || null,
                      created_at: message.created_at,
                      read_by: message.read_by || [],
                      sender_info: message.sender_info || {
                        name: "",
                        avatar: "",
                        role: "",
                      },
                      ai_analysis: message.ai_analysis || null,
                      is_monitored: message.is_monitored || false,
                      is_edited: message.is_edited || false,
                      delivered_at: message.delivered_at || message.created_at,
                      requires_admin_alert:
                        message.requires_admin_alert || false,
                      updated_at: message.updated_at || message.created_at,
                    }))
                  : [];
                messagesMap[item.conversation.id] = chatMessages;
              });
              setConversationMessages(messagesMap);
            }
            setIsLoading(false);
            setConnectionError(false);
            break;

          case "text":
          case "file":
          case "audio":
          case "video":
            // Skip if data is null to avoid processing issues
            if (!msg.data) {
              console.log(`Skipping ${msg.type} message with null data`);
              break;
            }

            // Update conversation list with new last message
            setConversations((prev) => {
              const updated = [...prev];
              const index = updated.findIndex(
                (conv) => conv.id === msg.conversation_id
              );

              if (index !== -1) {
                // Existing conversation - update and move to top
                let conversation = { ...updated[index] };
                conversation = msg.data?.conversation || conversation;

                // Move conversation to top
                updated.splice(index, 1);
                updated.unshift(conversation);
              } else {
                // New conversation - create it and add to top
                const newConversation = msg.data?.conversation;
                if (newConversation) {
                  // Add new conversation to the top
                  updated.unshift(newConversation);
                }
              }

              return updated;
            });

            // Add message to conversation messages
            if (msg.data?.messages && Array.isArray(msg.data.messages)) {
              const chatMessages: ChatMessage[] = msg.data.messages.map(
                (message: any) => ({
                  id: message.id,
                  conversation_id: message.conversation_id,
                  sender_id: message.sender_id,
                  content: message.content,
                  message_type: message.message_type,
                  order: message.order || null,
                  file_url: message.file_url || null,
                  file_name: message.file_name || null,
                  created_at: message.created_at,
                  read_by: message.read_by || [],
                  sender_info: message.sender_info || {
                    name: "",
                    avatar: "",
                    role: "",
                  },
                  ai_analysis: message.ai_analysis || null,
                  is_monitored: message.is_monitored || false,
                  is_edited: message.is_edited || false,
                  delivered_at: message.delivered_at || message.created_at,
                  requires_admin_alert: message.requires_admin_alert || false,
                  updated_at: message.updated_at || message.created_at,
                })
              );

              // Add incoming message(s) to conversation messages, replacing any optimistic temp messages
              chatMessages.forEach((incoming) => {
                setConversationMessages((prev) => ({
                  ...prev,
                  [msg.conversation_id]: [
                    // Remove any temporary messages from the same sender with similar content/timestamp
                    ...(prev[msg.conversation_id] || []).filter((m) => {
                      // Keep message if it's not a temporary one, or if it's a different message
                      if (!m.id.startsWith("temp-")) return true;

                      // Remove temp message if this real message is from same sender within 5 seconds
                      const timeDiff = Math.abs(
                        new Date(incoming.created_at).getTime() -
                          new Date(m.created_at).getTime()
                      );
                      return !(
                        m.sender_id === incoming.sender_id && timeDiff < 5000
                      );
                    }),
                    incoming,
                  ],
                }));
              });
            }
            break;

          case "order":
            // Skip if data is null to avoid duplicate processing
            if (!msg.data) {
              console.log("Skipping order message with null data");
              break;
            }

            // Update conversation list with new last message
            setConversations((prev) => {
              const updated = [...prev];
              const index = updated.findIndex(
                (conv) => conv.id === msg.conversation_id
              );

              if (index !== -1) {
                // Existing conversation - update and move to top
                const conversation = { ...updated[index] };
                conversation.last_message = {
                  message_id: msg.data.id,
                  content: msg.data.content,
                  sender_id: msg.sender_id,
                  message_type: "order",
                  created_at: msg.data.created_at,
                  read_by: msg.data.read_by || [],
                };

                // Move conversation to top
                updated.splice(index, 1);
                updated.unshift(conversation);
              } else {
                // Handle new conversation case if needed
                console.log(
                  "New conversation for order message - may need to fetch conversation details"
                );
              }

              return updated;
            });

            // Add order message to conversation messages
            const orderMessage: ChatMessage = {
              id: msg.data.id,
              conversation_id: msg.data.conversation_id,
              sender_id: msg.data.sender_id,
              content: msg.data.content,
              message_type: "order",
              order: msg.data.order,
              file_url: undefined,
              file_name: undefined,
              created_at: msg.data.created_at,
              read_by: msg.data.read_by || [],
              sender_info: msg.data.sender_info || {
                name: "",
                avatar: "",
                role: "",
              },
              ai_analysis: msg.data.ai_analysis || null,
              is_monitored: msg.data.is_monitored || false,
              is_edited: msg.data.is_edited || false,
              delivered_at: msg.data.delivered_at || msg.data.created_at,
              requires_admin_alert: msg.data.requires_admin_alert || false,
              updated_at: msg.data.updated_at || msg.data.created_at,
            };

            setConversationMessages((prev) => ({
              ...prev,
              [msg.conversation_id]: [
                // Remove any temporary messages from the same sender with similar content/timestamp
                ...(prev[msg.conversation_id] || []).filter((m) => {
                  // Keep message if it's not a temporary one, or if it's a different message
                  if (!m.id.startsWith("temp-")) return true;

                  // Remove temp message if this real message is from same sender within 5 seconds
                  const timeDiff = Math.abs(
                    new Date(orderMessage.created_at).getTime() -
                      new Date(m.created_at).getTime()
                  );
                  return !(
                    m.sender_id === orderMessage.sender_id && timeDiff < 5000
                  );
                }),
                orderMessage,
              ],
            }));
            break;

          case "read_receipt":
            // Update read status for messages
            setConversations((prev) => {
              const updated = [...prev];
              const index = updated.findIndex(
                (conv) => conv.id === msg.conversation_id
              );

              if (index !== -1) {
                const conversation = { ...updated[index] };
                if (
                  conversation.last_message &&
                  msg.data?.id === conversation.last_message.message_id
                ) {
                  conversation.last_message.read_by = msg.data?.read_by || [];
                }
                updated[index] = conversation;
              }

              return updated;
            });

            // Update message read status
            setConversationMessages((prev) => ({
              ...prev,
              [msg.conversation_id]: (prev[msg.conversation_id] || []).map(
                (message) =>
                  message.id === msg.data?.id
                    ? { ...message, read_by: msg.data?.read_by || [] }
                    : message
              ),
            }));
            break;

          case "typing":
            // Add user to typing list for this conversation
            if (msg.sender_id !== user?.id) {
              const timeoutKey = `${msg.conversation_id}:${msg.sender_id}`;

              // Clear existing timeout for this user in this conversation
              if (typingTimeouts.current[timeoutKey]) {
                clearTimeout(typingTimeouts.current[timeoutKey]);
              }

              setTypingUsers((prev) => {
                const conversationTypers = prev[msg.conversation_id] || [];
                const existingTyper = conversationTypers.find(
                  (typer) => typer.userId === msg.sender_id
                );

                if (!existingTyper) {
                  return {
                    ...prev,
                    [msg.conversation_id]: [
                      ...conversationTypers,
                      {
                        userId: msg.sender_id,
                        userName: msg.data?.sender_name || "Someone",
                      },
                    ],
                  };
                }
                return prev;
              });

              // Set a timeout to automatically remove the typing indicator after 5 seconds
              typingTimeouts.current[timeoutKey] = setTimeout(() => {
                setTypingUsers((prev) => {
                  const conversationTypers = prev[msg.conversation_id] || [];
                  const updatedTypers = conversationTypers.filter(
                    (typer) => typer.userId !== msg.sender_id
                  );

                  return {
                    ...prev,
                    [msg.conversation_id]: updatedTypers,
                  };
                });
                delete typingTimeouts.current[timeoutKey];
              }, 5000);
            }
            break;

          case "stop_typing":
            // Remove user from typing list for this conversation
            if (msg.sender_id !== user?.id) {
              const timeoutKey = `${msg.conversation_id}:${msg.sender_id}`;

              // Clear the timeout since we received an explicit stop_typing message
              if (typingTimeouts.current[timeoutKey]) {
                clearTimeout(typingTimeouts.current[timeoutKey]);
                delete typingTimeouts.current[timeoutKey];
              }

              setTypingUsers((prev) => {
                const conversationTypers = prev[msg.conversation_id] || [];
                const updatedTypers = conversationTypers.filter(
                  (typer) => typer.userId !== msg.sender_id
                );

                return {
                  ...prev,
                  [msg.conversation_id]: updatedTypers,
                };
              });
            }
            break;

          default:
            console.log("Unknown WebSocket message type:", msg.type);
        }

        // Notify conversation-specific subscribers
        const subscribers = subscribersRef.current[msg.conversation_id] || [];
        subscribers.forEach((callback) => callback(msg));

        // Also notify 'all' subscribers (for conversation list page)
        const allSubscribers = subscribersRef.current["all"] || [];
        allSubscribers.forEach((callback) => callback(msg));
      },
    });

    // Send initial request for all conversations once connected
    if (wsRef.current) {
      wsRef.current.onopen = () => {
        console.log(
          "✅ Global WebSocket connected - requesting all conversations"
        );

        const requestMessage = {
          type: "all_conversations",
          conversation_id: "",
          sender_id: user.id,
          data: {},
          timestamp: Math.floor(Date.now() / 1000),
        };

        wsRef.current?.send(JSON.stringify(requestMessage));
      };

      wsRef.current.onerror = () => {
        setIsLoading(false);
        setConnectionError(true);
      };

      wsRef.current.onclose = () => {
        setIsLoading(false);
      };
    }
  };

  // Add the reconnect function
  const reconnectWebSocket = () => {
    establishWebSocketConnection();
  };

  // Modify the existing useEffect to use the new function
  useEffect(() => {
    if (!user?.id) return;

    establishWebSocketConnection();

    return () => {
      // Clear all typing timeouts
      Object.values(typingTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
      typingTimeouts.current = {};

      wsRef.current?.close();
    };
  }, [user?.id]);

  const refreshConversations = () => {
    if (wsRef.current && user?.id) {
      const requestMessage = {
        type: "all_conversations",
        conversation_id: "",
        sender_id: user.id,
        data: {},
        timestamp: Math.floor(Date.now() / 1000),
      };

      wsRef.current.send(JSON.stringify(requestMessage));
    }
  };

  const sendWebSocketMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  };

  // Add optimistic message (before WebSocket confirms it)
  const addOptimisticMessage = (
    conversationId: string,
    message: Partial<ChatMessage>
  ) => {
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`, // Temporary ID until WebSocket confirms
      conversation_id: conversationId,
      sender_id: message.sender_id || user?.id || "",
      content: message.content || "",
      message_type: message.message_type || "text",
      order: message.order || undefined,
      file_url: message.file_url || undefined,
      file_name: message.file_name || undefined,
      created_at: new Date().toISOString(),
      read_by: [],
      sender_info: {
        name: user?.full_name || "",
        avatar: user?.profile_image_url || "",
        role: "customer",
      },
      ai_analysis: {
        overall_risk_score: 0,
        off_platform_risk_score: 0,
        detected_flags: null,
        extracted_entities: null,
        sentiment_score: 0,
        language_detected: "en",
        toxicity_score: 0,
        analyzed_at: new Date().toISOString(),
        processing_time_ms: 0,
      },
      is_monitored: false,
      is_edited: false,
      delivered_at: new Date().toISOString(),
      requires_admin_alert: false,
      updated_at: new Date().toISOString(),
    };

    // Add to conversation messages
    setConversationMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), optimisticMessage],
    }));

    // Update conversation list with new last message
    setConversations((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((conv) => conv.id === conversationId);

      if (index !== -1) {
        const conversation = { ...updated[index] };
        conversation.last_message = {
          message_id: optimisticMessage.id,
          content: optimisticMessage.content,
          sender_id: optimisticMessage.sender_id,
          message_type: optimisticMessage.message_type,
          created_at: optimisticMessage.created_at,
          read_by: [],
        };

        // Move conversation to top
        updated.splice(index, 1);
        updated.unshift(conversation);
      }

      return updated;
    });
  };

  return (
    <ChatWebSocketContext.Provider
      value={{
        conversations,
        conversationMessages,
        typingUsers,
        isLoading,
        connectionError,
        subscribeToConversation,
        unsubscribeFromConversation,
        refreshConversations,
        reconnectWebSocket,
        addOptimisticMessage,
        sendWebSocketMessage,
        setTemporaryContact,
        getTemporaryContact,
        clearTemporaryContact,
      }}
    >
      {children}
    </ChatWebSocketContext.Provider>
  );
};
