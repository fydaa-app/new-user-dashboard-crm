"use client";
import { useEffect, useRef } from "react";

export interface AbortableEffectResult {
  requestIdRef: React.MutableRefObject<number>;
  signal: AbortSignal;
  isLatest: () => boolean;
  abort: () => void;
}

export function useAbortableEffect(
  effect: (ctx: AbortableEffectResult) => void | (() => void),
  deps: unknown[]
): void {
  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;

    const ctx: AbortableEffectResult = {
      requestIdRef,
      signal: controller.signal,
      isLatest: () => currentRequestId === requestIdRef.current,
      abort: () => controller.abort(),
    };

    const cleanup = effect(ctx);

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
      controller.abort();
      controllerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
