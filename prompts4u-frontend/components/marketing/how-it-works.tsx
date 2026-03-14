"use client";

import { Copy, ClipboardPaste, Wand2 } from "lucide-react";

const steps = [
  {
    icon: Copy,
    title: "Browse & Copy",
    description:
      "Find the perfect component in our marketplace and copy the prompt with one click.",
  },
  {
    icon: ClipboardPaste,
    title: "Paste into AI",
    description:
      "Paste the prompt into Claude Code, Cursor, or any AI coding assistant.",
  },
  {
    icon: Wand2,
    title: "Get Production UI",
    description:
      "Watch as the AI generates a complete, production-ready component instantly.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-32 bg-muted/30"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium">
            How It Works
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">
            Three Steps to Production UI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From prompt to production-ready component in under a minute
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div
                className="group text-center p-8 rounded-2xl border border-primary/10 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors h-full"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>

              {/* Connector arrow (not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <svg
                    className="w-8 h-8 text-primary/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
