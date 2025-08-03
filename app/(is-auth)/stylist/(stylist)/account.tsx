import Colors from "@/styles/colors";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReviewCarousel } from "@/components/carousel/ReviewCarousel";
import AccountAddress from "@/components/form/AccountAddress";
import AccountProfileHeader from "@/components/form/AccountProfileHeader";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useStylistAccountTabRefetch } from "@/hooks/use-simple-tab-refetch";
import {
  useStylistProfile,
  useStylistReviews,
  useUpdateStylistProfile,
} from "@/hooks/use-stylist";
import { layout } from "@/styles/layout";
import { Body, Heading } from "@/styles/typography";
import { Feather } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const commentsList: any = [
  // {
  //   comment:
  //     "I deal wth female outfit and other ready-made you could think of. ",
  //   name: "Ola",
  //   country: "Nigeria",
  //   id: "1",
  // },
  // {
  //   comment:
  //     "I deal wth female outfit and other ready-made you could think of. ",
  //   name: "Ola",
  //   country: "Nigeria",
  //   id: "2",
  // },
  // {
  //   comment:
  //     "I deal wth female outfit and other ready-made you could think of. ",
  //   name: "Ola",
  //   country: "Nigeria",
  //   id: "3",
  // },
];

const { width } = Dimensions.get("window");
const itemWidth = width;

