"use client";

import { Code2, Palette, Zap, Shield, Globe, Layers } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Clean Code",
    description:
      "Production-ready code that follows best practices and modern standards.",
  },
  {
    icon: Palette,
    title: "Beautiful Design",
    description:
      "Stunning UI components designed with attention to detail and aesthetics.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate complete components in seconds, not hours.",
  },
  {
    icon: Shield,
    title: "Type Safe",
    description: "Full TypeScript support with proper types and interfaces.",
  },
  {
    icon: Globe,
    title: "Framework Agnostic",
    description: "Works with React, Vue, Angular, and any modern framework.",
  },
  {
    icon: Layers,
    title: "Composable",
    description: "Build complex UIs by combining individual components seamlessly.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium">
            Features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">
            Shaping the Future of Development
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the next evolution in UI development. Our prompts transform AI coding assistants into expert UI engineers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border border-primary/10 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
