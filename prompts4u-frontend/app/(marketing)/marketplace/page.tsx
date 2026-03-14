"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Component, PaginatedResponse } from "@/types";
import { componentsApi } from "@/lib/api";
import { SearchBar } from "@/components/marketplace/search-bar";
import { CategorySidebar } from "@/components/marketplace/category-sidebar";
import { ComponentCard } from "@/components/marketplace/component-card";
import { useCopyPrompt } from "@/hooks/use-copy-prompt";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeModal } from "@/components/payment/upgrade-modal";
import { PreviewDialog } from "@/components/marketplace/preview-dialog";
import { useAuth } from "@/components/common/auth-provider";
import { Sparkles, Filter, Grid3x3 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null,
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { copyPrompt } = useCopyPrompt();
  const {
    isUpgradeModalOpen,
    openUpgradeModal,
    closeUpgradeModal,
    initiatePayment,
  } = useUpgradeModal();

  const isPro = user?.subscriptionStatus === "active";

  const { data, isLoading } = useQuery({
    queryKey: [
      "components",
      { category: category !== "all" ? category : undefined, search },
    ],
    queryFn: () =>
      componentsApi.getAll({
        category: category !== "all" ? category : undefined,
        search,
        limit: 50,
      }),
  });

  const handleCopy = async (component: Component) => {
    try {
      await copyPrompt(component);
    } catch (error) {
      if ((error as Error).message === "SUBSCRIPTION_REQUIRED") {
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
          if (sortBy === "newest") return 0;
          if (sortBy === "popular") return b.copyCount - a.copyCount;
          return 0;
        }),
      }
    : data;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar - Fixed */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  Categories
                </h3>
                <CategorySidebar
                  selectedCategory={category}
                  onSelectCategory={setCategory}
                  className="space-y-1"
                />
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden w-full mb-4">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="w-full flex items-center justify-between p-4 rounded-xl border bg-background hover:border-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {category === "all" ? "All Categories" : category}
              </span>
              <span
                className={`transform transition-transform ${isMobileFilterOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {isMobileFilterOpen && (
              <div className="mt-4 p-4 rounded-xl border bg-background">
                <CategorySidebar
                  selectedCategory={category}
                  onSelectCategory={(cat) => {
                    setCategory(cat);
                    setIsMobileFilterOpen(false);
                  }}
                  className="space-y-1"
                />
              </div>
            )}
          </div>

          {/* Main content - Scrollable */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="sticky top-20 z-10 bg-background/80 backdrop-blur-sm py-4 mb-6 border-b">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:w-auto">
                  <SearchBar value={search} onChange={setSearch} />
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value || "newest")}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Grid - Only this scrolls */}
            <div
              ref={gridRef}
              className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {isLoading
                ? Array.from({ length: 9 }).map((_, i) => (
                    <ComponentCardSkeleton key={i} />
                  ))
                : sortedData?.data.map((component) => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      onCopy={handleCopy}
                      onPreview={handlePreview}
                      isLocked={!isPro && component.tier === "paid"}
                    />
                  ))}
            </div>

            {!isLoading &&
              (!sortedData?.data || sortedData.data.length === 0) && (
                <div className="text-center py-16 rounded-2xl border bg-muted/30">
                  <p className="text-lg font-medium mb-2">
                    No components found
                  </p>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
          </div>
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
    <div className="rounded-2xl border bg-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="p-4 pt-0 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 flex-1 rounded-xl" />
      </div>
    </div>
  );
}
