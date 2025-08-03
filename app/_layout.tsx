import { EmailVerificationProvider } from "@/contexts/EmailVerificationContext";
import { UserProvider } from "@/contexts/UserContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { setDeviceToken } from "@/lib/storage/secure-store";
import Colors from "@/styles/colors";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { isDevice } from "expo-device";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  AppState,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SWRConfig } from "swr";

const RootLayout = () => {
  const [loaded, error] = useFonts({
    BOLD: require("../assets/fonts/ClashDisplay-Bold.otf"),
    EXTRALIGHT: require("../assets/fonts/ClashDisplay-Extralight.otf"),
    LIGHT: require("../assets/fonts/ClashDisplay-Light.otf"),
    MEDIUM: require("../assets/fonts/ClashDisplay-Medium.otf"),
    REGULAR: require("../assets/fonts/ClashDisplay-Regular.otf"),
    SEMIBOLD: require("../assets/fonts/ClashDisplay-Semibold.otf"),
  });

  const { expoPushToken } = usePushNotifications();
  useEffect(() => {
    if (expoPushToken?.data) {
      setDeviceToken(expoPushToken.data);
    }
  }, [expoPushToken]);

  if (isDevice) {
    useEffect(() => {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        offlineAccess: true,
        profileImageSize: 150,
        scopes: ["profile", "email"],
      });
    }, []);
  }

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Show loading screen while checking auth or loading fonts
  if (!loaded && !error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.primaryLight,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        revalidateOnMount: true,
        revalidateOnFocus: true, // Enable focus revalidation for tab switching
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 1000, // Reduce deduping interval for better tab responsiveness
        focusThrottleInterval: 2000, // Reduce throttle for faster tab response
        refreshInterval: 0,
        errorRetryInterval: 5000,
        isVisible: () => {
          return true;
        },
        initFocus(callback) {
          let appState = AppState.currentState;

          const onAppStateChange = (
            nextAppState: import("react-native").AppStateStatus
          ) => {
            /* If it's resuming from background or inactive mode to active one */
            if (
              appState.match(/inactive|background/) &&
              nextAppState === "active"
            ) {
              callback();
            }
            appState = nextAppState;
          };

          // Subscribe to the app state change events
          const subscription = AppState.addEventListener(
            "change",
            onAppStateChange
          );

          return () => {
            subscription.remove();
          };
        },
      }}
    >
      <StatusBar barStyle={"dark-content"} />

      <UserProvider>
        <EmailVerificationProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </EmailVerificationProvider>
      </UserProvider>
    </SWRConfig>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});
