import Avatar from "@/components/Avatar";
import MessageCard from "@/components/chat/MessageCard";
import Input from "@/components/input/Input";
import { useChatWebSocket } from "@/contexts/ChatWebSocketContext";
import { useCurrentUser } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import Colors from "@/styles/colors";
import { Heading } from "@/styles/typography";
import { ChatMessage } from "@/types/chat.types";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  const { id } = useLocalSearchParams();
  const { user } = useCurrentUser();
  const { sendMessage } = useChat();

  // Use global WebSocket context instead of creating separate connection
  const {
    conversations,
    conversationMessages,
    subscribeToConversation,
    unsubscribeFromConversation,
    addOptimisticMessage,
    sendWebSocketMessage,
    isLoading,
    refreshConversations,
    getTemporaryContact,
    clearTemporaryContact,
  } = useChatWebSocket();

  // Get conversation and messages from global context
  const conversation = conversations.find((conv) => conv.id === id);
  const chatMessages = conversationMessages[id as string] || [];
  const temporaryContact = getTemporaryContact(id as string);

  const scrollViewRef = useRef<ScrollView>(null);
  const [text, setText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation values for typing indicator dots
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  // Function to refresh messages and conversation data
  const handleOrderUpdate = async () => {
    try {
      // No longer need to refresh via REST API - messages will update via WebSocket
      console.log("Order updated - messages will update via WebSocket");
    } catch (error) {
      console.error("Error refreshing chat data:", error);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];

      // Add optimistic message immediately
      addOptimisticMessage(id as string, {
        content: "Image",
        message_type: "file",
        sender_id: user?.id || "",
        file_name: asset.fileName || `photo-${Date.now()}.jpg`,
        file_url: asset.uri, // Show local URI temporarily
      });

      const formData = new FormData();
      formData.append("conversation_id", id as string);
      formData.append("sender_id", user?.id || "");
      formData.append("message_type", "file");

      formData.append("file", {
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || `photo-${Date.now()}.jpg`,
      } as any);

      try {
        await sendMessage(formData);
      } catch (error) {
        console.error("Failed to send image:", error);
      }
    }
  };

  const handleRecordAudio = async () => {
    try {
      if (!recorderState.isRecording) {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
      } else {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        if (!uri) return;

        // Add optimistic message immediately
        addOptimisticMessage(id as string, {
          content: "Audio Recording",
          message_type: "audio",
          sender_id: user?.id || "",
          file_name: `recording-${Date.now()}.m4a`,
          file_url: uri, // Show local URI temporarily
        });

        const formData = new FormData();
        formData.append("conversation_id", id as string);
        formData.append("sender_id", user?.id || "");
        formData.append("message_type", "audio");
        formData.append("file", {
          uri,
          name: `recording-${Date.now()}.m4a`,
          type: "audio/m4a",
        } as any);

        try {
          await sendMessage(formData);
        } catch (error) {
          console.error("Failed to send audio:", error);
        }
      }
    } catch (error) {
      console.error("Recording error:", error);
    }
  };

  const handleSendTextMessage = async () => {
    Keyboard.dismiss();

    if (!text.trim()) return;

    const messageContent = text.trim();
    setText(""); // Clear input immediately

    // Stop typing indicator when sending message
    sendStopTypingIndicator();

    // Add optimistic message immediately for instant UI feedback
    addOptimisticMessage(id as string, {
      content: messageContent,
      message_type: "text",
      sender_id: user?.id || "",
    });

    const formData = new FormData();
    formData.append("conversation_id", id as string);
    formData.append("sender_id", user?.id || "");
    formData.append("content", messageContent);
    formData.append("message_type", "text");

    try {
      await sendMessage(formData);
      // Message will be updated via WebSocket when it comes back from server
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Handle error - maybe remove the optimistic message or show error state
    }
  };

  // Typing indicator functions
  const sendTypingIndicator = () => {
    if (!isTyping) {
      setIsTyping(true);
      const typingMessage = {
        type: "typing" as const,
        conversation_id: id as string,
        sender_id: user?.id || "",
        data: {
          user_id: user?.id || "",
          user_name: user?.full_name || "User",
          is_typing: true,
        },
        timestamp: Math.floor(Date.now() / 1000),
      };
      sendWebSocketMessage(typingMessage);
    }
  };

  const sendStopTypingIndicator = () => {
    if (isTyping) {
      setIsTyping(false);
      const stopTypingMessage = {
        type: "stop_typing" as const,
        conversation_id: id as string,
        sender_id: user?.id || "",
        data: {
          user_id: user?.id || "",
          user_name: user?.full_name || "User",
          is_typing: false,
        },
        timestamp: Math.floor(Date.now() / 1000),
      };
      sendWebSocketMessage(stopTypingMessage);
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);

    // Send typing indicator when user starts typing
    if (newText.trim() && !isTyping) {
      sendTypingIndicator();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTypingIndicator();
    }, 2000);

    // If text is empty, immediately stop typing indicator
    if (!newText.trim()) {
      sendStopTypingIndicator();
    }
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchText(query);
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const results = chatMessages.filter((message) =>
      message.content?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
    setCurrentSearchIndex(0);
  };

  const navigateSearchResult = (direction: "up" | "down") => {
    if (searchResults.length === 0) return;

    let newIndex = currentSearchIndex;
    if (direction === "up") {
      newIndex =
        currentSearchIndex > 0
          ? currentSearchIndex - 1
          : searchResults.length - 1;
    } else {
      newIndex =
        currentSearchIndex < searchResults.length - 1
          ? currentSearchIndex + 1
          : 0;
    }
    setCurrentSearchIndex(newIndex);

    // Scroll to the current search result
    scrollToMessage(searchResults[newIndex]);
  };

  const scrollToMessage = (targetMessage: ChatMessage) => {
    // Find the index of the target message in the chatMessages array
    const messageIndex = chatMessages.findIndex(
      (msg) => msg.id === targetMessage.id
    );

    if (messageIndex !== -1) {
      // Calculate approximate scroll position
      // Assuming each message takes roughly 80-120px height
      const estimatedMessageHeight = 100;
      const scrollY = messageIndex * estimatedMessageHeight;

      // Scroll to the estimated position
      scrollViewRef.current?.scrollTo({
        y: scrollY,
        animated: true,
      });
    }
  };

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (!isSearchMode) {
      // Entering search mode - clear previous search
      setSearchText("");
      setSearchResults([]);
      setCurrentSearchIndex(0);
    }
  };

  // Use temporary contact info if conversation doesn't exist yet
  const contactInfo =
    conversation?.participant_details?.[1] || temporaryContact;
  const contactName =
    conversation?.participant_details?.[1]?.name?.split(" ")[0] ||
    temporaryContact?.name?.split(" ")[0] ||
    "Chat";
  const contactAvatar =
    conversation?.participant_details?.[1]?.profile_image_url ||
    temporaryContact?.profile_image_url;

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);

  // Clear temporary contact when conversation is loaded
  useEffect(() => {
    if (conversation && temporaryContact) {
      clearTemporaryContact(id as string);
    }
  }, [conversation, temporaryContact, id]);

  // Refresh conversations if current conversation is not found (e.g., newly created)
  useEffect(() => {
    if (!isLoading && !conversation && id) {
      console.log("Conversation not found, refreshing conversations...");
      refreshConversations();
    }
  }, [conversation, id, isLoading, refreshConversations]);

  // Subscribe to messages for this specific conversation
  useEffect(() => {
    if (!user?.id || !id) return;

    const handleMessage = (msg: any) => {
      // Handle typing indicators
      if (msg.type === "typing" && msg.sender_id !== user?.id) {
        setOtherUserTyping(true);
      } else if (msg.type === "stop_typing" && msg.sender_id !== user?.id) {
        setOtherUserTyping(false);
      }

      // Additional message handling specific to this conversation can go here
      // The global context already handles updating conversationMessages
      console.log("Received message in chat page:", msg.type);
    };

    subscribeToConversation(id as string, handleMessage);

    return () => {
      unsubscribeFromConversation(id as string);
    };
  }, [id, user?.id]);

  // Animate typing indicator dots
  useEffect(() => {
    let animationLoop: any;

    if (otherUserTyping) {
      const animateDots = () => {
        const animations = [
          Animated.sequence([
            Animated.timing(dot1Opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot1Opacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot2Opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Opacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot3Opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Opacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ];

        animationLoop = Animated.loop(Animated.stagger(200, animations), {
          resetBeforeIteration: true,
        });
        animationLoop.start();
      };

      animateDots();
    } else {
      // Stop animation and reset opacity
      if (animationLoop) {
        animationLoop.stop();
      }
      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.3);
      dot3Opacity.setValue(0.3);
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [otherUserTyping, dot1Opacity, dot2Opacity, dot3Opacity]);

  // Function to mark the last message as read
  const markLastMessageAsRead = async (messageId: string) => {
    try {
      // Send read receipt via WebSocket
      const readReceiptMessage = {
        type: "read_receipt" as const,
        conversation_id: id as string,
        sender_id: user?.id || "",
        data: {
          message_id: messageId,
        },
        timestamp: Math.floor(Date.now() / 1000),
      };

      sendWebSocketMessage(readReceiptMessage);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Helper function to check if message is already read by current user
  const isMessageReadByCurrentUser = (message: ChatMessage) => {
    return (
      message.read_by?.some((read) => read.user_id === (user?.id || "")) ||
      false
    );
  };

  // Mark messages as read when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (chatMessages.length > 0 && user?.id) {
        const lastMessage = chatMessages[chatMessages.length - 1];
        if (
          lastMessage &&
          lastMessage.sender_id !== user.id &&
          !isMessageReadByCurrentUser(lastMessage)
        ) {
          markLastMessageAsRead(lastMessage.id);
        }
      }
    }, [chatMessages, user?.id])
  );

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Send stop typing when leaving the chat
      sendStopTypingIndicator();
    };
  }, []);

  // Only show loading spinner when WebSocket context is initially loading
  // Allow chat interface to render even for new conversations that might not be in context yet
  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Conditional Header */}
      {isSearchMode ? (
        // Search Header
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.primary,
            paddingVertical: 16,
            paddingHorizontal: 12,
            gap: 12,
            paddingBottom: 32,
          }}
        >
          <View style={{ flex: 1 }}>
            <Input
              variant="outlined"
              placeholder="Search messages..."
              value={searchText}
              onChangeText={handleSearch}
              inputMode="text"
              inputContainerStyle={{
                backgroundColor: Colors.primaryLight,
                borderRadius: 25,
              }}
            />
          </View>

          <Pressable
            style={{
              padding: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={toggleSearchMode}
          >
            <MaterialIcons name="close" size={24} color="white" />
          </Pressable>
        </View>
      ) : (
        // Original Chat Header
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: Colors.primary,
            paddingVertical: 30,
            paddingBottom: 50,
          }}
        >
          <Pressable
            style={{
              padding: 12,
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 4,
            }}
            onPress={() => router.replace("/customer/messages")}
          >
            <MaterialIcons name="arrow-back-ios" size={16} color="white" />
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Avatar
              source={require("@/assets/images/icon.png")}
              borderWidth={1}
              borderColor="white"
              width={32}
              height={32}
            />
            <View
              style={{
                width: 1,
                height: 32,
                backgroundColor: "white",
                marginHorizontal: 4,
                borderRadius: 1,
              }}
            />
            <Avatar
              uri={contactAvatar}
              borderWidth={1}
              borderColor="white"
              width={32}
              height={32}
            />
            <Heading style={{ color: Colors.primaryLight }}>
              {contactName}
            </Heading>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              style={{
                padding: 12,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 4,
              }}
              onPress={toggleSearchMode}
            >
              <Ionicons name="search-outline" size={16} color="white" />
            </Pressable>
          </View>
        </View>
      )}
      {/* header end */}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              marginTop: -30,
              flex: 1,
              marginBottom: 80,
              padding: 16,
            }}
          >
            {chatMessages.map((message: ChatMessage, index) => {
              // Check if this message is the current search result
              const isCurrentSearchResult =
                searchResults.length > 0 &&
                searchResults[currentSearchIndex]?.id === message.id;

              return (
                <View
                  key={message.id ?? `temp-${index}`}
                  style={
                    isCurrentSearchResult
                      ? {
                          backgroundColor: "#ffefb86b",
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: "#e3c469ff",
                          padding: 4,
                          marginVertical: 2,
                        }
                      : {}
                  }
                >
                  <MessageCard
                    type={message.message_type}
                    messageItem={message}
                    isUser={message.sender_id === user?.id}
                    onOrderUpdate={handleOrderUpdate}
                  />
                </View>
              );
            })}

            {/* Typing Indicator */}
            {otherUserTyping && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginVertical: 4,
                }}
              >
                <Avatar
                  uri={conversation?.participant_details?.[1].profile_image_url}
                  width={24}
                  height={24}
                />
                <View
                  style={{
                    marginLeft: 8,
                    backgroundColor: "#f0f0f0",
                    borderRadius: 18,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Animated.View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#999",
                        marginRight: 4,
                        opacity: dot1Opacity,
                      }}
                    />
                    <Animated.View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#999",
                        marginRight: 4,
                        opacity: dot2Opacity,
                      }}
                    />
                    <Animated.View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#999",
                        opacity: dot3Opacity,
                      }}
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Conditional Footer */}
          {isSearchMode ? (
            // Search Navigation Footer
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 16,
                paddingHorizontal: 12,
                gap: 16,
                backgroundColor: Colors.primaryLight,
                height: 80,
              }}
            >
              <Pressable
                onPress={() => navigateSearchResult("up")}
                style={{
                  padding: 12,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 50,
                  opacity: searchResults.length > 0 ? 1 : 0.5,
                }}
                disabled={searchResults.length === 0}
              >
                <MaterialIcons
                  name="keyboard-arrow-up"
                  size={24}
                  color="black"
                />
              </Pressable>

              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: "white",
                  borderRadius: 20,
                  minWidth: 120,
                  alignItems: "center",
                }}
              >
                <Heading style={{ fontSize: 14 }}>
                  {searchResults.length > 0
                    ? `${currentSearchIndex + 1} of ${
                        searchResults.length
                      } results`
                    : searchText.trim()
                    ? "No results"
                    : "Search messages"}
                </Heading>
              </View>

              <Pressable
                onPress={() => navigateSearchResult("down")}
                style={{
                  padding: 12,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 50,
                  opacity: searchResults.length > 0 ? 1 : 0.5,
                }}
                disabled={searchResults.length === 0}
              >
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={24}
                  color="black"
                />
              </Pressable>
            </View>
          ) : (
            // Original Chat Input Footer
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                flexDirection: "row",
                alignItems: "center",
                paddingTop: 16,
                paddingHorizontal: 12,
                gap: 8,
                backgroundColor: Colors.primaryLight,
                height: 80,
              }}
            >
              <Feather name="plus" size={24} color="black" />

              <View style={{ flex: 1 }}>
                <Input
                  variant="outlined"
                  placeholder="Type message"
                  value={text}
                  onChangeText={handleTextChange}
                  inputMode="text"
                />
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {text.trim() ? (
                  <Pressable
                    onPress={handleSendTextMessage}
                    style={{
                      padding: 12,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 50,
                    }}
                  >
                    <Ionicons name="send" size={24} color="black" />
                  </Pressable>
                ) : (
                  <>
                    <Pressable
                      onPress={handlePickImage}
                      style={{
                        padding: 12,
                        backgroundColor: "#f0f0f0",
                        borderRadius: 50,
                      }}
                    >
                      <Feather name="camera" size={24} color="black" />
                    </Pressable>
                    <Pressable
                      onPress={handleRecordAudio}
                      style={{
                        padding: 12,
                        backgroundColor: "#f0f0f0",
                        borderRadius: 50,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={
                          recorderState.isRecording
                            ? "stop-circle-outline"
                            : "microphone-outline"
                        }
                        size={24}
                        color={recorderState.isRecording ? "red" : "black"}
                      />
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          )}
          {/* footer end */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({});
