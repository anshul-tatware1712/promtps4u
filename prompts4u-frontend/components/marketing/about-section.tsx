"use client";

import { Target, Lightbulb, Rocket } from "lucide-react";

const problems = [
  {
    icon: Target,
    title: "Time-Consuming Development",
    description:
      "Developers spend hours building UI components from scratch instead of focusing on core functionality.",
  },
  {
    icon: Lightbulb,
    title: "Inconsistent Quality",
    description:
      "AI-generated code often lacks production quality, proper structure, and best practices.",
  },
  {
    icon: Rocket,
    title: "Slow Iteration",
    description:
      "Multiple iterations needed to get the desired output, wasting valuable development time.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium">
            About Us
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">The Problem We're Solving</h2>
          <p className="text-lg text-muted-foreground">
            Modern development moves fast. We help you keep up by transforming AI from a code generator into a production-ready UI powerhouse.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="group p-8 rounded-2xl border border-primary/10 bg-muted/30 hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <problem.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
