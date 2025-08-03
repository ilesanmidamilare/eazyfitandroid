import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import Constants from "expo-constants";

import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export interface PushNotificationState {
    expoPushToken?: Notifications.ExpoPushToken;
    notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true
        }),
    });

    const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken>();
    const [notification, setNotification] = useState<Notifications.Notification>();

    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                console.warn("Failed to get push token for push notification");
                return;
            }

            try {
                // Get project ID from Constants
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

                if (!projectId) {
                    console.warn("Project ID not found in expo config");
                    return;
                }

                token = await Notifications.getExpoPushTokenAsync({
                    projectId,
                });
            } catch (error) {
                // console.error("Error getting push token:", error);
                return;
            }
        } else {
            console.warn("Must use physical device for Push Notifications");
        }

        return token;
    }

    useEffect(() => {
        registerForPushNotificationsAsync()
            .then((token) => {
                if (token) {
                    console.log("📲 Expo Push Token:", token);
                    setExpoPushToken(token);
                } else {
                    console.warn("Failed to get push token");
                }
            })
            .catch((error) => {
                console.error("Error registering for push notifications:", error);
            });

        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log("📬 Notification received:", notification);
                setNotification(notification);
            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener((response) => {
                console.log("📬 Notification response received:", response);
            });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    return {
        expoPushToken,
        notification,
    };
};