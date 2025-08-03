import { OrderStatus } from "@/types/stylist.types";
import apiClient from "./api-client";

export const getStylistStylesApi = async (
  params: PaginationParams = { page: 1, limit: 10 }
) => {
  const response = await apiClient.get("/stylist/styles", {
    params,
  });
  return response.data;
};

export const createStyleApi = async (payload: FormData) => {
  const response = await apiClient.post("/stylist/styles", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const createStylistProfileApi = async (payload: FormData) => {
  const response = await apiClient.post("/stylist/profile", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getStylistProfileApi = async () => {
  const response = await apiClient.get("/stylist/profile");
  return response.data;
};

export const updateStylistProfileApi = async (payload: FormData) => {
  const response = await apiClient.put("/stylist/profile", payload);
  return response.data;
};

export const getStylistReviewsApi = async (
  stylistId: string,
  params: PaginationParams = { page: 1, limit: 10 }
) => {
  const response = await apiClient.get(`/stylists/${stylistId}/reviews`, {
    params,
  });
  return response.data;
};

export const getStylistOrdersApi = async (params: {
  status: OrderStatus.IN_PROGRESS;
}) => {
  const response = await apiClient.get("orders/all", {
    params,
  });
  return response.data;
};

export const getStylistCompletedOrdersApi = async (params: {
  status: OrderStatus.COMPLETED;
}) => {
  const response = await apiClient.get("orders/all", {
    params,
  });
  return response.data;
};
