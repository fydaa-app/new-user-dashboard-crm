// components/tables/TransactionTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface SaleList {
    userId: string;
    userName: string;
    planName: string;
    amount: number;
    paymentType: string;
    packageGoalName: string;
    date: string;
    time: string;
    managerName: string;
}

export interface UserTableProps {
    payments: SaleList[];
    error: string | null;
    onSortChange?: (sortBy: string, sortOrder: "ASC" | "DESC") => void;
    currentSort?: { sortBy: string; sortOrder: "ASC" | "DESC" };
    showPackageGoal?: boolean;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

export default function SaleReportTable({ 
  payments, 
  error,
  onSortChange,
  currentSort = { sortBy: "date", sortOrder: "DESC" },
  showPackageGoal = true
}: UserTableProps) {

  const handleSort = (sortBy: string) => {
    if (!onSortChange) return;
    
    const newSortOrder = 
      currentSort.sortBy === sortBy && currentSort.sortOrder === "ASC" 
        ? "DESC" 
        : "ASC";
    
    onSortChange(sortBy, newSortOrder);
  };

  const getSortIcon = (column: string) => {
    if (!onSortChange) return null;
    
    if (currentSort.sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (currentSort.sortOrder === "ASC") {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto lg:overflow-visible">
        <div className="min-w-[1102px]">
          {error && <div className="m-4"><p style={{ color: "red" }}>{error}</p></div>}
          {!error && payments.length > 0 ? (
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    <button 
                      onClick={() => handleSort("userName")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      User Name
                      {getSortIcon("userName")}
                    </button>
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    <button 
                      onClick={() => handleSort("paymentType")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Payment Type
                      {getSortIcon("paymentType")}
                    </button>
                  </TableCell>
                  {showPackageGoal && (
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      <button 
                        onClick={() => handleSort("packageGoalName")}
                        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Package/Goal
                        {getSortIcon("packageGoalName")}
                      </button>
                    </TableCell>
                  )}
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    <button 
                      onClick={() => handleSort("planName")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Plan
                      {getSortIcon("planName")}
                    </button>
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    <button 
                      onClick={() => handleSort("managerName")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Manager Name
                      {getSortIcon("managerName")}
                    </button>
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    <button 
                      onClick={() => handleSort("amount")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Fee
                      {getSortIcon("amount")}
                    </button>
                  </TableCell>                  
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    <button 
                      onClick={() => handleSort("date")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Date
                      {getSortIcon("date")}
                    </button>
                  </TableCell>
                </TableRow>
              </TableHeader>
              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {payments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {payment.userName}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {payment.paymentType}
                    </TableCell>
                    {showPackageGoal && (
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {payment.packageGoalName}
                      </TableCell>
                    )}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {payment.planName}
                    </TableCell>                    
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {payment.managerName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(payment.date).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && <div className="m-4">
            <p>No Payments found.</p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
