"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const CATEGORIES = [
  { value: "all", label: "All Components" },
  { value: "hero", label: "Hero Sections" },
  { value: "header", label: "Headers / Navbars" },
  { value: "pricing", label: "Pricing" },
  { value: "testimonials", label: "Testimonials" },
  { value: "features", label: "Features" },
  { value: "about", label: "About / Team" },
  { value: "cta", label: "CTAs" },
  { value: "faq", label: "FAQ" },
  { value: "footer", label: "Footers" },
];

interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

export function CategorySidebar({
  selectedCategory,
  onSelectCategory,
  className,
}: CategorySidebarProps) {
  return (
    <ScrollArea className={cn("max-h-[calc(100vh-12rem)]", className)}>
      <div className="space-y-1">
        {CATEGORIES.map((category) => (
          <Button
            key={category.value}
            variant={
              selectedCategory === category.value ? "secondary" : "ghost"
            }
            className="w-full justify-start font-normal gap-3"
            onClick={() => onSelectCategory(category.value)}
            data-cursor="hover"
          >
            {category.label}
            {selectedCategory === category.value && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
