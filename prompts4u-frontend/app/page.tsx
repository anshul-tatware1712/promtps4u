import { HeroSection } from "@/components/marketing/hero-section";
import { AboutSection } from "@/components/marketing/about-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works";
import { ComponentPreviewSection } from "@/components/marketing/component-preview";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ContactSection } from "@/components/marketing/contact-section";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ComponentPreviewSection />
      <PricingSection />
      <ContactSection />
    </div>
  );
}
