import OfferCard from "@/components/customer/OfferCard";
import TitleHeader from "@/components/header/TitleHeader";
import { useMyStylesOffers } from "@/hooks/use-customer";
import Colors from "@/styles/colors";
import { layout } from "@/styles/layout";
import { MyStylesOffer } from "@/types/customer.types";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const SCREEN_WIDTH = width;

const Offers = () => {
  const { id } = useLocalSearchParams();

  const { offers, error, isLoading } = useMyStylesOffers(id as string);

  const renderOffers = ({ item }: { item: MyStylesOffer }) => {
    return (
      <View style={{ width: SCREEN_WIDTH / 2 - 26 }}>
        <OfferCard
          rating={item.stylist?.rating || "0"}
          deliveryDays={`${item.stylist?.delivery_days || "0"} days`}
          location={item.stylist?.location || "N/A"}
          price={item.offered_amount}
          stylistName={item.stylist?.name || "Unknown"}
          onChatPressBtn={() =>
            router.push({
              pathname: "/customer/messages/[id]",
              params: { id: item.stylist_id },
            })
          }
        />
      </View>
    );
  };

  if (isLoading)
    return (
      <SafeAreaView style={layout.container}>
        <TitleHeader title={"Offers"} backArrow onPress={() => router.back()} />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  if (error)
    return (
      <SafeAreaView style={layout.container}>
        <TitleHeader title={"Offers"} backArrow onPress={() => router.back()} />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "red" }}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  if (!offers || offers.length === 0)
    return (
      <SafeAreaView style={layout.container}>
        <TitleHeader title={"Offers"} backArrow onPress={() => router.back()} />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: Colors.primaryGray,
            }}
          >
            No offers available for this style.
          </Text>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={layout.container}>
      <TitleHeader title={"Offers"} backArrow onPress={() => router.back()} />

      <View style={{ marginTop: 20 }}>
        <FlatList
          data={offers}
          renderItem={renderOffers}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 20,
            gap: 20,
            paddingBottom: 70,
          }}
          columnWrapperStyle={{ gap: 20 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Offers;

const styles = StyleSheet.create({});
