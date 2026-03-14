import { apiClient } from "./client";
import { Component, PaginatedResponse, ApiResponse, User } from "@/types";

export interface GetComponentsParams {
  category?: string;
  search?: string;
  tier?: "free" | "paid";
  page?: number;
  limit?: number;
}

export const componentsApi = {
  getAll: async (params?: GetComponentsParams) => {
    const response = await apiClient.get<PaginatedResponse<Component>>(
      "/components",
      { params },
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Component>(
      `/components/${id}`,
    );
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Component>(
      `/components/slug/${slug}`,
    );
    return response.data;
  },

  copy: async (id: string) => {
    const response = await apiClient.post<{ promptContent: string }>(
      `/components/${id}/copy`
    );
    return response.data;
  },
};

export const authApi = {
  sendOtp: async (email: string) => {
    const response = await apiClient.post<{ message: string }>(
      "/auth/email/send-otp",
      { email },
    );
    return response.data;
  },

  verifyOtp: async (email: string, code: string) => {
    const response = await apiClient.post<{ user: User; token: string }>(
      "/auth/email/verify-otp",
      { email, code },
    );
    return response.data;
  },

  oauthCallback: async (
    provider: string,
    providerId: string,
    email: string,
    name?: string,
    avatar?: string,
  ) => {
    const response = await apiClient.post<{ user: User; token: string }>(
      "/auth/oauth/callback",
      {
        provider,
        providerId,
        email,
        name,
        avatar,
      }
    );
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};

export const paymentsApi = {
  createOrder: async () => {
    const response = await apiClient.post<{ id: string; amount: number; currency: string; linkUrl: string; shortUrl: string }>(
      "/payments/create-order"
    );
    return response.data;
  },

  createPaymentLink: async () => {
    const response = await apiClient.post<{
      id: string;
      linkUrl: string;
      shortUrl: string;
      amount: number;
      currency: string;
      status: string;
      expiresAt: string;
    }>(
      "/payments/create-payment-link"
    );
    return response.data;
  },

  getPaymentLinkStatus: async (paymentLinkId: string) => {
    const response = await apiClient.get<{
      id: string;
      status: string;
      amount: number;
      currency: string;
      payments: any[];
    }>(
      `/payments/payment-link/${paymentLinkId}`
    );
    return response.data;
  },

  verifyPaymentLink: async (paymentLinkId: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      paymentId?: string;
      amount?: number;
      subscriptionEnd?: string;
      status?: string;
    }>(
      `/payments/verify-payment-link/${paymentLinkId}`
    );
    return response.data;
  },

  verifyPayment: async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      "/payments/verify",
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }
    );
    return response.data;
  },
};
