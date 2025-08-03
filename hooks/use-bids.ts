import { createBidByCustomerApi, createOfferByStylistApi, getBidDetailsApi, getCustomerBidsForStylistApi } from "@/lib/api/bids";
import { AxiosError } from "axios";
import { useState } from "react";
import useSWR from "swr";

// Hook to get customer bids
export const useCustomerBidsForStylist = (
  params: PaginationParams = { page: 1, limit: 10 }
) => {
  const { data, error, isLoading, mutate } = useSWR(
    [`customer-bids`, params],
    () => getCustomerBidsForStylistApi(params)
  );

  return {
    bids: data || [],
    error: error?.message || null,
    isLoading,
    mutate,
  };
};

export const useBidDetails = (bidId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    [`bid-details`, bidId],
    () => getBidDetailsApi(bidId)
  );

  return {
    bid: data || null,
    error: error?.message || null,
    isLoading,
    mutate,
  };
};

export const useCreateBid = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createBidByCustomer = async (data: FormData) => {
    try {
      setIsLoading(true);
      const response = await createBidByCustomerApi(data);
      return { success: true, data: response };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Bid creation failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { createBidByCustomer, isLoading }
}

export const useCreateOfferByStylist = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createOfferByStylist = async (bid_id: string, payload: { customer_id: string, style_id: string, price: number, delivery_date: string }) => {
    try {
      setIsLoading(true);
      const response = await createOfferByStylistApi(bid_id, payload);
      return { success: true, data: response };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Offer creation failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { createOfferByStylist, isLoading }
}