"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TransactionsTable from "@/components/tables/MfTransactionsTable";
import { useGlobalContext } from "@/context/GlobalState";

import Pagination from "@/components/tables/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { TransactionEndpoints } from "@/config/api-endpoints";

interface Order {
  id: number;
  scheme: string;
  schemeName: string;
  state: string;
  amount: number;
  processed_amount: number;
  failure_code: string | null;
  last_error: string | null;
}

interface Transaction {
  transactionId: string;
  userId: number;
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  sipId: number;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  totalAmount: number;
  processedAmount: number;
  status: string;
  createdAt: string;
  orders: Order[];
}

async function fetchTransactions(
  page: number,
  selectedOption: string,
  selectedEmployee: string = "",
  customDates: { start: string; end: string },
  searchQuery: string = "",
  selectedType: string = "team",
  reportType: string = "", 
): Promise<{
  transactions: Transaction[];
  error: string | null;
  totalItems?: number;
  itemsPerPage?: number;
  totalPages?: number;
}> {
  try {
    let queryParams = `page=${page}`;

    if (selectedOption === "custom") {
      queryParams += `&timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
    } else {
      queryParams += `&timeframe=${selectedOption || "yearly"}`;
    }

    if (searchQuery) {
      queryParams += `&search=${encodeURIComponent(searchQuery)}`;
    }

    if (reportType) {
      queryParams += `&reportType=${reportType}`;
    }

    if (selectedEmployee) {
      queryParams += `&employeeId=${selectedEmployee}`;
    }

    if (selectedType) {
      queryParams += `&type=${selectedType}`;
    }

    const url = `${TransactionEndpoints.TRANSACTIONS_LIST_SIP_MF}?${queryParams}`;
    const response = await apiClient.get<{
      data: Transaction[];
      pagination?: {
        totalItems?: number;
        itemsPerPage?: number;
        totalPages?: number;
      };
    }>(url);

    if (!response.ok || !response.data) {
      throw new Error("Failed to fetch");
    }

    const result = response.data;

    return {
      transactions: Array.isArray(result.data) ? result.data : [],
      error: null,
      totalItems: result.pagination?.totalItems,
      itemsPerPage: result.pagination?.itemsPerPage,
      totalPages: result.pagination?.totalPages,
    };
  } catch (err) {
    console.error("Error fetching data:", err);
    return { transactions: [], error: "Error fetching data" };
  }
}

export default function TransactionsListPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { selectedOption, customDates, selectedEmployee,selectedType } = useGlobalContext();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [readyToFetch, setReadyToFetch] = useState(false); // New flag to gate fetch

  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync params to local state and then mark readyToFetch true only after states updated
  useEffect(() => {
    const query = searchParams.get("search") || "";
    const type = searchParams.get("reportType");

    console.log("[DEBUG] Search params changed:", { query, type });

    // Batch setting states then set readyToFetch true in next tick
    setSearchQuery(query);
    setReportType(type);
    setPage(1);

    // Delay marking ready (allows states to update before fetch)
    const id = setTimeout(() => setReadyToFetch(true), 0);
    return () => clearTimeout(id);
  }, [searchParams]);

  // Fetch only when readyToFetch true and dependencies changed
  const fetchData = useCallback(async () => {
    if (!readyToFetch) return;

    console.log("[DEBUG] Fetching data with", {
      page,
      selectedOption,
      customDates,
      searchQuery,
      reportType,
      selectedEmployee,
      selectedType,
    });

    try {
      const effectiveReportType = reportType ?? "";

      const {
        transactions,
        error,
        totalItems: apiTotalItems,
        totalPages: apiTotalPages,
      } = await fetchTransactions(
        page,
        selectedOption,
        selectedEmployee,
        customDates,
        searchQuery,
        selectedType as unknown as string,
        effectiveReportType,        
      );

        setTransactions(transactions);
        setError(error);

      if (apiTotalPages) setTotalPages(apiTotalPages);
      if (apiTotalItems) setTotalItems(apiTotalItems);
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError("Failed to load data");
    }
    setIsSearching(false);
  }, [page, selectedOption, customDates, searchQuery, reportType, selectedEmployee, readyToFetch, selectedType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    if (reportType) {
      params.set("reportType", reportType);
    }

    setReadyToFetch(false); // reset ready flag during navigation
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newReportType = e.target.value || null;
    setReportType(newReportType);

    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    if (newReportType) {
      params.set("reportType", newReportType);
    }

    setReadyToFetch(false); // reset ready flag during navigation
    router.push(`?${params.toString()}`, { scroll: false });
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
      <PageBreadcrumb pageTitle="Transactions List" />
      <div className="space-y-6">
        <ComponentCard title="SIP Transactions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search Box */}
            <form onSubmit={handleSearch}>
              <div className="relative search-box">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  {/* Search icon SVG here */}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by user name, email, transaction ID..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-full"
                />
                {isSearching && (
                  <span className="absolute -translate-y-1/2 right-4 top-1/2">
                    {/* Loading spinner SVG here */}
                  </span>
                )}
              </div>
            </form>

            {/* Report Type Filter */}
            <div>
              <select
                value={reportType || ""}
                onChange={handleReportTypeChange}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="">All Transaction Types</option>
                <option value="FULLY_SUCCESSFUL">Fully Successful</option>
                <option value="PARTIALLY_SUCCESSFUL">Partially Successful</option>
                <option value="FAILED">Failed</option>
                <option value="IN_PROCESS">In Process</option>
              </select>
            </div>
          </div>

          <TransactionsTable transactions={transactions} error={error} />
          {totalItems > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
