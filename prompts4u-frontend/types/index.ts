/**
 * User entity shared between frontend and backend
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: 'github' | 'google' | 'email';
  subscriptionStatus: 'free' | 'active' | 'cancelled';
  subscriptionEnd?: string | null;
}

/**
 * Component category types
 */
export type ComponentCategory =
  | 'header'
  | 'hero'
  | 'pricing'
  | 'testimonials'
  | 'about'
  | 'features'
  | 'footer'
  | 'cta'
  | 'faq';

/**
 * Main component interface
 */
export interface Component {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ComponentCategory | string;
  tier: 'free' | 'paid';
  promptContent: string;
  previewImageUrl?: string | null;
  previewCode?: string | null;
  tags: string[];
  copyCount: number;
  createdAt: string;
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Payment types
 */
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface RazorpayPaymentLink {
  id: string;
  linkUrl: string;
  shortUrl: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
  expiresAt: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentLinkStatus {
  id: string;
  status: string;
  amount: number;
  currency: string;
  payments: any[];
}
