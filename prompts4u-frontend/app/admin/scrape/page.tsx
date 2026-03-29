"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageGuard } from "@/components/admin/admin-page-guard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { apiClient } from "@/lib/api/client";
import { formatDate } from "@/config/admin";
import { Upload, RefreshCw, Eye, ChevronRight, Activity, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useScrapeWebSocket, ScrapePageState } from "@/hooks/use-scrape-websocket";

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

interface PageWithLiveState extends Page {
  liveState?: ScrapePageState;
}

const STAGE_LABELS: Record<string, string> = {
  scraping: "Scraping page content",
  detecting: "Detecting UI components with AI",
  generating: "Generating prompts",
  completed: "Completed",
  failed: "Failed",
  pending: "Pending",
};

export default function AdminScrapePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pages, setPages] = useState<PageWithLiveState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);

  // Polling for status updates
  const { isConnected, getPageState } = useScrapeWebSocket();

  useEffect(() => {
    fetchPages();
    return () => {};
  }, []);

  // Update pages with live polling state
  useEffect(() => {
    setPages((prevPages) =>
      prevPages.map((page) => ({
        ...page,
        liveState: getPageState(page.id),
      }))
    );
  }, [getPageState]);

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

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiClient.post("/admin/pages", { url });
      toast.success("URL submitted for scraping");
      setUrl("");

      // Auto-expand the newly submitted page to show progress
      if (result.data?.page?.id) {
        setExpandedPageId(result.data.page.id);
      }

      fetchPages();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit URL");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStageLabel = (status: string, liveState?: ScrapePageState) => {
    const stage = liveState?.stage || status;
    return STAGE_LABELS[stage] || stage;
  };

  return (
    <AdminPageGuard redirectLogin="/admin/scrape">
      <div className="container min-h-screen mx-auto px-4 py-8">
        <AdminPageHeader
          title="Scrape Pages"
          description="Submit URLs for component detection and prompt generation"
        />

        {/* Polling Status Indicator */}
        <div className="mb-4 flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
            <Activity className="h-3 w-3" />
            {isConnected ? "Live Updates Active" : "Connecting..."}
          </Badge>
          <span className="text-xs text-muted-foreground">
            (Updates every 2 seconds)
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Submit URL</CardTitle>
                <CardDescription>
                  Enter a URL to scrape for UI components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitUrl} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website URL</label>
                    <Input
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit for Scraping"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    The scraper will detect UI components and generate prompts
                    automatically.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Recent Scrapes</CardTitle>
                  <CardDescription>
                    Track the status of your scraping jobs in real-time
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchPages}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading pages...
                  </div>
                ) : pages.length > 0 ? (
                  <div className="space-y-3">
                    {pages.map((page) => {
                      const liveState = page.liveState;
                      const currentStatus = liveState?.status || page.scrapeStatus;
                      const isProcessing = !["completed", "failed"].includes(currentStatus);

                      return (
                        <Collapsible
                          key={page.id}
                          open={expandedPageId === page.id}
                          onOpenChange={(open: boolean) => setExpandedPageId(open ? page.id : null)}
                        >
                          <div className={`rounded-lg border ${isProcessing ? "border-primary/50 bg-primary/5" : ""}`}>
                            <div className="p-4 flex items-center justify-between gap-4">
                              <div
                                className="flex-1 min-w-0 space-y-2 cursor-pointer"
                                onClick={() => setExpandedPageId(page.id === expandedPageId ? null : page.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <Activity className={`h-4 w-4 ${isProcessing ? "animate-pulse text-primary" : "text-muted-foreground"}`} />
                                  <p className="font-medium truncate flex-1">
                                    {page.title || page.url}
                                  </p>
                                  <StatusBadge status={currentStatus} />
                                </div>

                                {/* Progress bar for active scrapes */}
                                {isProcessing && (
                                  <div className="space-y-1">
                                    <Progress value={liveState?.progress || 25} className="h-2" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>{getStageLabel(page.scrapeStatus, liveState)}</span>
                                      <span>{Math.round(liveState?.progress || 25)}%</span>
                                    </div>
                                  </div>
                                )}

                                {page.scrapeError && (
                                  <p className="text-xs text-destructive truncate">
                                    {page.scrapeError}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>Submitted: {formatDate(page.submittedAt)}</span>
                                  {liveState?.lastUpdated && (
                                    <span className="text-primary">
                                      Updated: {formatDate(liveState.lastUpdated)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <ChevronRight
                                  className={`h-4 w-4 transition-transform ${expandedPageId === page.id ? "rotate-90" : ""}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/admin/pages/${page.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Expanded view with detailed stage info */}
                            <CollapsibleContent>
                              <div className="px-4 pb-4 border-t pt-4 space-y-3">
                                <h4 className="text-sm font-medium">Scraping Stages</h4>
                                <div className="grid gap-2">
                                  {Object.entries(STAGE_LABELS).map(([stage, label]) => {
                                    const isCurrentStage = (liveState?.stage || page.scrapeStatus) === stage;
                                    const isPastStage = stage === "completed" && page.scrapeStatus === "completed";

                                    return (
                                      <div
                                        key={stage}
                                        className={`flex items-center gap-3 p-2 rounded-md text-sm ${
                                          isCurrentStage
                                            ? "bg-primary/10 text-primary font-medium"
                                            : isPastStage
                                            ? "text-muted-foreground"
                                            : "text-muted-foreground/50"
                                        }`}
                                      >
                                        {isCurrentStage && <Activity className="h-4 w-4 animate-pulse" />}
                                        {isPastStage && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        {!isCurrentStage && !isPastStage && <Clock className="h-4 w-4" />}
                                        <span>{label}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No pages submitted yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminPageGuard>
  );
}
