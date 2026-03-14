'use client';

import { useState, useCallback } from 'react';
import { paymentsApi } from '@/lib/api';
import { useAuth } from '@/components/common/auth-provider';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useUpgradeModal() {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { refreshUser } = useAuth();

  const openUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
  }, []);

  const initiatePayment = useCallback(async () => {
    try {
      setIsProcessing(true);

      const order = await paymentsApi.createOrder();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Prompts4U',
        description: 'Monthly Subscription',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const result = await paymentsApi.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (result.success) {
              toast.success('Subscription activated!', {
                description: 'You now have access to all Pro prompts.',
              });
              await refreshUser?.();
              closeUpgradeModal();
            }
          } catch (error) {
            toast.error('Payment verification failed', {
              description: 'Please contact support.',
            });
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#09090b',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Failed to create order', {
        description: 'Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [refreshUser, closeUpgradeModal]);

  return {
    isUpgradeModalOpen,
    openUpgradeModal,
    closeUpgradeModal,
    initiatePayment,
    isProcessing,
  };
}
