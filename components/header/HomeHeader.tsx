import { useCurrentUser } from "@/hooks/use-auth";
import Sizes from "@/styles/size";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Title } from "../../styles/typography";
import Avatar from "../Avatar";

interface Props {
  title: string;
  onPress?: () => void;
}

export const HomeHeader = ({ title, onPress }: Props) => {
  const { user } = useCurrentUser();
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Title>Hi, {title}</Title>
      <View style={styles.avatarAndNotificationIconWrapper}>
        {/* <Link href={href as LinkProps["href"]} push asChild style={styles.notificationWrapper}>
            <Ionicons name="notifications-outline" size={20} color='black' />
        </Link> */}
        <Pressable onPress={onPress} style={styles.notificationWrapper}>
          <Ionicons name="notifications-outline" size={20} color="black" />
        </Pressable>
        <Avatar
          uri={user?.profile_image_url}
          onPress={() => {
            if (user?.user_type === "customer") {
              router.push("/customer/account");
            } else if (user?.user_type === "stylist") {
              router.push("/stylist/account");
            }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  NavBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  NavBarTitle: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  avatarAndNotificationIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Sizes.spacing.md,
  },

  notificationWrapper: {
    padding: Sizes.spacing.xs,
    // backgroundColor:'red'
  },
});
