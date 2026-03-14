"use client";

import { ArrowRight, Code2, Zap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const features = [
    { icon: Code2, text: "Production-Ready" },
    { icon: Zap, text: "Instant Generation" },
    { icon: Layers, text: "Multiple Frameworks" },
  ];

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium">
            <span className="text-primary">
              Production-ready UI in seconds
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl">
            AI Prompts for{" "}
            <span className="text-primary">
              Production UI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Copy expertly-crafted prompts and paste them into Claude Code,
            Cursor, or any AI coding tool to generate beautiful,
            production-ready UI components instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={() => (window.location.href = "/marketplace")}
              className="group h-12 px-8 text-base gap-2"
              data-cursor="hover"
            >
              Browse Components
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = "/#how-it-works")}
              className="h-12 px-8 text-base"
              data-cursor="hover"
            >
              See How It Works
            </Button>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {features.map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm font-medium border border-primary/10"
              >
                <feature.icon className="h-4 w-4 text-primary" />
                {feature.text}
              </div>
            ))}
          </div>

          {/* Code preview */}
          <div className="w-full max-w-3xl mt-12 rounded-2xl border border-primary/20 bg-muted/30 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">
                Claude Code
              </span>
            </div>
            <div className="text-left space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-mono">{">"}</span>
                <span className="text-green-400 font-mono">
                  Create a modern pricing section with three tiers, featuring
                  monthly and yearly billing toggle...
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span className="font-mono">Component ready to copy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
