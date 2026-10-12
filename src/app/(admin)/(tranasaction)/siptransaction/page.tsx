"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TransactionsTable from "@/components/tables/MfTransactionsTable";
import { useGlobalContext } from "@/context/GlobalState";
import { investmentModelQuery } from "@/context/investmentModel";
import { useFydaaOnlyPage } from "@/hooks/useFydaaOnlyPage";

import Pagination from "@/components/tables/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { TransactionEndpoints } from "@/config/api-endpoints";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import InvestmentCards from "@/components/ecommerce/InvestmentCards";

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
    mobileNumber?: string;
  };
  sipId: number;
  lumpsumId: number | null;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  totalAmount: number;
  processedAmount: number;
  status: string;
  createdAt: string;
  type: string;
  orders: Order[];
}

interface Cards {
  totalAmount: number;
  totalProcessedAmount: number;
  totalLumpsumProcessedAmount: number;
  averageXIRR: number;
//  totalRedemptionProcessedAmount: number;
  uniqueSipCount: number;
}


interface FilterOption {
  value: string;
  label: string;
}

const REPORT_TYPE_OPTIONS: FilterOption[] = [
  { value: "FULLY_SUCCESSFUL", label: "Fully Successful" },
  { value: "PARTIALLY_SUCCESSFUL", label: "Partially Successful" },
  { value: "FAILED", label: "Failed" },
  { value: "IN_PROCESS", label: "In Process" },
];

const TRANSACTION_TYPE_OPTIONS: FilterOption[] = [
  { value: "PURCHASES", label: "All Purchases (Buy + Lumpsum)" },
  { value: "BUY", label: "Buy (Regular Purchases)" },
  { value: "ADDITIONAL_PURCHASE", label: "Lumpsum (One-time Investments)" },
  { value: "SELL", label: "Sell (Redemption)" },
];

async function fetchTransactions(
  page: number,
  selectedOption: string,
  selectedEmployee: string = "",
  selectedTeamMember: string = "",
  customDates: { start: string; end: string },
  searchQuery: string = "",
  reportType: string = "",
  transactionType: string = "",
  selectedType: string = "",
  hierarchyViewMode: "team" | "individual" = "team",
  investmentModelFilter: "ALL" | "RIA" | "ARN" = "ALL"
): Promise<{
  transactions: Transaction[];
  error: string | null;
  totalItems?: number;
  itemsPerPage?: number;
  totalPages?: number;
  cards?: Cards;
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

    if (transactionType) {
      queryParams += `&transactionType=${transactionType}`;
    }

    // Use selectedTeamMember if available (team mode), otherwise use selectedEmployee
    const employeeId = selectedTeamMember || selectedEmployee;
    if (employeeId) {
      queryParams += `&employeeId=${employeeId}`;
    }

    if (selectedType) {
      queryParams += `&type=${selectedTeamMember ? hierarchyViewMode : selectedType}`;
    }

    queryParams += investmentModelQuery(investmentModelFilter);

    const url = `${TransactionEndpoints.TRANSACTIONS_LIST_SIP_MF}?${queryParams}`;
    const response = await apiClient.get<{
      data: Transaction[];
      pagination?: {
        totalItems?: number;
        itemsPerPage?: number;
        totalPages?: number;
      };
      cards?:Cards;
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
      cards: result.cards || { 
        totalAmount: 0, 
        totalProcessedAmount: 0,
        totalLumpsumProcessedAmount: 0,
        averageXIRR: 0,
        uniqueSipCount: 0
      },
    };
  } catch (err) {
    console.error("Error fetching data:", err);
    return { transactions: [], error: "Error fetching data" };
  }
}

