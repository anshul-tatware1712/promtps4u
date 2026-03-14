'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Code2, Copy, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
          <span className="mr-2">✨</span>
          Production-ready UI in seconds
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
          AI Prompts for{' '}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Production UI
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Copy expertly-crafted prompts and paste them into Claude Code, Cursor, or any AI coding tool to generate beautiful, production-ready UI components instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" onClick={() => window.location.href = '/marketplace'}>
            Browse Components
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.location.href = '/#how-it-works'}>
            See How It Works
          </Button>
        </div>

        {/* Animated preview */}
        <div className="w-full max-w-3xl mt-12 rounded-xl border bg-muted/50 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-muted-foreground">Claude Code</span>
          </div>
          <div className="text-left space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground">{'>'}</span>
              <span className="text-green-400">Create a modern pricing section with three tiers...</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground">{'<'}</span>
              <span className="text-blue-400">Generating component...</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <Code2 className="h-4 w-4" />
              <span>Component ready to copy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