export const Account = () => {
  const router = useRouter();
  const { user } = useCurrentUser();

  const { profile, mutate } = useStylistProfile();
  const { logout } = useLogout();

  const { updateStylistProfile, isLoading: isDeliveryDayLoading } =
    useUpdateStylistProfile();
  const { reviews, mutate: mutateReviews } = useStylistReviews(user?.id || "");

  // Account tab refetch
  useStylistAccountTabRefetch(mutate, mutateReviews, true);

  const [isDeliveryDayDisabled, setIsDeliveryDayDisabled] = useState(false);
  const deliveryDayInputRef = useRef<TextInput>(null);
  const [deliveryDayInput, setDeliveryDayInput] = useState(
    profile?.delivery_days || ""
  );

  const handleDeliveryDayUpdate = async () => {
    if (deliveryDayInput.trim() === "") {
      alert("Please enter a valid delivery day.");
      return;
    }

    const formData = new FormData();
    formData.append("delivery_days", deliveryDayInput);

    const res = await updateStylistProfile(formData);

    if (res?.success) {
      setIsDeliveryDayDisabled(true);
      Alert.alert("Success", "Delivery day updated successfully!");
    } else {
      Alert.alert("Failed", res?.error || "Failed to update delivery day.");
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: Colors.primaryLight, flex: 1 }}>
      <AccountProfileHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[layout.container, { paddingVertical: 32 }]}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          <View style={{ gap: 16 }}>
            <View style={{ backgroundColor: Colors.primaryLight }}>
              <View
                style={{
                  padding: 10,
                  borderRadius: 100,
                  backgroundColor: "#F9FAFB",
                }}
              >
                <Body style={{ fontFamily: "MEDIUM", color: "#4D5761" }}>
                  Account
                </Body>
              </View>
            </View>

            {/* address */}
            <AccountAddress />

            {/* bank account */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ gap: 10 }}>
                <Heading style={{ fontFamily: "SEMIBOLD" }}>
                  Your Account Details
                </Heading>
                {user?.sub_account && (
                  <Body style={{ color: Colors.primaryDark }}>
                    {user?.sub_account?.account_name} -{" "}
                    {user?.sub_account?.account_number} -{" "}
                    {user?.sub_account?.bank_name}
                  </Body>
                )}
                {!user?.sub_account && (
                  <Body style={{ color: Colors.primaryDark }}>
                    No bank account linked yet
                  </Body>
                )}
              </View>

              {!user?.sub_account ? (
                <Pressable
                  onPress={() => {
                    router.push("/stylist/set-account");
                  }}
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <Body
                    style={{ color: Colors.primary, fontFamily: "SEMIBOLD" }}
                  >
                    Edit
                  </Body>
                  <Feather name="edit-3" size={16} color={Colors.primary} />
                </Pressable>
              ) : (
                ""
              )}
            </View>

            {/* delivery day */}
            <View>
              <Heading style={{ fontFamily: "SEMIBOLD" }}>Delivery day</Heading>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  ref={deliveryDayInputRef}
                  placeholder={"3 - 7 Days"}
                  style={{
                    fontFamily: "REGULAR",
                    color: Colors.primaryDark,
                    fontSize: 12,
                    flex: 1,
                  }}
                  placeholderTextColor={Colors.inputPlaceholder}
                  editable={!isDeliveryDayDisabled}
                  onChangeText={setDeliveryDayInput}
                  value={deliveryDayInput}
                />

                {isDeliveryDayLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : isDeliveryDayDisabled ? (
                  <Pressable
                    onPress={() => {
                      setIsDeliveryDayDisabled(!isDeliveryDayDisabled);
                      setTimeout(() => {
                        deliveryDayInputRef.current?.focus();
                      }, 100);
                    }}
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <Body
                      style={{ color: Colors.primary, fontFamily: "SEMIBOLD" }}
                    >
                      Edit
                    </Body>
                    <Feather name="edit-3" size={16} color={Colors.primary} />
                  </Pressable>
                ) : (
                  <Pressable
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      setIsDeliveryDayDisabled(!isDeliveryDayDisabled);
                      handleDeliveryDayUpdate();
                    }}
                  >
                    <Body
                      style={{ fontFamily: "SEMIBOLD", color: Colors.primary }}
                    >
                      Update
                    </Body>
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          <Body
            style={{
              marginBottom: 10,
              marginTop: 30,
              fontFamily: "SEMIBOLD",
            }}
          >
            Reviews from customers
          </Body>

          <View style={{ flex: 1, marginBottom: 20 }}>
            {reviews?.length === 0 ? (
              <Body style={{ textAlign: "center", color: Colors.primaryDark }}>
                No reviews yet
              </Body>
            ) : (
              <ReviewCarousel reviews={commentsList} />
            )}
          </View>

          <View
            style={{
              padding: 10,
              borderRadius: 100,
              backgroundColor: "#F9FAFB",
            }}
          >
            <Body>Security</Body>
          </View>

          <Pressable
            style={{ gap: 16, marginBlock: 16 }}
            onPress={() => {
              Linking.openURL(process.env.EXPO_PUBLIC_SUPPORT_LINK || "");
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ gap: 10 }}>
                <Heading style={{ fontFamily: "SEMIBOLD" }}>Support</Heading>
                <Body>wa/link907333267</Body>
              </View>

              <View
                style={{
                  padding: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={14}
                  color={Colors.backArrow}
                />
              </View>
            </View>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onPress={() => router.push("/pages/stylist/terms-and-condition")}
            >
              <Heading style={{ fontFamily: "SEMIBOLD" }}>
                Terms and Conditions
              </Heading>
              <View
                style={{
                  padding: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={14}
                  color={Colors.backArrow}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/stylist/change-password")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ gap: 10 }}>
                <Heading style={{ fontFamily: "SEMIBOLD" }}>
                  Change Password
                </Heading>
                <Body>Changle your password at anytime</Body>
              </View>

              <View
                style={{
                  padding: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={14}
                  color={Colors.backArrow}
                />
              </View>
            </Pressable>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onPress={() => {
                logout();
                router.replace("/auth/signin");
              }}
            >
              <Heading style={{ fontFamily: "SEMIBOLD" }}>Logout</Heading>
              <View
                style={{
                  padding: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="logout" size={14} color={Colors.error} />
              </View>
            </Pressable>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  profileBg: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 40,
    gap: 5,
    padding: 16,
  },

  usernameWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  referAndShareWrapper: {
    padding: 20,
    paddingBottom: 30,
    paddingTop: 30,
    borderRadius: 32,
    marginVertical: 20,
    backgroundColor: "#F3F4F6",
  },

  shareWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 9,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 100,
    marginTop: 10,
    backgroundColor: Colors.primaryLight,
  },

  referAFriendWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 9,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 100,
    backgroundColor: Colors.primaryLight,
    marginBottom: 30,
  },
});
