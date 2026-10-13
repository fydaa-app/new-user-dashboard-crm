"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserListTable from "@/components/tables/UserListTable";
import { useGlobalContext } from "@/context/GlobalState";
import { investmentModelQuery } from "@/context/investmentModel";

import Pagination from "@/components/tables/Pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { UserEndpoints } from "@/config/api-endpoints";

interface User {
  userId:number;
  userName: string;
  mobileNumber: string;
  planName: string;
  managerName: string;
  onboardingDate: string;
  netWorth: number;
  status:string;
  mandateStatus: string;
}

async function fetchUsers(
    page: number, 
    selectedOption: string, 
    selectedEmployee:string = "",
    selectedTeamMember:string = "",
    customDates: { start: string; end: string },
    searchQuery: string = "",
    appType: string = "",
    selectedType: string = "team",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hierarchyViewMode: "team" | "individual" = "team",
    investmentModelFilter: "ALL" | "RIA" | "ARN" = "ALL"
): 
    Promise<{ 
        users: User[]; 
        error: string | null;
        totalUsers?: number;
        limit?: number;
    }> {
    try {
        // Use different endpoint based on app type
        let endpoint: string = UserEndpoints.USER_LIST;
        if (appType === "Fydaa") {
            endpoint = UserEndpoints.USER_LIST_MF;
        }

        let queryParams = `page=${page}`;
    
        if (selectedOption === 'custom') {
          queryParams += `&timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          queryParams += `&timeframe=${selectedOption || "yearly"}`;
        }

        if (searchQuery) {
            queryParams += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        // Use selectedTeamMember if available (team mode), otherwise use selectedEmployee
        const employeeId = selectedTeamMember || selectedEmployee;
        if (employeeId) {
            queryParams += `&employeeId=${employeeId}`;
        }

        if (selectedType) {
            queryParams += `&type=${selectedTeamMember ? hierarchyViewMode : selectedType}`;
        }

        if (appType === "Fydaa") {
            queryParams += investmentModelQuery(investmentModelFilter);
        }

        const url = `${endpoint}?${queryParams}`;
        const response = await apiClient.get<{ users: User[]; totalUsers?: number; limit?: number }>(url);

        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        const data = response.data;
        return { users: Array.isArray(data.users) ? data.users : [], error: null, totalUsers: data.totalUsers, limit: data.limit };
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, appType, selectedType , hierarchyViewMode, investmentModelFilter } = useGlobalContext();
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextPageResetRef = useRef(false);
  const previousFiltersRef = useRef({
    searchQuery: initialSearchQuery,
    selectedOption,
    selectedEmployee,
    selectedTeamMember,
    customDates,
    appType,
    selectedType,
    investmentModelFilter: "ALL" as "ALL" | "RIA" | "ARN",
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
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    try {
      const { users, error, totalUsers: apiTotalUsers, limit } = await fetchUsers(
        page,
        selectedOption,
        selectedEmployee,
        selectedTeamMember,
        customDates,
        searchQuery,
        appType,
        selectedType as unknown as string,
        hierarchyViewMode,
        investmentModelFilter
      );
      // DEBUG: Log user list page data received
      console.log("═══════════════════════════════════════════════════════════");
      console.log("FRONTEND DEBUG [userlist/page.tsx] - USER LIST PAGE");
      console.log("═══════════════════════════════════════════════════════════");
      console.log("App Type:", appType);
      console.log("Timeframe:", selectedOption);
      console.log("Search Query:", searchQuery);
      console.log("Page:", page);
      console.log("Employee ID:", selectedTeamMember || selectedEmployee);
      console.log("-----------------------------------------------------------");
      console.log("TOTAL USERS (from API):", apiTotalUsers);
      console.log("Users on current page:", users?.length || 0);
      console.log("Limit per page:", limit);
      console.log("Total Pages:", apiTotalUsers && limit ? Math.ceil(apiTotalUsers / limit) : 0);
      console.log("═══════════════════════════════════════════════════════════");

      if (requestId !== requestIdRef.current) {
        return;
      }
      
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
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, selectedOption, customDates, searchQuery, selectedEmployee, selectedTeamMember, appType, selectedType, hierarchyViewMode, investmentModelFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when filters change (but skip once when coming back from detail)
  useEffect(() => {
    const prev = previousFiltersRef.current;
    const hasChanged =
      prev.searchQuery !== searchQuery ||
      prev.selectedOption !== selectedOption ||
      prev.selectedEmployee !== selectedEmployee ||
      prev.selectedTeamMember !== selectedTeamMember ||
      (prev.customDates?.start !== customDates?.start) ||
      (prev.customDates?.end !== customDates?.end) ||
      prev.appType !== appType ||
      prev.selectedType !== selectedType ||
      prev.investmentModelFilter !== investmentModelFilter;

    previousFiltersRef.current = { 
      searchQuery, 
      selectedOption, 
      selectedEmployee,
      selectedTeamMember,
      customDates,
      appType,
      selectedType,
      investmentModelFilter,
    };

    if (!hasChanged) return;

    if (skipNextPageResetRef.current) {
      skipNextPageResetRef.current = false;
      return;
    }

    setPage(1);
  }, [searchQuery, selectedOption, selectedEmployee, selectedTeamMember, customDates, appType, selectedType, investmentModelFilter]);

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
            className="mb-4 flex items-center gap-3"
          >
            <div className="relative search-box flex-1">
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
              <UserListTable users={users} error={error} appType={appType} />

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
