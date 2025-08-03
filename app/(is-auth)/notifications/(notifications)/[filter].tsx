import { useNotifications } from "@/hooks/use-notifications";
import Colors from "@/styles/colors";
import { Body, Heading } from "@/styles/typography";
import { NotificationItem } from "@/types/notification.types";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterItem {
  id: number;
  title: string;
  filterWord: "all" | "order" | "offer";
}

const filterNotifications = (
  notifications: NotificationItem[],
  filterType: FilterItem["filterWord"] = "all"
): NotificationItem[] => {
  switch (filterType) {
    case "order":
      return notifications.filter(
        (n) => n.type === "order_offer" || n.type === "order_status"
      );
    case "offer":
      return notifications.filter(
        (n) => n.type === "bid_offer" || n.type === "bid_status"
      );
    default:
      return notifications;
  }
};

const NotificationsList = () => {
  const { filter } = useLocalSearchParams();
  const [parsedData, setParsedData] = useState<NotificationItem[]>([]);

  const { isLoading, notifications, unreadCount, error } = useNotifications();

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      try {
        setParsedData(
          filterNotifications(notifications, filter as FilterItem["filterWord"])
        );
      } catch (err) {
        console.error("Failed to parse data:", err);
      }
    }
  }, [notifications]);

  const renderNotificationsList = ({ item }: { item: NotificationItem }) => {
    const backgroundColor = item.isRead ? "white" : Colors.notifications;
    const opacity = item.isRead ? 0.5 : 1;

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/notifications/notification/[id]",
            params: { id: item.id },
          });
        }}
        style={[styles.notificationContainer, { backgroundColor, opacity }]}
      >
        <Heading style={{ fontFamily: "SEMIBOLD" }}>{item.title}</Heading>
        <Body>{`${item.message.slice(0, 150)}...`}</Body>
      </TouchableOpacity>
    );
  };

  if (isLoading)
    return (
      <View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  if (error)
    return (
      <View>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </View>
    );

  return (
    <View>
      {parsedData.length > 0 ? (
        <FlatList
          data={parsedData}
          renderItem={renderNotificationsList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 20 }}
        />
      ) : (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: 100,
          }}
        >
          <Body style={{ fontSize: 16 }}>No notifications</Body>
        </View>
      )}
    </View>
  );
};

export default NotificationsList;

const styles = StyleSheet.create({
  quickFiltersWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 40,
  },
  item: {
    padding: 10,
    borderRadius: 100,
    paddingLeft: 40,
    paddingRight: 40,
    width: "100%",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 10,
    fontFamily: "REGULAR",
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationTitle: {
    textAlign: "center",
    width: "100%",
  },
  count: {
    backgroundColor: "red",
  },
  notificationContainer: {
    borderRadius: 8,
    padding: 10,
  },
});
