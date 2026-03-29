import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";

export interface ScrapeProgressEvent {
  type:
    | "progress"
    | "status_change"
    | "completed"
    | "failed"
    | "stage_update"
    | "connected";
  pageId: string;
  progress?: number;
  status?: string;
  stage?: string;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface ScrapePageState {
  progress: number;
  status: string;
  stage: string;
  message: string;
  lastUpdated: string | null;
}

// Polling interval in milliseconds
const POLLING_INTERVAL = 2000; // 2 seconds

export function useScrapeWebSocket(pageId?: string) {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pageStates, setPageStates] = useState<Record<string, ScrapePageState>>({});
  const [polledPages, setPolledPages] = useState<Set<string>>(new Set());

  // Poll for all pages progress
  const pollPages = useCallback(async () => {
    try {
      const response = await apiClient.get("/admin/pages");
      const pages = response.data;

      // Update states for all pages
      const newStates: Record<string, ScrapePageState> = {};

      for (const page of pages) {
        // Only poll for pages that are actively being processed
        if (page.scrapeStatus === "pending" || page.scrapeStatus === "scraping" ||
            page.scrapeStatus === "detecting" || page.scrapeStatus === "generating") {
          newStates[page.id] = {
            progress: mapStatusToProgress(page.scrapeStatus),
            status: page.scrapeStatus,
            stage: page.scrapeStatus,
            message: getStageMessage(page.scrapeStatus),
            lastUpdated: new Date().toISOString(),
          };
        }
      }

      if (Object.keys(newStates).length > 0) {
        setPageStates(prev => ({ ...prev, ...newStates }));
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Polling failed:", error);
      setIsConnected(false);
    }
  }, []);

  // Start polling when pageId changes or on mount
  useEffect(() => {
    // Initial fetch
    pollPages();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(pollPages, POLLING_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [pollPages]);

  const getPageState = useCallback(
    (pageId: string): ScrapePageState | undefined => {
      return pageStates[pageId];
    },
    [pageStates],
  );

  return {
    isConnected,
    pageStates,
    getPageState,
  };
}

// Helper function to map status to progress percentage
function mapStatusToProgress(status: string): number {
  switch (status) {
    case "pending":
      return 0;
    case "scraping":
      return 25;
    case "detecting":
      return 50;
    case "generating":
      return 75;
    case "completed":
      return 100;
    case "failed":
      return 0;
    default:
      return 10;
  }
}

// Helper function to get stage message
function getStageMessage(status: string): string {
  switch (status) {
    case "pending":
      return "Waiting to start...";
    case "scraping":
      return "Scraping page content...";
    case "detecting":
      return "Detecting UI components with AI...";
    case "generating":
      return "Generating prompts...";
    case "completed":
      return "Completed!";
    case "failed":
      return "Failed to scrape";
    default:
      return "";
  }
}
