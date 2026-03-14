'use client';

import { Copy, ClipboardPaste, Wand2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: Copy,
    title: 'Browse & Copy',
    description: 'Find the perfect component in our marketplace and copy the prompt with one click.',
  },
  {
    icon: ClipboardPaste,
    title: 'Paste into AI',
    description: 'Paste the prompt into Claude Code, Cursor, or any AI coding assistant.',
  },
  {
    icon: Wand2,
    title: 'Get Production UI',
    description: 'Watch as the AI generates a complete, production-ready component instantly.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="container mx-auto px-4 py-20 bg-muted/50">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Three simple steps from prompt to production-ready UI
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {steps.map((step, index) => (
          <Card key={step.title} className="relative">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </CardContent>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRightIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}
