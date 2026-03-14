'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Component } from '@/types';
import { Copy, Lock } from 'lucide-react';

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component: Component | null;
  onCopy: (component: Component) => void;
}

export function PreviewDialog({ open, onOpenChange, component, onCopy }: PreviewDialogProps) {
  if (!component) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{component.name}</DialogTitle>
          <DialogDescription>{component.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{component.category}</Badge>
            <Badge variant={component.tier === 'paid' ? 'default' : 'secondary'}>
              {component.tier === 'paid' ? 'Pro' : 'Free'}
            </Badge>
            {component.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="rounded-lg border bg-muted p-4">
            <h4 className="font-semibold mb-2">Prompt Preview</h4>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {component.promptContent}
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Copy this prompt and paste it into Claude Code, Cursor, or any AI coding assistant to generate this component.</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onCopy(component);
              onOpenChange(false);
            }}
            disabled={component.tier === 'paid'}
          >
            {component.tier === 'paid' ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Upgrade to Copy
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Prompt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
