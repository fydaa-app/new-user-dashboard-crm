"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/GlobalState";

/**
 * Hook to guard Fydaa-only pages.
 * Redirects to the dashboard if the active app type is not "Fydaa".
 * Reactive — re-runs when appType or userAppTypeLock changes.
 */
export function useFydaaOnlyPage() {
  const { appType, userAppTypeLock } = useGlobalContext();
  const effectiveAppType = userAppTypeLock || appType;
  const router = useRouter();

  useEffect(() => {
    if (effectiveAppType && effectiveAppType !== "Fydaa") {
      router.replace("/");
    }
  }, [effectiveAppType, router]);
}
