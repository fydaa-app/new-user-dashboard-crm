"use client";
import { useEffect, useRef, useState } from "react";

export interface RaceProtectedResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useRaceProtectedFetch<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  deps: unknown[]
): RaceProtectedResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    const execute = async () => {
      try {
        const result = await fetchFn(controller.signal);

        if (currentRequestId === requestIdRef.current && !controller.signal.aborted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current && !controller.signal.aborted) {
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
      controllerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
