"use client";

import { useEffect, useRef } from "react";
import { Target, Lightbulb, Rocket, Users, Globe, Zap } from "lucide-react";
const mission = {
  title: "Our Mission",
  description:
    "To empower developers with AI-powered tools that accelerate UI development while maintaining code quality and best practices.",
};

const values = [
  {
    icon: Target,
    title: "Developer First",
    description:
      "Everything we build is designed with developers in mind - clean code, type safety, and intuitive APIs.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We stay at the forefront of AI technology to bring you the most advanced prompt engineering solutions.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Our community shapes our roadmap. We listen, iterate, and improve based on your feedback.",
  },
  {
    icon: Globe,
    title: "Open Source Spirit",
    description:
      "We believe in giving back to the community that has given us so much.",
  },
  {
    icon: Rocket,
    title: "Speed",
    description:
      "Time is precious. We help you ship faster without compromising on quality.",
  },
  {
    icon: Zap,
    title: "Quality",
    description:
      "Production-ready code that follows industry best practices and design patterns.",
  },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-background to-muted/30"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-purple-500/5 to-primary/10 border-b">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="about-header text-center space-y-4">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium">
              About Us
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Building the Future of AI-Powered Development
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to transform how developers build UIs with AI
              assistance
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mission-card max-w-4xl mx-auto p-8 md:p-12 rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 to-purple-500/5 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">{mission.title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {mission.description}
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Our Values</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The principles that guide everything we build
          </p>
        </div>

        <div className="values-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {values.map((value) => (
            <div
              key={value.title}
              className="value-card group p-6 rounded-2xl border border-primary/10 bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Prompts4U was born from a simple observation: developers were
              spending hours crafting the perfect prompts for AI coding
              assistants, only to get inconsistent results.
            </p>
            <p>
              We realized that the key to unlocking AI's potential in software
              development wasn't just better AI models - it was better prompts.
              Expertly crafted, production-tested prompts that consistently
              generate high-quality, maintainable code.
            </p>
            <p>
              Today, we're building a marketplace where developers can find
              proven prompts for any UI component. Our prompts are carefully
              engineered to work with Claude Code, Cursor, and other leading AI
              coding assistants.
            </p>
            <p>
              We're not just a prompt library - we're a community of developers
              passionate about pushing the boundaries of what's possible with
              AI-assisted development.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-r from-primary to-purple-600 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Ready to Build Faster?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              Join thousands of developers who are already building
              production-ready UIs with Prompts4U.
            </p>
            <button
              onClick={() => (window.location.href = "/marketplace")}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-primary font-medium hover:bg-white/90 transition-colors"
              data-cursor="hover"
            >
              Browse Components
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
