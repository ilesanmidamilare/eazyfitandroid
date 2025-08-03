import NoData from "@/components/customer/Nodata";
import TitleHeader from "@/components/header/TitleHeader";
import { useMyStyles } from "@/hooks/use-customer";
import Colors from "@/styles/colors";
import { layout } from "@/styles/layout";
import { Body } from "@/styles/typography";
import { MyStyles } from "@/types/customer.types";
import { formatShortDate } from "@/utils/format";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const text =
  "You've not added any style yet. Explore our styles with the button below.";

const { width } = Dimensions.get("window");
const SCREEN_WIDTH = width;

const MyStylesPage = () => {
  const { isLoading, myStyles, error } = useMyStyles();

  const renderMyStyles = ({ item }: { item: MyStyles }) => {
    return (
      <View style={{ width: SCREEN_WIDTH / 2 - 26 }}>
        <View style={styles.cardContainer}>
          <View style={styles.cardTop}>
            <Image
              style={styles.image}
              source={{ uri: item.style_images[0].url }}
              alt="Style Image"
              defaultSource={require("@/assets/images/placeholder.png")}
              resizeMode="cover"
            />

            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/customer/enlarge-image/[id]",
                  params: {
                    id: item.style_id,
                    images: JSON.stringify(item.style_images),
                  },
                });
              }}
            >
              <MaterialCommunityIcons
                name="arrow-expand-all"
                size={14}
                color={Colors.primary}
                style={styles.enlarge}
              />
            </Pressable>
          </View>

          <View style={styles.cardBottom}>
            <View>
              <Body>Delivery date:</Body>
              <Body style={{ fontFamily: "MEDIUM" }}>
                {formatShortDate(item.delivery_date)}
              </Body>
            </View>
            <Pressable
              style={styles.shareBtn}
              onPress={() => {
                router.push({
                  pathname: "/customer/my-styles/[id]/offers",
                  params: {
                    id: item._id,
                  },
                });
              }}
            >
              <MaterialCommunityIcons
                name="arrow-top-right-thin"
                size={16}
                color={Colors.primary}
              />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading)
    return (
      <PageWrapper>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </PageWrapper>
    );
  if (error)
    return (
      <PageWrapper>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </PageWrapper>
    );
  if (!myStyles || myStyles.length === 0)
    return (
      <PageWrapper>
        <NoData
          text={text}
          onPress={() => router.push("/customer/top-styles")}
        />
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <View>
        <FlatList
          data={myStyles}
          renderItem={renderMyStyles}
          keyExtractor={(item) => item._id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 20,
            gap: 20,
            paddingBottom: 210,
          }}
          columnWrapperStyle={{ gap: 20 }}
        />
      </View>
    </PageWrapper>
  );
};

const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <SafeAreaView style={layout.container}>
      <TitleHeader
        title={"My Styles"}
        backArrow
        onPress={() => router.back()}
      />
      {/* <SearchBar /> */}
      {children}
    </SafeAreaView>
  );
};

export default MyStylesPage;

const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: "black",
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    backgroundColor: "red",
  },

  cardTop: {
    height: 110,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    backgroundColor: "green",
  },

  cardBottom: {
    flexDirection: "row",
    height: 57,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "space-between",
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 5,
  },

  favourite: {
    borderRadius: 10,
    position: "absolute",
    top: 10,
    right: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  enlarge: {
    position: "absolute",
    bottom: 10,
    left: 10,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  shareBtn: {
    backgroundColor: "#E2EEE8",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
});
