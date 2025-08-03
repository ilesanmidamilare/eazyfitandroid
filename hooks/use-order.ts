import { createOrderApi, getBanksApi, getOrderByIdApi, getOrdersApi } from "@/lib/api/order";
import { Order } from "@/types/order.types";
import { AxiosError } from "axios";
import { useState } from "react";
import useSWR from "swr";

export const useOrder = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createOrder = async (payload: Omit<Order, "id" | "created_at">) => {
        try {
            setIsLoading(true);
            const response = await createOrderApi(payload);
            return { success: true, data: response };
        } catch (err) {
            if (err instanceof AxiosError) {
                const { response } = err;
                const errorMessage = response?.data?.error || "Order creation failed";
                return { success: false, error: errorMessage };
            }
        } finally {
            setIsLoading(false);
        }
    }

    const getOrders = (params?: { status?: string }) => {
        const { data, error, isLoading, mutate } = useSWR(
            [`orders`, params],
            () => getOrdersApi(params)
        );

        return {
            orders: data || [],
            error: error?.message || null,
            isLoading,
            mutate
        };
    }

    const getOrderById = (orderId: string) => {
        const { data, error, isLoading, mutate } = useSWR(
            [`order`, orderId],
            () => getOrderByIdApi(orderId)
        );

        return {
            order: data.order || null,
            error: error?.message || null,
            isLoading,
            mutate
        };
    }

    return { isLoading, createOrder, getOrders, getOrderById };
}

export const useBank = () => {
    const { data, error, isLoading, mutate } = useSWR(
        "banks",
        getBanksApi
    );

    return {
        banks: data || [],
        error: error?.message || null,
        isLoading,
        mutate
    };
}
