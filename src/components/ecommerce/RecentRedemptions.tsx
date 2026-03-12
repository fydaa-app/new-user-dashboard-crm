"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useGlobalContext } from "@/context/GlobalState";
import { apiClient } from "@/services/api-client";
import { TransactionEndpoints } from "@/config/api-endpoints";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import Pagination from "@/components/tables/Pagination";

interface Order {
  id: number;
  scheme: string;
  schemeName: string;
  state: string;
  amount: number;
  processed_amount: number;
  failure_code: string | null;
  last_error: string | null;
  type?: string;
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
  referredUserInfo?: {
    id: number;
    mobileNumber: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface FilterOption {
  value: string;
  label: string;
}

interface RedemptionsListProps {
  reportType: string;
  onReportTypeChange: (reportType: string) => void;
}

const REPORT_TYPE_OPTIONS: FilterOption[] = [
  { value: "", label: "All Statuses" },
  { value: "FULLY_SUCCESSFUL", label: "Fully Successful" },
  { value: "PARTIALLY_SUCCESSFUL", label: "Partially Successful" },
  { value: "FAILED", label: "Failed" },
  { value: "IN_PROCESS", label: "In Process" },
];

async function fetchRedemptions(
  page: number,
  selectedOption: string,
  selectedEmployee: string = "",
  selectedTeamMember: string = "",
  customDates: { start: string; end: string },
  searchQuery: string = "",
  reportType: string = "",
  selectedType: string = "",
  hierarchyViewMode: "team" | "individual" = "team"
): Promise<{
  transactions: Transaction[];
  error: string | null;
  totalItems?: number;
  totalPages?: number;
}> {
  try {
    let queryParams = `page=${page}&transactionType=SELL`;

    if (selectedOption === 'custom') {
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

    const employeeId = selectedTeamMember || selectedEmployee;
    if (employeeId) {
      queryParams += `&employeeId=${employeeId}`;
    }

    if (selectedType) {
      queryParams += `&type=${selectedTeamMember ? hierarchyViewMode : selectedType}`;
    }

    const url = `${TransactionEndpoints.TRANSACTIONS_LIST_SIP_MF}?${queryParams}`;
    
    const response = await apiClient.get<{
      data: Transaction[];
      pagination?: {
        totalItems?: number;
        totalPages?: number;
      };
    }>(url);

    if (!response.ok || !response.data) {
      throw new Error("Failed to fetch");
    }

    return {
      transactions: Array.isArray(response.data.data) ? response.data.data : [],
      error: null,
      totalItems: response.data.pagination?.totalItems,
      totalPages: response.data.pagination?.totalPages,
    };
  } catch (err) {
    console.error("Error fetching redemptions:", err);
    return { transactions: [], error: "Error fetching data" };
  }
}

export default function RedemptionsList({ reportType, onReportTypeChange }: RedemptionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode } = useGlobalContext();
  
  const previousFiltersRef = useRef({
    selectedOption,
    selectedEmployee,
    selectedTeamMember,
    customDates,
    selectedType,
    reportType,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const effectiveSelectedType = selectedType && selectedType.length > 0 ? selectedType[0] : "team";

      const result = await fetchRedemptions(
        page,
        selectedOption,
        selectedEmployee,
        selectedTeamMember,
        customDates,
        searchQuery,
        reportType,
        effectiveSelectedType,
        hierarchyViewMode
      );

      setTransactions(result.transactions);
      setError(result.error);
      if (result.totalItems !== undefined) {
        setTotalItems(result.totalItems);
      }
      if (result.totalPages !== undefined) {
        setTotalPages(result.totalPages);
      }
    } catch (err) {
      console.error("Error fetching redemptions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, searchQuery, reportType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const prev = previousFiltersRef.current;
    const hasChanged =
      prev.selectedOption !== selectedOption ||
      prev.selectedEmployee !== selectedEmployee ||
      prev.selectedTeamMember !== selectedTeamMember ||
      (prev.customDates?.start !== customDates?.start) ||
      (prev.customDates?.end !== customDates?.end) ||
      prev.selectedType !== selectedType ||
      prev.reportType !== reportType;

    previousFiltersRef.current = {
      selectedOption,
      selectedEmployee,
      selectedTeamMember,
      customDates,
      selectedType,
      reportType,
    };

    if (hasChanged) {
      setPage(1);
    }
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, reportType]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleReportTypeChangeLocal = (option: FilterOption | null) => {
    const value = option?.value || "";
    onReportTypeChange(value);
    setPage(1);
  };

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'FULLY_SUCCESSFUL':
        return 'success';
      case 'PARTIALLY_SUCCESSFUL':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'IN_PROCESS':
        return 'warning';
      default:
        return 'warning';
    }
  };

  const getReferredByName = (referredUserInfo: { firstName: string | null; lastName: string | null } | null | undefined): string => {
    if (!referredUserInfo) return '-';
    const firstName = referredUserInfo.firstName || '';
    const lastName = referredUserInfo.lastName || '';
    return `${firstName} ${lastName}`.trim() || '-';
  };

  return (
    <div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Search Box */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name, email, transaction ID..."
              className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-4 pr-14 
                text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden 
                focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90
                dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
        </form>

        {/* Status Filter */}
        <div className="relative">
          <Select
            options={REPORT_TYPE_OPTIONS}
            placeholder="All Statuses"
            value={reportType}
            onChange={handleReportTypeChangeLocal}
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 
            dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto lg:overflow-visible">
          <div className="min-w-[1200px]">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : error ? (
              <div className="m-4"><p style={{ color: "red" }}>{error}</p></div>
            ) : transactions.length > 0 ? (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Transaction ID
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Type
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      User Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Referred By
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Email
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Total Orders
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Successful
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Failed
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Total Amount
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Processed Amount
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Date
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.transactionId} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {transaction.transactionId}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge color="error" size="sm">
                          Sell
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {transaction.userInfo.firstName} {transaction.userInfo.lastName}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {getReferredByName(transaction.referredUserInfo)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {transaction.userInfo.email}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {transaction.totalOrders}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-green-600 dark:text-green-400 text-start text-theme-sm font-semibold">
                        {transaction.successfulOrders}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-red-600 dark:text-red-400 text-start text-theme-sm font-semibold">
                        {transaction.failedOrders}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(transaction.totalAmount)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(transaction.processedAmount)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-theme-sm">
                        <Badge color={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="m-4">
                <p className="text-center py-8 text-gray-500">No redemptions found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