export default function TransactionsListPage() {
  useFydaaOnlyPage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType , hierarchyViewMode, investmentModelFilter } = useGlobalContext();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [readyToFetch, setReadyToFetch] = useState(false); // New flag to gate fetch

  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  const [cards, setCards] = useState<Cards>({ 
    totalAmount: 0, 
    totalProcessedAmount: 0,
    totalLumpsumProcessedAmount: 0,
    averageXIRR: 0,
    uniqueSipCount: 0
  });

  // Sync params to local state and then mark readyToFetch true only after states updated
  useEffect(() => {
    const query = searchParams.get("search") || "";
    const type = searchParams.get("reportType");
    const txnType = searchParams.get("transactionType");

    console.log("[DEBUG] Search params changed:", { query, type, txnType });

    // Reset readyToFetch first to prevent fetch with old states
    setReadyToFetch(false);

    // Batch setting states then set readyToFetch true in next tick
    setSearchQuery(query);
    setReportType(type);
    setTransactionType(txnType);
    setPage(1);

    // Delay marking ready (allows states to update before fetch)
    const id = setTimeout(() => setReadyToFetch(true), 10);
    return () => clearTimeout(id);
  }, [searchParams]);

  // Fetch only when readyToFetch true and dependencies changed
  const fetchData = useCallback(async () => {
    if (!readyToFetch) return;
    const requestId = ++requestIdRef.current;

    console.log("[DEBUG] Fetching data with", {
      page,
      selectedOption,
      customDates,
      searchQuery,
      reportType,
      transactionType,
      selectedEmployee,
    });

    try {
      const effectiveReportType = reportType ?? "";
      const effectiveTransactionType = transactionType ?? "";

      const {
        transactions,
        error,
        totalItems: apiTotalItems,
        totalPages: apiTotalPages,
        cards: apiCards,
      } = await fetchTransactions(
        page,
        selectedOption,
        selectedEmployee,
        selectedTeamMember,
        customDates,
        searchQuery,
        effectiveReportType,
        effectiveTransactionType,
        selectedType as unknown as string,
        hierarchyViewMode,
        investmentModelFilter
      );

      if (requestId !== requestIdRef.current) return;
      setTransactions(transactions);
      setError(error);

      if (apiTotalPages) setTotalPages(apiTotalPages);
      if (apiTotalItems) setTotalItems(apiTotalItems);
      if (apiCards) setCards(apiCards);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("Error in fetchData:", err);
      setError("Failed to load data");
    }
    if (requestId === requestIdRef.current) {
      setIsSearching(false);
    }
  }, [page, selectedOption, customDates, searchQuery, reportType, transactionType, selectedEmployee, selectedTeamMember, readyToFetch, selectedType, hierarchyViewMode, investmentModelFilter]);

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
    if (transactionType) {
      params.set("transactionType", transactionType);
    }

    setReadyToFetch(false); // reset ready flag during navigation
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleReportTypeChange = (option: FilterOption | null) => {
    const newReportType = option?.value || null;
    setReportType(newReportType);

    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    if (newReportType) {
      params.set("reportType", newReportType);
    }
    if (transactionType) {
      params.set("transactionType", transactionType);
    }

    setReadyToFetch(false); // reset ready flag during navigation
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleTransactionTypeChange = (option: FilterOption | null) => {
    const newTransactionType = option?.value || null;
    setTransactionType(newTransactionType);

    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    if (reportType) {
      params.set("reportType", reportType);
    }
    if (newTransactionType) {
      params.set("transactionType", newTransactionType);
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
      <PageBreadcrumb pageTitle="Investments" />
      <div className="space-y-6">
        {/* Investment Cards - NEW SECTION */}
        <InvestmentCards 
          totalAmount={cards.totalAmount}
          totalProcessedAmount={cards.totalProcessedAmount}
          totalLumpsumProcessedAmount={cards.totalLumpsumProcessedAmount}
          averageXIRR={cards.averageXIRR}
          uniqueSipCount={cards.uniqueSipCount}
          loading={!readyToFetch}
        />
        <ComponentCard title="Transactions List">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search Box */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  {/* Search icon SVG here */}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by user name, email, transaction ID..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 
text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden 
focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90
dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
                {isSearching && (
                  <span className="absolute -translate-y-1/2 right-4 top-1/2">
                    {/* Loading spinner SVG here */}
                  </span>
                )}
              </div>
            </form>

            {/* Report Type Filter (Status) */}
            <div className="relative">
              <Select
                options={REPORT_TYPE_OPTIONS}
                placeholder="All Statuses"
                value={reportType || ""}
                onChange={handleReportTypeChange}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 
dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>

            {/* Transaction Type Filter */}
            <div className="relative">
              <Select
                options={TRANSACTION_TYPE_OPTIONS}
                placeholder="All Investment Types"
                value={transactionType || ""}
                onChange={handleTransactionTypeChange}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 
dark:text-gray-400">
                <ChevronDownIcon />
              </span>
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