import Colors from "@/styles/colors";
import { Body } from "@/styles/typography";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  delivery_date: string;
  uri?: string;
  openImageModal: () => void;
  goToBid: () => void;
}

const BidCard = ({ delivery_date, uri, openImageModal, goToBid }: Props) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardTop}>
        <Image
          style={styles.image}
          source={uri ? { uri } : require("@/assets/images/placeholder.png")}
          resizeMode="cover"
        />

        <Pressable style={styles.favourite} onPress={openImageModal}>
          <MaterialCommunityIcons
            name="arrow-expand-all"
            size={14}
            color={Colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.cardBottom}>
        <Body>Deliv. Date: {delivery_date}</Body>
        <TouchableOpacity onPress={goToBid}>
          <Body style={styles.bidBtn}>Bid</Body>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BidCard;

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
  },
  cardTop: {
    height: 110,
    backgroundColor: "red",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  favourite: {
    height: 20,
    width: 20,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    position: "absolute",
    bottom: 10,
    left: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  cardBottom: {
    flexDirection: "row",
    backgroundColor: Colors.primaryLight,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  bidBtn: {
    backgroundColor: Colors.primary,
    color: Colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
});
