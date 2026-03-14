"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const freeFeatures = [
  "Access to free prompts",
  "Basic component categories",
  "Unlimited free copies",
  "Community support",
  "Regular free updates",
];

const proFeatures = [
  "Everything in Free",
  "Access to all premium prompts",
  "10-15 new premium components weekly",
  "Priority support",
  "Early access to new features",
  "Commercial license",
  "Custom component requests",
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium">
            Pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free, upgrade for unlimited access to premium prompts
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="group p-8 rounded-3xl border border-primary/10 bg-muted/30 hover:border-primary/30 transition-colors">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground">
                  Perfect for getting started
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => (window.location.href = "/marketplace")}
                data-cursor="hover"
              >
                Get Started
              </Button>
            </div>

            <div className="mt-8 space-y-4">
              <p className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                What's included
              </p>
              <ul className="space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-500" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="group p-8 rounded-3xl border-2 border-primary">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-muted-foreground">For serious developers</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">$20</span>
                <span className="text-muted-foreground">/monthly</span>
              </div>
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90"
                onClick={() => (window.location.href = "/marketplace")}
                data-cursor="hover"
              >
                Upgrade to Pro
              </Button>
            </div>

            <div className="mt-8 space-y-4">
              <p className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Everything in Free, plus:
              </p>
              <ul className="space-y-3">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-500" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Money back guarantee */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
}
