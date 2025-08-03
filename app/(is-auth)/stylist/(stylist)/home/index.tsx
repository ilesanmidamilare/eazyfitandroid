import Button from "@/components/Button";
import HomeCard from "@/components/stylist/HomeCard";
import NodataToLoad from "@/components/stylist/NodataToLoad";
import StylistSearchBar from "@/components/StylistSearchBar";
import { useStylistStyles } from "@/hooks/use-stylist";
import { useStylistHomeTabRefetch } from "@/hooks/use-simple-tab-refetch";
import Colors from "@/styles/colors";
import { StylistStyles } from "@/types/stylist.types";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

const body: string =
  "No orders yet, kindly add styles to your portfolio to showcase to our customers.";

const { width } = Dimensions.get("window");
const SCREEN_WIDTH = width;

const Home: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [checkedOptions, setCheckedOptions] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  const { styles, mutate } = useStylistStyles({ page: 1, limit: 10 });

  // Stylist home tab refetch
  useStylistHomeTabRefetch(mutate, true);

  // Reset search when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setSearchText("");
      setCheckedOptions([]);
      setFilterVisible(false);
    }, [])
  );

  // Compute filtered styles directly - no useEffect needed!
  const filteredStyles = React.useMemo(() => {
    let filtered = styles;

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(
        (style: StylistStyles) =>
          style.style_name.toLowerCase().includes(searchText.toLowerCase()) ||
          style.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by selected categories
    if (checkedOptions.length > 0) {
      filtered = filtered.filter((style: StylistStyles) =>
        checkedOptions.includes(style.category)
      );
    }

    return filtered;
  }, [styles, searchText, checkedOptions]);

  const renderAllStylists: ListRenderItem<StylistStyles> = ({ item }) => (
    <View style={{ width: SCREEN_WIDTH / 2 - 26 }}>
      <HomeCard
        name={item.style_name}
        clothingType={item.category}
        uri={item.images[0]?.url}
        onPress={() => {
          router.push({
            pathname: "/stylist/enlarge-image/[id]",
            params: {
              id: item.id,
              images: JSON.stringify(item.images),
            },
          });
        }}
      />
    </View>
  );

  return (
    <View style={styleSheets.container}>
      <StylistSearchBar
        text={searchText}
        setText={setSearchText}
        checkedOptions={checkedOptions}
        setCheckedOptions={setCheckedOptions}
        visible={filterVisible}
        setVisible={setFilterVisible}
      />
      <View style={styleSheets.content}>
        {filteredStyles.length === 0 ? (
          <View style={styleSheets.centered}>
            <NodataToLoad
              body={
                searchText || checkedOptions.length > 0
                  ? "No styles match your search criteria. Try adjusting your filters."
                  : body
              }
            />
          </View>
        ) : (
          <FlatList
            data={filteredStyles}
            renderItem={renderAllStylists}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 20,
              gap: 20,
              paddingBottom: 20,
            }}
            columnWrapperStyle={{ gap: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={() => mutate()}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
          />
        )}
      </View>

      <View style={styleSheets.stickyButton}>
        <Button
          title="Complete Orders"
          backgroundColor={Colors.primary}
          fontFamily="MEDIUM"
          onPress={() => {
            router.push("/stylist/client-bids");
          }}
          marginRight={undefined}
          marginLeft={undefined}
          fontSize={undefined}
        />
      </View>
    </View>
  );
};

export default Home;

const styleSheets = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stickyButton: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "white",
  },
});
