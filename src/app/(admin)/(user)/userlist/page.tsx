"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserListTable from "@/components/tables/UserListTable";
import { useGlobalContext } from "@/context/GlobalState";
import Cookies from 'js-cookie';
import Pagination from "@/components/tables/Pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface User {
  userId:number;
  userName: string;
  mobileNumber: string;
  planName: string;
  managerName: string;
  onboardingDate: string;
  netWorth: number;
  status:string;
}

async function fetchUsers(
    page: number, 
    selectedOption: string, 
    selectedEmployee:string = "",
    customDates: { start: string; end: string },
    searchQuery: string = "",
    appType: string = ""
): 
    Promise<{ 
        users: User[]; 
        error: string | null;
        totalUsers?: number;
        limit?: number;
    }> {
    try {
        // Use different endpoint based on app type
        let endpoint = process.env.NEXT_PUBLIC_USER_LIST_ENDPOINT;
        if (appType === "Fydaa") {
            endpoint = "/referrals/user-list-mf";
        }

        let url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}?page=${page}`;
    
        if (selectedOption === 'custom') {
          url += `&timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `&timeframe=${selectedOption || "yearly"}`;
        }

        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        if (selectedEmployee) {
            url += `&employeeId=${selectedEmployee}`;
        }
console.log("URL:", url);
        const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
                }
            }
        );
  
        if (response.status === 401) {
            Cookies.remove('authToken'); 
            window.location.href = "/signin";          
        }

        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        const data = await response.json();
        return { users: Array.isArray(data.users) ? data.users : [], error: null,totalUsers: data.totalUsers,limit: data.limit };
    } catch (err) {
        console.error("Error fetching data:", err);
        return { users: [], error: "Error fetching data" };
    }
}

// UserTablesPage component (updated with URL sync and skipNextPageReset like clients)

export default function UserTablesPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize state from URL query parameters on first render
  const initialPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [searchParams]);

  const initialSearchQuery = useMemo(() => {
    return searchParams.get("search") ?? "";
  }, [searchParams]);

  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { selectedOption, customDates, selectedEmployee, appType } = useGlobalContext();
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextPageResetRef = useRef(false);
  const previousFiltersRef = useRef({
    searchQuery: initialSearchQuery,
    selectedOption,
    selectedEmployee,
  });

  // When navigating back from the user detail page, skip the first automatic page reset
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("usersSkipNextPageReset") === "true") {
      skipNextPageResetRef.current = true;
      sessionStorage.removeItem("usersSkipNextPageReset");
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { users, error, totalUsers: apiTotalUsers, limit } = await fetchUsers(
        page,
        selectedOption,
        selectedEmployee,
        customDates,
        searchQuery,
        appType
      );
      setUsers(users);
      setError(error);

      if (apiTotalUsers && limit) {
        const calculatedTotalPages = Math.ceil(apiTotalUsers / limit);
        setTotalPages(calculatedTotalPages);
        setTotalUsers(apiTotalUsers);
      }
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedOption, customDates, searchQuery, selectedEmployee, appType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when filters change (but skip once when coming back from detail)
  useEffect(() => {
    const prev = previousFiltersRef.current;
    const hasChanged =
      prev.searchQuery !== searchQuery ||
      prev.selectedOption !== selectedOption ||
      prev.selectedEmployee !== selectedEmployee;

    previousFiltersRef.current = { searchQuery, selectedOption, selectedEmployee };

    if (!hasChanged) return;

    if (skipNextPageResetRef.current) {
      skipNextPageResetRef.current = false;
      return;
    }

    setPage(1);
  }, [searchQuery, selectedOption, selectedEmployee]);

  // Keep URL query parameters in sync with pagination and search state
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

    const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(newUrl);
  }, [page, searchQuery, pathname, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="User" />
      <div className="space-y-6">
        <ComponentCard title="User List">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="mb-4"
          >
            <div className="relative search-box">
              <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                {/* search icon svg preserved from previous code */}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </form>

          {!isLoading && totalUsers > 0 && (
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Showing {users.length} of {totalUsers} total users
              {searchQuery && ` (filtered by "${searchQuery}")`}
            </div>
          )}

          {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

          {isLoading ? (
            <div className="my-10 flex justify-center">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="m-4">
              <p>No users found{searchQuery ? ` matching "${searchQuery}"` : ""}.</p>
            </div>
          ) : (
            <>
              <UserListTable users={users} error={error} />

              {totalUsers > 0 && (
                <div className="mt-4 flex justify-start">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
