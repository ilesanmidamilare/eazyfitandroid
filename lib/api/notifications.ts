import { NotificationResponse } from "@/types/notification.types";
import apiClient from "./api-client";

export const getNotificationsApi = async (
    params: { page?: number; limit?: number } = { page: 1, limit: 20 }
) => {
    const response = await apiClient.get<NotificationResponse>("/notifications", {
        params,
    });
    return response.data;
}

export const markNotificationAsReadApi = async (id: string) => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
}

export const markAllNotificationsAsReadApi = async () => {
    const response = await apiClient.put("/notifications/read-all");
    return response.data;
}

export const deleteNotificationApi = async (id: string) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
}