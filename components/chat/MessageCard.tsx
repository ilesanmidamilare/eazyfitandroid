import { ChatMessage, MessageType } from "@/types/chat.types";
import { formatShortTime } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { VideoView, useVideoPlayer } from "expo-video";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import ChatOrderCard from "./ChatOrderCard";

interface Props {
  type: MessageType;
  isUser: boolean;
  messageItem: ChatMessage;
  onOrderUpdate?: () => void;
}

const MessageCard = ({ type, isUser, messageItem, onOrderUpdate }: Props) => {
  // Initialize audio player with the file URL
  const audioPlayer = useAudioPlayer({ uri: messageItem.file_url ?? "" });

  // Setup video player for video messages
  const player = useVideoPlayer(messageItem.file_url || "");

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.otherMessage,
      ]}
    >
      {type === "text" && (
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.otherMessageText,
          ]}
        >
          {messageItem.content}
        </Text>
      )}

      {type === "file" && messageItem.file_url && (
        <View
          style={[
            styles.imageMessage,
            isUser ? styles.userMessageText : styles.otherMessageText,
          ]}
        >
          <Image
            source={{ uri: messageItem.file_url }}
            style={[
              styles.messageImage,
              { borderRadius: 16, overflow: "hidden" },
            ]}
          />
        </View>
      )}

      {type === "audio" && messageItem.file_url && (
        <View
          style={[
            styles.voiceMessage,
            isUser ? styles.userMessageText : styles.otherMessageText,
          ]}
        >
          <Pressable
            style={styles.playButton}
            onPress={() => {
              audioPlayer.playing ? audioPlayer.pause() : audioPlayer.play();
            }}
          >
            <Ionicons
              name={audioPlayer.playing ? "pause" : "play"}
              size={16}
              color="white"
            />
          </Pressable>
          <Text
            style={[
              styles.voiceDuration,
              isUser ? styles.userMessageText : styles.otherMessageText,
            ]}
          >
            Audio message
          </Text>
        </View>
      )}

      {type === "video" && messageItem.file_url && (
        <View
          style={[
            styles.videoContainer,
            isUser ? styles.userMessageText : styles.otherMessageText,
          ]}
        >
          <VideoView
            player={player}
            style={styles.video}
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>
      )}

      {type === "order" && messageItem.order && (
        <ChatOrderCard order={messageItem.order} onOrderUpdate={onOrderUpdate} />
      )}

      <Text style={[styles.timestamp, !isUser ? { textAlign: "left" } : {}]}>
        {formatShortTime(messageItem.created_at)}
      </Text>
    </View>
  );
};

export default MessageCard;

const styles = StyleSheet.create({
  videoContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    marginTop: 8,
  },
  video: {
    width: 200,
    height: 150,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2d5a3d",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#d4a574",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "90%",
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  userMessageText: {
    backgroundColor: "#2d5a3d",
    color: "#fff",
    borderTopRightRadius: 0,
  },
  otherMessageText: {
    backgroundColor: "#F3F4F6",
    color: "#333",
    borderTopLeftRadius: 0,
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    textAlign: "right",
  },
  imageMessage: {
    backgroundColor: "#2d5a3d",
    borderRadius: 16,
    overflow: "hidden",
    padding: 8,
  },
  messageImage: {
    width: 200,
    height: 150,
    resizeMode: "cover",
  },
  imageMessageText: {
    color: "#fff",
    fontSize: 14,
    padding: 12,
  },
  voiceMessage: {
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 200,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2d5a3d",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    height: 20,
  },
  waveBar: {
    width: 2,
    backgroundColor: "#2d5a3d",
    marginHorizontal: 1,
    borderRadius: 1,
  },
  voiceDuration: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 8,
  },
  orderDetails: {
    backgroundColor: "#e8f5e8",
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 14,
    color: "#666",
  },
  orderValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#2d5a3d",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  declineButton: {
    backgroundColor: "#ffd700",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  declineButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  addButton: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  iconButton: {
    marginLeft: 8,
  },
});
