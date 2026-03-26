import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

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

export function useScrapeWebSocket(pageId?: string) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pageStates, setPageStates] = useState<Record<string, ScrapePageState>>(
    {},
  );

  const connect = useCallback(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const sseUrl = pageId
      ? `${apiUrl}/sse/scrape-progress/${pageId}`
      : `${apiUrl}/sse/scrape-progress`;

    console.log("Connecting to SSE:", sseUrl);

    // Cancel any existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const connectSSE = async () => {
      try {
        const response = await fetch(sseUrl, {
          method: "GET",
          headers: {
            "Accept": "text/event-stream",
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`SSE connection failed with status: ${response.status}`);
        }

        setIsConnected(true);
        console.log("SSE connection opened");

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("ReadableStream not supported");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("SSE connection closed by server");
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              try {
                const event: ScrapeProgressEvent = JSON.parse(data);

                if (event.type === "connected") {
                  console.log("Connected to SSE stream:", data);
                }

                if (event.pageId) {
                  setPageStates((prev) => ({
                    ...prev,
                    [event.pageId]: {
                      progress: event.progress ?? prev[event.pageId]?.progress ?? 0,
                      status: event.status ?? prev[event.pageId]?.status ?? "pending",
                      stage: event.stage ?? prev[event.pageId]?.stage ?? "",
                      message: event.message ?? "",
                      lastUpdated: event.timestamp,
                    },
                  }));

                  // Show toast for important events
                  if (event.type === "completed") {
                    toast.success(
                      `Scrape completed for page ${event.pageId.slice(0, 8)}`,
                    );
                  } else if (event.type === "failed") {
                    toast.error(`Scrape failed: ${event.error || "Unknown error"}`);
                  } else if (event.type === "stage_update" && event.message) {
                    if (event.stage === "detecting" || event.stage === "generating") {
                      toast.info(event.message);
                    }
                  }
                }
              } catch (err) {
                console.error("Failed to parse SSE message:", err, "data:", data);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("SSE connection aborted");
          return;
        }
        console.error("SSE error:", error);
        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect SSE...");
          connect();
        }, 3000);
      }
    };

    connectSSE();
  }, [pageId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

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
