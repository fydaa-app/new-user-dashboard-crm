"use client";
import { useEffect, useRef, useState } from "react";

interface UseFilteredFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFilteredFetch<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  deps: unknown[]
): UseFilteredFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

   useEffect(() => {
    const currentRequestId = ++requestIdRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;

    // Mark loading at start of each fetch
    setLoading(true);

    const execute = async () => {
      try {
        const result = await fetchFn(controller.signal);

        // Only update state if this is still the latest request and not aborted
        if (currentRequestId === requestIdRef.current && !controller.signal.aborted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current && !controller.signal.aborted) {
          setError(err as Error);
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
  }, deps);

  return { data, loading, error };
}
