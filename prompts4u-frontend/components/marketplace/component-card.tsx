'use client';

import { Copy, Lock, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Component } from '@/types';

interface ComponentCardProps {
  component: Component;
  onCopy: (component: Component) => void;
  onPreview: (component: Component) => void;
  isLocked?: boolean;
}

export function ComponentCard({ component, onCopy, onPreview, isLocked }: ComponentCardProps) {
  const isPaidLocked = component.tier === 'paid' && isLocked;
  const isPaidUnlocked = component.tier === 'paid' && !isLocked;

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
          {component.previewImageUrl ? (
            <img
              src={component.previewImageUrl}
              alt={component.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="text-center p-4">
              <Badge variant="outline" className="mb-2">
                {component.category}
              </Badge>
            </div>
          )}
          {component.tier === 'paid' && (
            <Badge className={`absolute top-2 right-2 ${isPaidUnlocked ? 'bg-green-500' : 'bg-primary'}`}>
              {isPaidUnlocked ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Unlocked
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Pro
                </>
              )}
            </Badge>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg">{component.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {component.description}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{component.category}</Badge>
            {component.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          variant="outline"
          onClick={() => onPreview(component)}
          className="flex-1"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        <Button
          onClick={() => onCopy(component)}
          disabled={isPaidLocked}
          className="flex-1"
          size="sm"
        >
          {isPaidLocked ? (
            <>
              <Lock className="h-4 w-4 mr-1" />
              Upgrade
            </>
          ) : isPaidUnlocked ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Copy
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
