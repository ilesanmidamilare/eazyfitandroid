import {
  createStyleApi,
  createStylistProfileApi,
  getStylistCompletedOrdersApi,
  getStylistOrdersApi,
  getStylistProfileApi,
  getStylistReviewsApi,
  getStylistStylesApi,
  updateStylistProfileApi,
} from "@/lib/api/stylist";
import { OrderStatus } from "@/types/stylist.types";
import { AxiosError } from "axios";
import { useState } from "react";
import useSWR from "swr";

// Hook to get stylist styles
export const useStylistStyles = (
  params: PaginationParams = { page: 1, limit: 10 }
) => {
  const { data, error, isLoading, mutate } = useSWR(
    [`stylist-styles`, params],
    () => getStylistStylesApi(params)
  );

  return {
    styles: data || [],
    error: error?.message || null,
    isLoading,
    mutate,
  };
};

// Hook to get stylist profile
export const useStylistProfile = () => {
  const { data, error, isLoading, mutate } = useSWR("stylist-profile", () =>
    getStylistProfileApi()
  );

  return {
    profile: data || null,
    error: error?.message || null,
    isLoading,
    mutate,
  };
};

/**
 * Hook to get stylist orders
 */
export const useStylistOrders = (params: {
  status: OrderStatus.IN_PROGRESS;
}) => {
  const { data, error, isLoading, mutate } = useSWR(
    [`stylist-orders`, params],
    () => getStylistOrdersApi(params)
  );

  return {
    orders: data || [],
    error: error?.message || null,
    isLoading,
    mutate,
  };
};

/**
 * Hook to get stylist completed orders
 */
export const useStylistCompletedOrders = (params: {
  status: OrderStatus.COMPLETED;
}) => {
  const { data, error, isLoading, mutate } = useSWR(
    [`stylist-orders`, params],
    () => getStylistCompletedOrdersApi(params)
  );

  return {
    orders: data || [],
    error: error?.message || null,
    isLoading,
    mutate,
  };
};

/**
 * Hook to create a stylist profile
 */
export const useCreateStylistProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useStylistProfile();

  const createStylistProfile = async (payload: FormData) => {
    try {
      setIsLoading(true);

      const response = await createStylistProfileApi(payload);

      await mutate();

      return { success: true, data: response };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage =
          response?.data?.error || "Failed to create stylist profile";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { createStylistProfile, isLoading };
};

// Hook to create a new style
export const useCreateStyle = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useStylistStyles();

  const createStyle = async (payload: FormData) => {
    try {
      setIsLoading(true);

      const response = await createStyleApi(payload);

      await mutate();

      return { success: true, data: response };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Failed to create style";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { createStyle, isLoading };
};

// Hook to update stylist profile
export const useUpdateStylistProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useStylistProfile();

  const updateStylistProfile = async (payload: FormData) => {
    try {
      setIsLoading(true);

      const response = await updateStylistProfileApi(payload);

      await mutate();

      return { success: true, data: response };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage =
          response?.data?.error || "Failed to update profile";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStylistProfile, isLoading };
};

// Hook to get stylist reviews
export const useStylistReviews = (
  stylistId: string,
  params: PaginationParams = { page: 1, limit: 10 }
) => {
  const { data, error, isLoading, mutate } = useSWR(
    [`stylist-reviews`, stylistId, params],
    () => getStylistReviewsApi(stylistId, params)
  );

  return {
    reviews: data || [],
    error: error?.message || null,
    isLoading,
    mutate,
  };
};
