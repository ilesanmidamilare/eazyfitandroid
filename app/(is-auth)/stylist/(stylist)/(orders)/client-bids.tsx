import ClientBidCard from "@/components/stylist/ClientBidCard";
import NodataToLoad from "@/components/stylist/NodataToLoad";
import { SearchContext } from "@/contexts/SearchContext";
import { useCustomerBidsForStylist } from "@/hooks/use-bids";
import { useStylistBidsTabRefetch } from "@/hooks/use-simple-tab-refetch";
import Colors from "@/styles/colors";
import { StyleRequest } from "@/types/stylist.types";
import { formatShortDate } from "@/utils/format";
import { router } from "expo-router";
import React, { useContext, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const SCREEN_WIDTH = width;

const ClientBids = () => {
  const { bids, isLoading, mutate } = useCustomerBidsForStylist();
  const { searchQuery } = useContext(SearchContext);

  // Stylist client bids tab refetch
  useStylistBidsTabRefetch(mutate, true);

  // Filter bids based on search query
  const filteredBids = useMemo(() => {
    if (!searchQuery.trim()) return bids;

    return bids?.filter((bid: StyleRequest) => {
      const query = searchQuery.toLowerCase();
      return formatShortDate(bid.delivery_date)?.toLowerCase().includes(query);
    });
  }, [bids, searchQuery]);

  const handleBidListing = ({ item }: { item: StyleRequest }) => {
    return (
      <View style={{ width: SCREEN_WIDTH / 2 - 26 }}>
        <ClientBidCard
          delivery_date={item.delivery_date?.slice(0, 10) as string}
          uri={item.style_images[0]?.url || ""}
          goToBid={() => {
            console.log("Opening Bid for Item:", item._id);
            router.push({
              pathname: "/stylist/orders/bid/[id]",
              params: { id: item._id.toString() },
            });
          }}
          openImageModal={() => {
            router.push({
              pathname: "/stylist/enlarge-image/[id]",
              params: {
                id: item._id.toString(),
                images: JSON.stringify(item.style_images),
              },
            });
          }}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const noResultsMessage = searchQuery.trim()
    ? `No bids found for "${searchQuery}"`
    : "No Bids at the moment";

  return (
    <View style={{ flex: 1 }}>
      {bids?.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 64,
          }}
        >
          <NodataToLoad body={noResultsMessage} />
        </View>
      ) : (
        <FlatList
          data={filteredBids}
          renderItem={handleBidListing}
          keyExtractor={(item) =>
            item._id?.toString() || Math.random().toString()
          }
          numColumns={2}
          contentContainerStyle={{
            paddingTop: 20,
            gap: 20,
            paddingBottom: 270,
          }}
          columnWrapperStyle={{ gap: 20 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ClientBids;

const styles = StyleSheet.create({});
