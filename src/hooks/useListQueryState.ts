"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * useListQueryState
 *
 * Reusable hook that standardizes URL-synced page + search state for list pages.
 *
 * - Initialises `page` and `searchQuery` from the URL on mount, so that
 *   browser back/forward and refreshes restore the correct state.
 * - Continuously writes `page` and `search` back to the URL via router.replace,
 *   keeping the URL as the single source of truth.
 * - On mount, reads a sessionStorage flag (`${storageKeyPrefix}_SkipNextPageReset`)
 *   and sets `skipNextPageResetRef` so the page-level filter useEffect can skip
 *   its first reset when the user navigates back from the user details page.
 *
 * Usage:
 *   const { page, setPage, searchQuery, setSearchQuery, skipNextPageResetRef } =
 *     useListQueryState("sip_activesip");
 */
export function useListQueryState(storageKeyPrefix: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialise page from URL on first render
  const initialPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, []); // intentionally runs once on mount

  // Initialise search query from URL on first render
  const initialSearchQuery = useMemo(() => {
    return searchParams.get("search") ?? "";
  }, []); // intentionally runs once on mount

  const [page, setPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const skipNextPageResetRef = useRef(false);

  // On mount: check if the list should skip its first filter-driven page reset
  // (set by useUserNavigation when navigating away to the user details page)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const skipKey = `${storageKeyPrefix}_SkipNextPageReset`;
    if (sessionStorage.getItem(skipKey) === "true") {
      skipNextPageResetRef.current = true;
      sessionStorage.removeItem(skipKey);
    }
  }, [storageKeyPrefix]);

  // Sync searchQuery from URL when the user navigates with browser back/forward
  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchQuery(query);
  }, [searchParams]);

  // Keep the URL in sync whenever page or searchQuery changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (page && page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }

    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery === currentQuery) return;

    const newUrl = newQuery ? `${pathname}?${newQuery}` : (pathname ?? "/");
    router.replace(newUrl, { scroll: false });
  }, [page, searchQuery, pathname, router, searchParams]);

  return {
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    skipNextPageResetRef,
  };
}
