import apiClient from "./api-client";

export const getCustomerBidsForStylistApi = async (
  params: PaginationParams = { page: 1, limit: 10 }
) => {
  const response = await apiClient.get("/bids/stylist", {
    params,
  });
  return response.data;
};

export const getBidDetailsApi = async (bidId: string) => {
  const response = await apiClient.get(`/bids/customer/${bidId}`);
  return response.data;
};

export const createBidByCustomerApi = async (
  data: FormData
) => {
  const response = await apiClient.post("/bids/customer", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export const createOfferByStylistApi = async (bid_id: string, payload: { customer_id: string, style_id: string, price: number, delivery_date: string }) => {
  const response = await apiClient.post(`/bids/stylist/offers/${bid_id}`, payload);
  return response.data;
}