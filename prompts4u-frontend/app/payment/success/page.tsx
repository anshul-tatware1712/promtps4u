'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/common/auth-provider';

function PaymentVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    const verifyPayment = async () => {
      const paymentId = searchParams.get('razorpay_payment_id');
      const paymentLinkId = searchParams.get('razorpay_payment_link_id');
      const referenceId = searchParams.get('razorpay_payment_link_reference_id');
      const status = searchParams.get('razorpay_payment_link_status');
      const signature = searchParams.get('razorpay_signature');

      // Check if we have the necessary parameters
      if (!paymentLinkId) {
        setVerificationResult({
          success: false,
          message: 'Missing payment link information',
        });
        setIsVerifying(false);
        return;
      }

      try {
        toast.loading('Verifying your payment...', { id: 'payment-verify' });
        // First, check the payment link status
        const statusResponse = await paymentsApi.getPaymentLinkStatus(paymentLinkId);

        if (statusResponse.status === 'paid' || status === 'paid') {
          // Verify the payment link to activate subscription
          const verification = await paymentsApi.verifyPaymentLink(paymentLinkId);

          if (verification.success) {
            // Refresh user data to update subscription status
            await refreshUser();

            setVerificationResult({
              success: true,
              message: 'Payment successful! Your Pro subscription is now active.',
            });

            toast.success('Payment successful! Pro subscription activated.', { id: 'payment-verify' });

            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);
          } else {
            setVerificationResult({
              success: false,
              message: verification.message || 'Payment verification failed',
            });
            toast.error('Payment verification failed. Please contact support.', { id: 'payment-verify' });
          }
        } else if (statusResponse.status === 'failed' || statusResponse.status === 'cancelled' || statusResponse.status === 'expired') {
          setVerificationResult({
            success: false,
            message: `Payment was not completed. Status: ${statusResponse.status}`,
          });
          toast.error('Payment was not completed. Please try again.', { id: 'payment-verify' });
        } else {
          setVerificationResult({
            success: false,
            message: 'Payment status is pending. Please contact support if this persists.',
          });
          toast.error('Payment status is pending.', { id: 'payment-verify' });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationResult({
          success: false,
          message: (error as Error).message || 'An error occurred during verification',
        });
        toast.error('Failed to verify payment. Please contact support.', { id: 'payment-verify' });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, router, refreshUser]);

  if (isVerifying) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Verifying your payment...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait while we confirm your payment
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {verificationResult?.success ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>
                {verificationResult?.message}
              </CardDescription>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl">Verification Failed</CardTitle>
              <CardDescription>
                {verificationResult?.message}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {verificationResult?.success ? (
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button onClick={() => router.push('/marketplace')} className="w-full">
                Back to Marketplace
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
                Check Subscription Status
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentVerificationContent />
    </Suspense>
  );
}
