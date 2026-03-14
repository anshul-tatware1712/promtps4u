import { HeroSection } from '@/components/marketing/hero-section';
import { HowItWorksSection } from '@/components/marketing/how-it-works';
import { ComponentPreviewSection } from '@/components/marketing/component-preview';
import { PricingSection } from '@/components/marketing/pricing-section';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <ComponentPreviewSection />
      <PricingSection />
    </div>
  );
}
