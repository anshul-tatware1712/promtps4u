'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { RazorpayPaymentLink } from './razorpay-payment-link';
import { useAuth } from '@/components/common/auth-provider';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  isProcessing?: boolean;
}

const proFeatures = [
  'Unlimited access to all premium prompts',
  'New prompts added every week',
  'Priority support',
  'Early access to new features',
  'Commercial license',
];

export function UpgradeModal({ open, onOpenChange, onConfirm, isProcessing }: UpgradeModalProps) {
  const { refreshUser } = useAuth();

  const handleSuccess = async () => {
    // Refresh user data to update subscription status
    await refreshUser();
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Unlock Pro Prompts</DialogTitle>
          <DialogDescription>
            Upgrade to Pro to access all premium prompts
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border bg-muted p-4 mb-4">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold">$20</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Unlimited access to all Pro prompts
            </p>
          </div>

          <ul className="space-y-2">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Maybe Later
          </Button>
          <RazorpayPaymentLink onSuccess={handleSuccess} className="flex-1">
            Upgrade Now
          </RazorpayPaymentLink>
        </div>
      </DialogContent>
    </Dialog>
  );
}
