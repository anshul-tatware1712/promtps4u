"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageGuard } from "@/components/admin/admin-page-guard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/client";
import { FileText, Eye, Search, ExternalLink, Copy, CheckCircle2, Circle, Plus } from "lucide-react";
import { toast } from "sonner";

interface Page {
  id: string;
  url: string;
  urlHash: string;
  title?: string;
  fullScreenshotUrl?: string;
  scrapeStatus: string;
  scrapeError?: string;
  scrapedAt?: string;
  createdAt: string;
  submittedAt: string;
}

interface Prompt {
  id: string;
  componentType: string;
  promptText: string;
  screenshotUrl?: string;
  copyCount: number;
  upvotes: number;
  downvotes: number;
  status: string;
  publishedAt?: string;
  tags: string[];
  title?: string;
}

interface PageDetailsResponse {
  id: string;
  url: string;
  urlHash: string;
  title?: string;
  fullScreenshotUrl?: string;
  scrapeStatus: string;
  scrapeError?: string;
  scrapedAt?: string;
  createdAt: string;
  submittedAt: string;
  components: any[];
  prompts: Prompt[];
}

export default function AdminPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [pageDetails, setPageDetails] = useState<PageDetailsResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await apiClient.get<Page[]>("/admin/pages");
      setPages(response.data);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPageDetails = async (pageId: string) => {
    try {
      const response = await apiClient.get<PageDetailsResponse>(`/admin/pages/${pageId}`);
      setPageDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch page details:", error);
    }
  };

  const handleViewPage = async (page: Page) => {
    setSelectedPage(page);
    await fetchPageDetails(page.id);
    setIsDialogOpen(true);
  };

  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    toast.success("Prompt copied to clipboard");
  };

  const handleTogglePromptStatus = async (promptId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      await apiClient.patch(`/admin/pages/prompts/${promptId}/status`, {
        status: newStatus,
      });
      toast.success(newStatus === "published" ? "Prompt published" : "Prompt unpublished");

      // Refresh page details to show updated status
      if (selectedPage) {
        await fetchPageDetails(selectedPage.id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const handlePublishAllPrompts = async () => {
    if (!selectedPage) return;

    try {
      await apiClient.post(`/admin/pages/pages/${selectedPage.id}/publish`);
      toast.success("All prompts published");
      await fetchPageDetails(selectedPage.id);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to publish prompts");
    }
  };

  const handleUnpublishAllPrompts = async () => {
    if (!selectedPage) return;

    try {
      await apiClient.post(`/admin/pages/pages/${selectedPage.id}/unpublish`);
      toast.success("All prompts unpublished");
      await fetchPageDetails(selectedPage.id);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to unpublish prompts");
    }
  };

  const handleAddNewComponent = () => {
    router.push(`/admin/components`);
    toast.info("Navigate to Components page to create a new component");
  };

  const filteredPages = pages.filter(
    (page) =>
      page.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminPageGuard redirectLogin="/admin/pages">
      <div className="container min-h-screen mx-auto px-4 py-8">
        <AdminPageHeader
          title="View All Pages"
          description="Browse all scraped pages with their components and prompts"
        />

        <Card>
          <CardContent className="pt-6">
            <AdminSearchBar
              placeholder="Search pages by URL or title..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="mb-4"
            />

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading pages...</div>
            ) : filteredPages.length > 0 ? (
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate">
                          <p className="font-medium truncate">
                            {page.title || page.url}
                          </p>
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Visit Page
                          </a>
                        </div>
                        <StatusBadge status={page.scrapeStatus} />
                      </div>
                      {page.scrapeError && (
                        <p className="text-xs text-destructive truncate">
                          {page.scrapeError}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="text-right">
                        <p className="text-xs">Components</p>
                        <p className="font-medium">
                          {pageDetails?.id === page.id ? pageDetails.components?.length || 0 : "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs">Prompts</p>
                        <p className="font-medium">
                          {pageDetails?.id === page.id ? pageDetails.prompts?.length || 0 : "-"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPage(page)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No pages found. Submit URLs in the{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push("/admin/scrape")}
                >
                  Scrape Pages
                </Button>{" "}
                section.
              </div>
            )}
          </CardContent>
        </Card>

        {selectedPage && pageDetails && (
          <PageDetailsDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            page={selectedPage}
            pageDetails={pageDetails}
            onCopyPrompt={handleCopyPrompt}
            onTogglePromptStatus={handleTogglePromptStatus}
            onPublishAll={handlePublishAllPrompts}
            onUnpublishAll={handleUnpublishAllPrompts}
            onAddNewComponent={handleAddNewComponent}
          />
        )}
      </div>
    </AdminPageGuard>
  );
}

interface PageDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: Page;
  pageDetails: PageDetailsResponse;
  onCopyPrompt: (text: string) => void;
  onTogglePromptStatus: (promptId: string, currentStatus: string) => void;
  onPublishAll: () => void;
  onUnpublishAll: () => void;
  onAddNewComponent: () => void;
}

function PageDetailsDialog({
  open,
  onOpenChange,
  page,
  pageDetails,
  onCopyPrompt,
  onTogglePromptStatus,
  onPublishAll,
  onUnpublishAll,
  onAddNewComponent,
}: PageDetailsDialogProps) {
  const publishedCount = pageDetails?.prompts?.filter((p) => p.status === "published").length || 0;
  const totalCount = pageDetails?.prompts?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Page Details</DialogTitle>
          <DialogDescription>
            {page.title || page.url}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">URL</p>
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {page.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <StatusBadge status={page.scrapeStatus} />
            </div>
            <div>
              <p className="text-sm font-medium">Screenshot</p>
              {page.fullScreenshotUrl ? (
                <img
                  src={page.fullScreenshotUrl}
                  alt="Page screenshot"
                  className="mt-1 rounded-md border max-h-48 object-cover"
                />
              ) : (
                <p className="text-sm text-muted-foreground">No screenshot available</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Scraped At</p>
              <p className="text-sm text-muted-foreground">
                {page.scrapedAt
                  ? new Date(page.scrapedAt).toLocaleString()
                  : "Not scraped yet"}
              </p>
            </div>
          </div>

          {pageDetails?.components && pageDetails.components.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Detected Components</h3>
              <div className="grid gap-3">
                {pageDetails.components.map((component) => (
                  <Card key={component.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{component.componentType}</p>
                          <p className="text-sm text-muted-foreground">
                            {component.layoutDescription || "No description"}
                          </p>
                        </div>
                        <Badge variant="outline">{component.componentType}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pageDetails?.prompts && pageDetails.prompts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">
                  Generated Prompts ({publishedCount}/{totalCount} published)
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddNewComponent}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Component
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUnpublishAll}
                    disabled={publishedCount === 0}
                  >
                    Unpublish All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPublishAll}
                    disabled={publishedCount === totalCount}
                  >
                    Publish All
                  </Button>
                </div>
              </div>
              <div className="grid gap-3">
                {pageDetails.prompts.map((prompt) => (
                  <Card key={prompt.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{prompt.componentType}</Badge>
                            <Badge variant={prompt.status === "published" ? "default" : "secondary"} className="text-xs">
                              {prompt.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onTogglePromptStatus(prompt.id, prompt.status)}
                              className="h-8"
                            >
                              {prompt.status === "published" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onCopyPrompt(prompt.promptText)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm font-medium">{prompt.title || "Untitled Prompt"}</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {prompt.promptText}
                        </p>
                        {prompt.screenshotUrl && (
                          <img
                            src={prompt.screenshotUrl}
                            alt="Component screenshot"
                            className="mt-2 rounded-md border max-h-32 object-cover"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(!pageDetails?.components || pageDetails.components.length === 0) &&
            (!pageDetails?.prompts || pageDetails.prompts.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No components or prompts detected yet. The page may still be processing.
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
