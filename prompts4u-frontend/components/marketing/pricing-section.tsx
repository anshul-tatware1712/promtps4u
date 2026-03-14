'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const freeFeatures = [
  'Access to free prompts',
  'Basic component categories',
  'Copy unlimited free prompts',
  'Community support',
];

const proFeatures = [
  'Everything in Free',
  'Access to all premium prompts',
  'New prompts every week',
  'Priority support',
  'Early access to new features',
];

export function PricingSection() {
  return (
    <section id="pricing" className="container mx-auto px-4 py-20 bg-muted/50">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Simple Pricing</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start for free, upgrade for unlimited access
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-12">
        <PricingCard
          title="Free"
          price="$0"
          description="Perfect for getting started"
          features={freeFeatures}
          buttonText="Get Started"
          buttonVariant="outline"
          href="/marketplace"
        />
        <PricingCard
          title="Pro"
          price="$20"
          period="/month"
          description="For serious developers"
          features={proFeatures}
          buttonText="Upgrade to Pro"
          buttonVariant="default"
          href="/marketplace"
          highlighted
        />
      </div>
    </section>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'default' | 'outline';
  href: string;
  highlighted?: boolean;
}

function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  href,
  highlighted,
}: PricingCardProps) {
  return (
    <Card className={`relative ${highlighted ? 'border-primary shadow-lg' : ''}`}>
      <CardHeader className="text-center space-y-2">
        <h3 className="font-semibold text-2xl">{title}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-muted-foreground">{period}</span>}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant={buttonVariant} className="w-full" onClick={() => window.location.href = href}>
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
