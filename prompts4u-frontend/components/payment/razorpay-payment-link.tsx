'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { paymentsApi } from '@/lib/api';
import { ExternalLink, Loader2 } from 'lucide-react';

interface RazorpayPaymentLinkProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export function RazorpayPaymentLink({
  onSuccess,
  onError,
  className,
  children,
}: RazorpayPaymentLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [paymentLinkId, setPaymentLinkId] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopChecking = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsCheckingStatus(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopChecking();
    };
  }, [stopChecking]);

  const checkPaymentStatus = useCallback(async (id: string) => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    setIsCheckingStatus(true);

    checkIntervalRef.current = setInterval(async () => {
      try {
        const status = await paymentsApi.getPaymentLinkStatus(id);
        console.log('[PaymentLink] Status check:', status);

        if (status.status === 'paid' || status.status === 'completed') {
          stopChecking();

          // Verify the payment
          console.log('[PaymentLink] Verifying payment...');
          const verification = await paymentsApi.verifyPaymentLink(id);
          console.log('[PaymentLink] Verification result:', verification);

          if (verification.success) {
            toast.success('Payment successful! Your subscription is now active.');
            onSuccess?.();
          } else {
            console.error('[PaymentLink] Verification failed:', verification);
            toast.error(`Payment verification failed: ${verification.message || 'Please contact support.'}`);
          }
        } else if (status.status === 'failed' || status.status === 'expired' || status.status === 'cancelled') {
          stopChecking();
          toast.error('Payment was not completed. Please try again.');
        }
      } catch (error) {
        console.error('[PaymentLink] Error checking payment status:', error);
      }
    }, 3000); // Check every 3 seconds

    // Stop checking after 10 minutes
    timeoutRef.current = setTimeout(() => {
      stopChecking();
    }, 10 * 60 * 1000);
  }, [onSuccess, stopChecking]);

  const createPaymentLink = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await paymentsApi.createPaymentLink();

      setPaymentLink(response.linkUrl || response.shortUrl);
      setPaymentLinkId(response.id);

      // Open the payment link in a new window
      window.open(response.linkUrl || response.shortUrl, '_blank');

      toast.success('Payment link created! Please complete your payment.');

      // Start checking payment status
      checkPaymentStatus(response.id);
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast.error('Failed to create payment link. Please try again.');
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [onError, checkPaymentStatus]);

  const handleButtonClick = () => {
    if (paymentLink) {
      // If we already have a payment link, just reopen it
      window.open(paymentLink, '_blank');
    } else {
      // Create a new payment link
      createPaymentLink();
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        disabled={isLoading || isCheckingStatus}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Payment Link...
          </>
        ) : isCheckingStatus ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking Payment...
          </>
        ) : children ? (
          children
        ) : (
          <>
            Upgrade to Pro
            <ExternalLink className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {paymentLink && !isCheckingStatus && (
        <p className="text-xs text-muted-foreground mt-2">
          Already opened the payment link? Complete your payment to activate Pro access.
        </p>
      )}
    </>
  );
}
