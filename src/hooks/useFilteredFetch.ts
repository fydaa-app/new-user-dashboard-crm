"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseFilteredFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFilteredFetch<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  deps: unknown[]
): UseFilteredFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const refetch = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;

    // Clear stale data/error so consumers never show previous filter results while loading
    setLoading(true);
    setData(null);
    setError(null);

    const execute = async () => {
      try {
        const result = await fetchFnRef.current(controller.signal);

        if (currentRequestId === requestIdRef.current && !controller.signal.aborted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current && !controller.signal.aborted) {
          // Ignore abort errors from superseded requests
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (currentRequestId === requestIdRef.current && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, retryCount]);

  return { data, loading, error, refetch };
}
