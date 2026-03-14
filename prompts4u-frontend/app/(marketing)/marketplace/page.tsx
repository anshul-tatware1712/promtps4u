'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Component, PaginatedResponse } from '@/types';
import { componentsApi } from '@/lib/api';
import { SearchBar } from '@/components/marketplace/search-bar';
import { CategorySidebar } from '@/components/marketplace/category-sidebar';
import { ComponentCard } from '@/components/marketplace/component-card';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCopyPrompt } from '@/hooks/use-copy-prompt';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { UpgradeModal } from '@/components/payment/upgrade-modal';
import { PreviewDialog } from '@/components/marketplace/preview-dialog';
import { useAuth } from '@/components/common/auth-provider';

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { user } = useAuth();
  const { copyPrompt } = useCopyPrompt();
  const { isUpgradeModalOpen, openUpgradeModal, closeUpgradeModal, initiatePayment } = useUpgradeModal();

  const isPro = user?.subscriptionStatus === 'active';

  const { data, isLoading } = useQuery({
    queryKey: ['components', { category: category !== 'all' ? category : undefined, search }],
    queryFn: () =>
      componentsApi.getAll({
        category: category !== 'all' ? category : undefined,
        search,
        limit: 20,
      }),
  });

  const handleCopy = async (component: Component) => {
    try {
      await copyPrompt(component);
    } catch (error) {
      if ((error as Error).message === 'SUBSCRIPTION_REQUIRED') {
        openUpgradeModal();
      }
    }
  };

  const handlePreview = (component: Component) => {
    setSelectedComponent(component);
    setIsPreviewOpen(true);
  };

  const sortedData = data?.data
    ? {
        ...data,
        data: [...data.data].sort((a, b) => {
          if (sortBy === 'newest') return 0; // Already sorted by API
          if (sortBy === 'popular') return b.copyCount - a.copyCount;
          return 0;
        }),
      }
    : data;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
      <p className="text-muted-foreground mb-8">
        Browse and copy production-ready UI prompts
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <CategorySidebar
            selectedCategory={category}
            onSelectCategory={setCategory}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value || 'newest')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <ComponentCardSkeleton key={i} />)
              : sortedData?.data.map((component) => (
                  <ComponentCard
                    key={component.id}
                    component={component}
                    onCopy={handleCopy}
                    onPreview={handlePreview}
                    isLocked={!isPro && component.tier === 'paid'}
                  />
                ))}
          </div>

          {!isLoading && (!sortedData?.data || sortedData.data.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              No components found
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        open={isUpgradeModalOpen}
        onOpenChange={(open) => !open && closeUpgradeModal()}
        onConfirm={initiatePayment}
      />

      <PreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        component={selectedComponent}
        onCopy={handleCopy}
      />
    </div>
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
