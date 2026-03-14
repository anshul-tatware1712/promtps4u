'use client';

import { useEffect, useState } from 'react';
import { Lock, Eye, Copy } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Component } from '@/types';
import { componentsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES: Record<string, string> = {
  hero: 'Hero',
  pricing: 'Pricing',
  testimonials: 'Testimonials',
  features: 'Features',
  cta: 'CTA',
  faq: 'FAQ',
};

export function ComponentPreviewSection() {
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    componentsApi
      .getAll({ limit: 6 })
      .then((res) => {
        setComponents(res.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Preview Components</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A glimpse of what you can create with our prompts
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <ComponentCardSkeleton key={i} />)
          : components.map((component) => (
              <ComponentCard key={component.id} component={component} />
            ))}
      </div>

      <div className="text-center mt-8">
        <Button size="lg" onClick={() => window.location.href = '/marketplace'}>
          View All Components
        </Button>
      </div>
    </section>
  );
}

function ComponentCard({ component }: { component: Component }) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
          <div className="text-center p-4">
            <Badge variant="outline" className="mb-2">
              {CATEGORIES[component.category] || component.category}
            </Badge>
            <p className="text-sm text-muted-foreground">{component.name}</p>
          </div>
          {component.tier === 'paid' && (
            <Badge className="absolute top-2 right-2 bg-primary">
              <Lock className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{component.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {component.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        <Button size="sm" className="flex-1" disabled={component.tier === 'paid'}>
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </CardFooter>
    </Card>
  );
}

function ComponentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="aspect-video w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </CardFooter>
    </Card>
  );
}
