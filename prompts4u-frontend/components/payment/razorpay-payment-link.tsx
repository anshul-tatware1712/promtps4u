"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { paymentsApi } from "@/lib/api";
import { ExternalLink, Loader2 } from "lucide-react";

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
  const isVerifyingRef = useRef(false);

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

  const checkPaymentStatus = useCallback(
    async (id: string) => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      setIsCheckingStatus(true);
      isVerifyingRef.current = false;

      checkIntervalRef.current = setInterval(async () => {
        if (isVerifyingRef.current) return;
        try {
          const status = await paymentsApi.getPaymentLinkStatus(id);
          console.log("[PaymentLink] Status check:", status);

          if (status.status === "paid" || status.status === "completed") {
            isVerifyingRef.current = true;
            stopChecking();

            // Verify the payment
            console.log("[PaymentLink] Verifying payment...");
            toast.loading("Verifying payment...", { id: "payment-toast" });
            const verification = await paymentsApi.verifyPaymentLink(id);
            console.log("[PaymentLink] Verification result:", verification);

            if (verification.success) {
              toast.success(
                "Payment successful! Your subscription is now active.",
                { id: "payment-toast" },
              );
              onSuccess?.();
            } else {
              console.error("[PaymentLink] Verification failed:", verification);
              toast.error(
                `Payment verification failed: ${verification.message || "Please contact support."}`,
                { id: "payment-toast" },
              );
              isVerifyingRef.current = false;
            }
          } else if (
            status.status === "failed" ||
            status.status === "expired" ||
            status.status === "cancelled"
          ) {
            stopChecking();
            toast.error("Payment was not completed. Please try again.", {
              id: "payment-toast",
            });
          }
        } catch (error) {
          console.error("[PaymentLink] Error checking payment status:", error);
        }
      }, 3000); // Check every 3 seconds

      // Stop checking after 10 minutes
      timeoutRef.current = setTimeout(
        () => {
          stopChecking();
        },
        10 * 60 * 1000,
      );
    },
    [onSuccess, stopChecking],
  );

  const createPaymentLink = useCallback(async () => {
    try {
      setIsLoading(true);
      toast.loading("Creating payment link...", { id: "payment-toast" });
      const response = await paymentsApi.createPaymentLink();

      setPaymentLink(response.linkUrl || response.shortUrl);
      setPaymentLinkId(response.id);

      window.location.href = response.linkUrl || response.shortUrl;

      toast.success("Payment link created! Please complete your payment.", {
        id: "payment-toast",
      });

      // Start checking payment status
      checkPaymentStatus(response.id);
    } catch (error) {
      console.error("Error creating payment link:", error);
      toast.error("Failed to create payment link. Please try again.", {
        id: "payment-toast",
      });
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [onError, checkPaymentStatus]);

  const handleButtonClick = () => {
    if (paymentLink) {
      // If we already have a payment link, just reopen it
      window.open(paymentLink, "_blank");
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
          Already opened the payment link? Complete your payment to activate Pro
          access.
        </p>
      )}
    </>
  );
}
