"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageGuard } from "@/components/admin/admin-page-guard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { formatDate } from "@/config/admin";
import { Images, Upload, RefreshCw, Eye } from "lucide-react";
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

export default function AdminScrapePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPages();
    const interval = setInterval(fetchPages, 5000);
    return () => clearInterval(interval);
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

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/admin/pages", { url });
      toast.success("URL submitted for scraping");
      setUrl("");
      fetchPages();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit URL");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageGuard redirectLogin="/admin/scrape">
      <div className="container min-h-screen mx-auto px-4 py-8">
        <AdminPageHeader
          icon={Images}
          title="Scrape Pages"
          description="Submit URLs for component detection and prompt generation"
        />

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Submit URL</CardTitle>
                <CardDescription>Enter a URL to scrape for UI components</CardDescription>
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
                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    <Upload className="h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit for Scraping"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    The scraper will detect UI components and generate prompts automatically.
                  </p>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How it Works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>1. Submit a URL for scraping</p>
                <p>2. Our scraper captures the page and screenshots</p>
                <p>3. AI detects UI components (navbar, hero, etc.)</p>
                <p>4. Prompts are generated for each component</p>
                <p>5. Results appear in "View All Pages"</p>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Recent Scrapes</CardTitle>
                  <CardDescription>Track the status of your scraping jobs</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchPages} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading pages...</div>
                ) : pages.length > 0 ? (
                  <div className="space-y-4">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {page.title || page.url}
                            </p>
                            <StatusBadge status={page.scrapeStatus} />
                          </div>
                          {page.scrapeError && (
                            <p className="text-xs text-destructive truncate">
                              {page.scrapeError}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Submitted: {formatDate(page.submittedAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/pages/${page.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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
