import { useState, useCallback, useRef, useEffect } from "react";
import type { AiStreamEvent, AiUsage } from "@/lib/ai/types";
import { appendGenerationEvent, completeJourneyGeneration } from "@/actions/journey-actions";
import { toast } from "sonner";

export type GenerationState = 
  | "REVIEW"
  | "PREPARING"
  | "STREAMING"
  | "PERSISTING"
  | "READY"
  | "FAILED"
  | "CANCELLED";

export function useJourneyGeneration(journeyId: string, initialStatus?: string) {
  const [state, setState] = useState<GenerationState>(() => {
    if (initialStatus === "GENERATING" || initialStatus === "FAILED") {
      return "FAILED"; // Treat as FAILED so user can retry, since stream is dead on load
    }
    return "REVIEW";
  });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [days, setDays] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isGeneratingRef = useRef(false);
  const hasFinalizedRef = useRef(false);
  const eventBufferRef = useRef<AiStreamEvent[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Abort cleanup on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);

  const flushBuffer = useCallback(() => {
    if (eventBufferRef.current.length > 0) {
      const eventsToFlush = [...eventBufferRef.current];
      eventBufferRef.current = [];
      appendGenerationEvent(journeyId, eventsToFlush).catch(console.error);
    }
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
  }, [journeyId]);

  const queueEventForPersistence = useCallback((event: AiStreamEvent) => {
    eventBufferRef.current.push(event);
    if (!flushTimeoutRef.current) {
      // Batch writes using debounce (1 second) or when buffer hits 5 events.
      // We'll set a 1 second timeout. If 5 events accumulate before timeout, we flush early.
      flushTimeoutRef.current = setTimeout(flushBuffer, 1000);
    }
    if (eventBufferRef.current.length >= 5) {
      flushBuffer();
    }
  }, [flushBuffer]);

  const startGeneration = useCallback(async () => {
    if (isGeneratingRef.current) return;
    
    isGeneratingRef.current = true;
    hasFinalizedRef.current = false;
    setState("PREPARING");
    setStatusMessage("Connecting to AI...");
    setError(null);
    setProgress(0);
    setDays([]);
    setMetadata(null);
    setUsage(null);
    eventBufferRef.current = [];

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        const response = await fetch(`/api/v1/journeys/${journeyId}/generate`, {
          method: "POST",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body stream");
        }

        setState("STREAMING");
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let hasErrorEvent = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line) continue;

            try {
              const event: AiStreamEvent = JSON.parse(line);
              
              queueEventForPersistence(event);

              switch (event.type) {
                case "status":
                  setStatusMessage(event.message);
                  break;
                case "progress":
                  setProgress(event.percentage);
                  break;
                case "day":
                  setDays((prev) => [...prev, event.payload]);
                  break;
                case "usage":
                  setUsage(event.payload);
                  break;
                case "complete":
                  break;
                case "error":
                  toast.error(event.message || "An error occurred during generation.");
                  console.error("Stream error event:", event.message);
                  hasErrorEvent = true;
                  break;
                case "warning":
                  console.warn("Stream warning:", event.message);
                  break;
                default:
                  if ((event as any).type === "meta") {
                    setMetadata((event as any).payload);
                  }
                  break;
              }
            } catch (e) {
              console.error("Failed to parse JSON line:", line, e);
            }
          }

          if (hasErrorEvent) {
            reader.cancel().catch(console.error);
            break;
          }
        }
        
        flushBuffer(); // Ensure remaining events are flushed
        
        if (hasErrorEvent) {
          setState("FAILED");
          isGeneratingRef.current = false;
        } else {
          setState("PERSISTING");
        }
        break; 

      } catch (e: any) {
        if (e.name === "AbortError") {
          setState("CANCELLED");
          isGeneratingRef.current = false;
          toast.info("Journey generation was cancelled.");
          return;
        }

        setState((prevState) => {
          if (prevState === "PREPARING" && retryCount < maxRetries) {
            setStatusMessage(`Reconnecting (attempt ${retryCount + 1} of ${maxRetries})...`);
            return "PREPARING";
          }
          
          // Sanitize error message to prevent leaking raw details
          const friendlyMessage = "We hit a snag while crafting your journey. Please try again.";
          setError(friendlyMessage);
          toast.error(friendlyMessage);
          
          isGeneratingRef.current = false;
          return "FAILED";
        });

        if (retryCount >= maxRetries || state === "STREAMING") {
          break;
        }

        retryCount++;
        await new Promise((res) => setTimeout(res, 1000 * retryCount));
      }
    }
  }, [journeyId, queueEventForPersistence, flushBuffer, state]);

  // Handle finalization safely
  useEffect(() => {
    if (state === "PERSISTING" && !hasFinalizedRef.current) {
      hasFinalizedRef.current = true;
      const finalize = async () => {
        try {
          const res = await completeJourneyGeneration(journeyId, days, metadata, usage, "1.0.0");
          if (res.success) {
            setState("READY");
            toast.success("Journey crafted successfully!");
          } else {
            const friendlyMessage = res.error || "Failed to finalize journey.";
            setError(friendlyMessage);
            setState("FAILED");
            toast.error(friendlyMessage);
          }
        } catch (e: any) {
          const friendlyMessage = "An unexpected error occurred while saving. Please try again.";
          setError(friendlyMessage);
          setState("FAILED");
          toast.error(friendlyMessage);
        } finally {
          isGeneratingRef.current = false;
        }
      };
      finalize();
    }
  }, [state, journeyId, days, metadata, usage]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const retry = useCallback(() => {
    if (state === "FAILED" || state === "CANCELLED") {
      startGeneration();
    }
  }, [state, startGeneration]);

  return {
    state,
    statusMessage,
    progress,
    days,
    metadata,
    usage,
    error,
    startGeneration,
    abort,
    retry
  };
}
