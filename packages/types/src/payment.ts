/**
 * Razorpay order response
 */
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

/**
 * Payment verification request
 */
export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Payment verification response
 */
export interface PaymentVerificationResponse {
  success: boolean;
  subscriptionId?: string;
  message?: string;
}

/**
 * Subscription status
 */
export interface SubscriptionStatus {
  status: 'free' | 'active' | 'cancelled';
  subscriptionEnd?: string;
}
