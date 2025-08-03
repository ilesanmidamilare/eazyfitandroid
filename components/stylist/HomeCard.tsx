import Colors from "@/styles/colors";
import { Subheading } from "@/styles/typography";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

type HomeCardProps = {
  name: string;
  clothingType: string;
  uri?: string;
  onPress: () => void;
};

const HomeCard: React.FC<HomeCardProps> = ({
  name,
  clothingType,
  uri,
  onPress,
}) => {
  const imageSource: ImageSourcePropType = uri
    ? { uri }
    : require("@/assets/images/placeholder.png");

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardTop}>
        <Image style={styles.image} source={imageSource} resizeMode="cover" />

        <View style={styles.enlarge}>
          <Feather name="edit-3" size={16} color={Colors.primary} />
        </View>

        <Pressable style={styles.favourite} onPress={onPress}>
          <MaterialCommunityIcons
            name="arrow-expand-all"
            size={14}
            color={Colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.cardBottom}>
        <Subheading style={{ fontFamily: "SEMIBOLD" }}>{name}</Subheading>
        <Subheading style={{ borderRadius: 100 }}>{clothingType}</Subheading>
      </View>
    </View>
  );
};

export default HomeCard;

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
  image: {
    width: "100%",
    height: "100%",
  },
  enlarge: {
    height: 20,
    width: 20,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    position: "absolute",
    top: 10,
    right: 10,
    justifyContent: "center",
    alignItems: "center",
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
  cardBottom: {
    backgroundColor: Colors.primaryLight,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 5,
  },
});
