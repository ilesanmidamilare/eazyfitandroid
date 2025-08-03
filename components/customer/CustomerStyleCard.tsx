import { useToggleFavorite } from "@/hooks/use-customer";
import Colors from "@/styles/colors";
import { Body } from "@/styles/typography";
import { BrowseStyle } from "@/types/browse.types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

interface Props {
  item: BrowseStyle;
}

const CustomerStyleCard = ({ item }: Props) => {
  const router = useRouter();
  const [favorite, setFavourite] = useState(item.is_favorite || false);

  const { addToFavorites, removeFromFavorites } = useToggleFavorite();

  const handleToggleFavourite = async () => {
    let res;

    if (favorite) {
      res = await removeFromFavorites(item._id);
    } else {
      res = await addToFavorites(item._id);
    }
    if (res.success) {
      setFavourite(!favorite);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardTop}>
        <Image
          style={styles.image}
          source={
            item.images[0].url
              ? { uri: item.images[0].url }
              : require("@/assets/images/placeholder.png")
          }
          resizeMode="cover"
        />

        <Pressable style={styles.favourite} onPress={handleToggleFavourite}>
          <MaterialIcons
            name={favorite ? "favorite" : "favorite-border"}
            size={16}
            color={Colors.error}
          />
        </Pressable>

        <Pressable
          onPress={() => {
            router.push({
              pathname: "/customer/enlarge-image/[id]",
              params: {
                id: item._id,
                images: JSON.stringify(item.images),
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
        <View style={{ gap: 5 }}>
          <Body style={{ fontFamily: "SEMIBOLD" }}>{item.style_name}</Body>
          <Body>{item.category}</Body>
        </View>
        <Pressable
          style={styles.shareBtn}
          onPress={() => {
            router.push({
              pathname: "/customer/stylist/[id]/portfolio",
              params: {
                id: item.stylist_id,
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
  );
};

export default CustomerStyleCard;

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
  },

  favourite: {
    position: "absolute",
    top: 10,
    right: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    padding: 5,
    borderRadius: 50,
  },

  rating: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    padding: 3,
    paddingLeft: 8,
    paddingRight: 8,
  },

  shareBtn: {
    backgroundColor: "#E2EEE8",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  enlarge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: Colors.primaryLight,
    padding: 5,
    borderRadius: 50,
  },
});
