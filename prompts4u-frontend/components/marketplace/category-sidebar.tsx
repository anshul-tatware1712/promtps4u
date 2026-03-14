'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'hero', label: 'Hero Sections' },
  { value: 'header', label: 'Headers / Navbars' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'features', label: 'Features' },
  { value: 'about', label: 'About / Team' },
  { value: 'cta', label: 'CTAs' },
  { value: 'faq', label: 'FAQ' },
  { value: 'footer', label: 'Footers' },
];

interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

export function CategorySidebar({ selectedCategory, onSelectCategory, className }: CategorySidebarProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="font-semibold mb-4">Categories</h3>
      {CATEGORIES.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onSelectCategory(category.value)}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
