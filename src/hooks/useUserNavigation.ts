"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * useUserNavigation
 *
 * Reusable hook for navigating from any list page to the user details page.
 * - Builds the `from` URL automatically from the current path + query string,
 *   so the user details page can always return to the exact originating location.
 * - Writes a per-page sessionStorage skip flag so the list page knows to skip
 *   its automatic page-reset when the user returns.
 * - Works for /userlist (existing behavior), all /sip/* pages, and any future
 *   list sources without requiring page-specific logic.
 */
export function useUserNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigateToUser = (userId: number) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedUserId", userId.toString());

      // Derive skip key dynamically from pathname — no hardcoding of individual pages
      let skipKey = "";
      if (pathname === "/userlist") {
        skipKey = "usersSkipNextPageReset"; // preserves existing userlist behavior unchanged
      } else if (pathname?.startsWith("/sip/")) {
        const pageName = pathname.split("/").pop(); // e.g. "activesip", "cancelledsip"
        skipKey = `sip_${pageName}_SkipNextPageReset`;
      } else {
        // Generic fallback for any future list pages
        const pageName =
          pathname?.replace(/^\/+|\/+$/g, "").replace(/\//g, "_") || "generic";
        skipKey = `${pageName}_SkipNextPageReset`;
      }

      sessionStorage.setItem(skipKey, "true");
    }

    const currentPath = pathname || "/";
    const currentQuery = searchParams.toString();
    const fromUrl = currentQuery
      ? `${currentPath}?${currentQuery}`
      : currentPath;

    router.push(`/user/${userId}?from=${encodeURIComponent(fromUrl)}`);
  };

  return { navigateToUser };
}
