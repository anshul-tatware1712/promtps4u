"use client";

import {
  Copy,
  Lock,
  Eye,
  CheckCircle,
  Sparkles,
  Image,
  Menu,
  DollarSign,
  MessageSquare,
  Star,
  Users,
  Megaphone,
  HelpCircle,
  AlignRight,
  Square,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Component } from "@/types";
import { cn } from "@/lib/utils";

interface ComponentCardProps {
  component: Component;
  onCopy: (component: Component) => void;
  onPreview: (component: Component) => void;
  isLocked?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  hero: Image,
  header: Menu,
  pricing: DollarSign,
  testimonials: MessageSquare,
  features: Star,
  about: Users,
  cta: Megaphone,
  faq: HelpCircle,
  footer: AlignRight,
};

export function ComponentCard({
  component,
  onCopy,
  onPreview,
  isLocked,
}: ComponentCardProps) {
  const isPaidLocked = component.tier === "paid" && isLocked;
  const isPaidUnlocked = component.tier === "paid" && !isLocked;

  return (
    <Card className="group component-card overflow-hidden rounded-2xl">
      <CardContent className="p-0">
        {/* Preview Image */}
        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {component.previewImageUrl ? (
            <img
              src={component.previewImageUrl}
              alt={component.name}
              className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Badge variant="outline" className="mb-2">
                {component.category}
              </Badge>
            </div>
          )}

          {/* Tier Badge */}
          {component.tier === "paid" && (
            <Badge
              className={cn(
                "absolute top-3 right-3 gap-1.5 backdrop-blur-sm",
                isPaidUnlocked ? "bg-green-500/90" : "bg-primary/90",
              )}
            >
              {isPaidUnlocked ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Unlocked
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  Pro
                </>
              )}
            </Badge>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onPreview(component)}
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
              data-cursor="hover"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {component.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {component.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {component.category}
            </Badge>
            {component.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Copy count */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{component.copyCount} copies</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          variant="outline"
          onClick={() => onPreview(component)}
          className="flex-1 h-10 rounded-xl"
          size="sm"
          data-cursor="hover"
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        <Button
          onClick={() => onCopy(component)}
          variant={isPaidLocked ? "secondary" : "default"}
          className="flex-1 h-10 rounded-xl"
          size="sm"
          data-cursor="hover"
        >
          {isPaidLocked ? (
            <>
              <Lock className="h-4 w-4 mr-1" />
              Upgrade to Pro
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
