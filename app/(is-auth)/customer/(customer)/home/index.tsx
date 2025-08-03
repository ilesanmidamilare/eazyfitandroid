import CustomerStyleCard from "@/components/customer/CustomerStyleCard";
import CustomerStylistCard from "@/components/customer/CustomerStylistCard";
import UnscrollabeNav from "@/components/horizontal-nav/UnscrollabeNav";
import { useAllStyles, useFilteredStylists } from "@/hooks/use-browse";
import { useHomeTabRefetch } from "@/hooks/use-simple-tab-refetch";
import Colors from "@/styles/colors";
import { Body, Heading, Title } from "@/styles/typography";
import { BrowseStyle, BrowseStylists } from "@/types/browse.types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type QuickFilter = {
  id: string;
  title: string;
};

const quickFilters: QuickFilter[] = [
  {
    id: "all",
    title: "All stylists",
  },
  {
    id: "recommended",
    title: "Recommended Stylist",
  },
  // { id: "near", title: "Stylists near me" },
];

const styleFilters = [
  { id: "male", title: "Men" },
  { id: "female", title: "Women" },
];

const { width } = Dimensions.get("window");
const SCREEN_WIDTH = width;

const AllStylesPage = () => {
  const [limit, setLimit] = useState(4);
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>(
    quickFilters[0].id ?? null
  );
  const [styleFilter, setStyleFilter] = useState(styleFilters[0].id);

  // const {
  //   stylists,
  //   isLoading: isStylistsLoading,
  //   error: errorStylists,
  //   isLoadingMore,
  //   loadMore,
  //   hasMore,
  // } = usePaginatedStylists();
  const {
    stylists,
    isLoading: isStylistsLoading,
    error: errorStylists,
    isLoadingMore,
    loadMore,
    hasMore,
    mutate: mutatStylists,
  } = selectedId === "recommended"
    ? useFilteredStylists({ is_recommended: true }, { revalidateOnFocus: true })
    : useFilteredStylists({}, { revalidateOnFocus: true });
  // const {
  //   stylists: recommendedStylists,
  //   isLoading: isRecommendedStylistsLoading,
  //   error: errorRecommendedStylists,
  // } = useFilteredStylists({ page: 1, limit: 10 }, { is_recommended: true });
  const {
    styles,
    isLoading: isStylesLoading,
    error: errorStyles,
    mutate: mutateStyles,
  } = useAllStyles({ page: 1, limit: 10 });

  // Home tab refetch - using direct mutate calls
  useHomeTabRefetch(mutatStylists, mutateStyles, true);

  // const filteredStylists = () => {
  //   if (selectedId === "recommended") {
  //     return recommendedStylists;
  //   }
  //   return stylists;
  // };

  const renderQuickFilters: ListRenderItem<QuickFilter> = ({ item }) => {
    const isSelected = item.id === selectedId;
    const backgroundColor = isSelected ? Colors.primary : Colors.buttonLight;
    const textColor = isSelected ? Colors.primaryLight : Colors.primaryDark;
    const fontFamily = isSelected ? "SEMIBOLD" : "REGULAR";

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedId(item.id);
        }}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 20,
          marginRight: 16,
          backgroundColor,
        }}
      >
        <Body style={{ color: textColor, fontFamily: fontFamily }}>
          {item.title}
        </Body>
      </TouchableOpacity>
    );
  };

  const renderStylistsFooter = () => {
    const validStylists = Array.isArray(stylists)
      ? stylists.filter((item): item is BrowseStylists => item && item._id)
      : [];

    if (validStylists.length > 4 && limit < 5) {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 24,
          }}
        >
          <Pressable
            style={{
              backgroundColor: "#F3F4F6",
              padding: 10,
              paddingHorizontal: 30,
              borderRadius: 30,
            }}
            onPress={() => setLimit(10)}
          >
            <Body style={{ fontFamily: "SEMIBOLD", color: Colors.primary }}>
              View all
            </Body>
          </Pressable>
        </View>
      );
    }
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  };

  const renderStylists = ({ item }: { item: BrowseStylists }) => {
    if (!item || !item._id) {
      return null; // Skip rendering if item is null or missing _id
    }

    return (
      <View style={{ width: SCREEN_WIDTH / 2 - 26 }}>
        <CustomerStylistCard
          id={item._id}
          category={item.specialization}
          uri={item.profile_image_url}
          rating={item.review_count}
          stylist_name={`${item.last_name} ${item.first_name}`}
          onPress={() =>
            router.push({
              pathname: "/customer/stylist/[id]/portfolio",
              params: { id: item._id },
            })
          }
        />
      </View>
    );
  };

  const renderStyles = ({ item }: { item: BrowseStyle }) => {
    if (!item || !item._id) {
      return null; // Skip rendering if item is null or missing _id
    }

    return (
      <View style={{ width: SCREEN_WIDTH / 2 - 26 }}>
        <CustomerStyleCard item={item} />
      </View>
    );
  };

  const renderEmptyComponent = (text: string, height = 128) => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height,
      }}
    >
      <Heading>{text}</Heading>
    </View>
  );

  if (isStylistsLoading) {
    return (
      <View
        style={{
          flex: 1,
          height: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Body style={{ color: Colors.primary }}>Fetching all stylist...</Body>
      </View>
    );
  }

  if (errorStylists) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Body style={{ color: "red" }}>Error: {errorStylists}</Body>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: 100 }}>
      <View>
        <FlatList
          data={quickFilters}
          renderItem={renderQuickFilters}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View>
        <FlatList
          data={
            Array.isArray(stylists)
              ? stylists
                  .filter((item): item is BrowseStylists => item && item._id)
                  .slice(0, limit)
              : []
          }
          renderItem={renderStylists}
          keyExtractor={(item, index) =>
            item._id?.toString() || `stylist-${index}`
          }
          numColumns={2}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 24,
            gap: 20,
          }}
          columnWrapperStyle={{ gap: 20 }}
          ListEmptyComponent={() =>
            renderEmptyComponent("No stylists available")
          }
          ListFooterComponent={renderStylistsFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      </View>

      {/* show if not showing all */}
      {limit < 5 && (
        <View style={{ flex: 1, paddingTop: 38 }}>
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Title>Top Styles from our Stylists</Title>
              <Pressable
                onPress={() => {
                  router.push("/customer/top-styles");
                }}
              >
                <Heading
                  style={{ fontFamily: "MEDIUM", color: Colors.primary }}
                >
                  View all
                </Heading>
              </Pressable>
            </View>
          </View>

          <View style={{ paddingTop: 24 }}>
            <UnscrollabeNav
              NAV_ITEMS={styleFilters}
              selectedItem={styleFilter}
              onSelect={setStyleFilter}
            />
          </View>

          <View>
            <FlatList
              data={
                Array.isArray(styles)
                  ? styles
                      .filter((item): item is BrowseStyle => item && item._id)
                      .slice(0, 6)
                  : []
              }
              renderItem={renderStyles}
              keyExtractor={(item, index) =>
                item._id?.toString() || `style-${index}`
              }
              numColumns={2}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: 24,
                gap: 20,
              }}
              columnWrapperStyle={{ gap: 20, marginBottom: 16 }}
              ListEmptyComponent={() =>
                renderEmptyComponent("No styles available")
              }
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default AllStylesPage;

const styles = StyleSheet.create({});
