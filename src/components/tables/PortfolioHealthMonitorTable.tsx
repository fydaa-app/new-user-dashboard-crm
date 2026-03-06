"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Pagination from "./Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { EyeIcon } from "@/icons";

interface User {
  userId: number;
  userName: string;
  planName: string;
  netWorth: number;
  returnRate: number;
  totalPoints: number;
  assetAllocation: {
    IndianStock: number;
    FixedIncomeBonds: number;
    Gold: number;
    GlobalStock: number;
    RealEstate: number;
  };
  dueSips: { sipName: string; dueDate: string }[];
  isRepair: boolean;
}

interface PortfolioHealthMonitorTableProps {
  users: User[];
  totalUsers: number;
  page: number;
  setPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  loading: boolean;
  onSearch?: () => void;
  onSort?: (field: string) => void;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

export default function PortfolioHealthMonitorTable({
  users,
  totalUsers,
  page,
  setPage,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  loading,
  onSearch,
  onSort,
}: PortfolioHealthMonitorTableProps) {
  const router = useRouter();
  const limit = 10;
  const totalPages = Math.ceil(totalUsers / limit);

  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set());

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortOrder === "asc") {
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

  const toggleRow = (userId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    if (onSearch) {
      onSearch();
    }
  };

  const handleSort = (field: string) => {
    console.log('Table handleSort called with field:', field, 'onSort exists:', !!onSort);
    if (onSort) {
      onSort(field);
    } else {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(field);
        setSortOrder("desc");
      }
      setPage(1);
    }
  };

  const handleViewUser = (userId: number) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedUserId", userId.toString());
      sessionStorage.setItem("usersSkipNextPageReset", "true");
    }
    router.push(`/user/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      onClick={() => handleSort("userName")}
                      className="flex items-center gap-1 font-bold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Client Name
                      {getSortIcon("userName")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      onClick={() => handleSort("planName")}
                      className="flex items-center gap-1 font-bold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Plan
                      {getSortIcon("planName")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      onClick={() => handleSort("dueSips")}
                      className="flex items-center gap-1 font-bold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Due SIPs
                      {getSortIcon("dueSips")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      onClick={() => handleSort("netWorth")}
                      className="flex items-center gap-1 font-bold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Networth
                      {getSortIcon("netWorth")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      onClick={() => handleSort("equity")}
                      className="flex items-center gap-1 font-bold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Equity
                      {getSortIcon("equity")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      onClick={() => handleSort("debt")}
                      className="flex items-center gap-1 font-bold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Debt
                      {getSortIcon("debt")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      onClick={() => handleSort("gold")}
                      className="flex items-center gap-1 font-bold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Gold
                      {getSortIcon("gold")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      onClick={() => handleSort("totalPoints")}
                      className="flex items-center gap-1 font-bold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Risk
                      {getSortIcon("totalPoints")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      onClick={() => handleSort("isRepair")}
                      className="flex items-center gap-1 font-bold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Health
                      {getSortIcon("isRepair")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="px-5 py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.userName}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {user.planName}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {!user.dueSips || user.dueSips.length === 0 ? (
                          "-"
                        ) : user.dueSips.length === 1 ? (
                          <span>{new Date(user.dueSips[0].dueDate).toLocaleDateString()}</span>
                        ) : (
                          <div>
                            <button
                              onClick={() => toggleRow(user.userId)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
                            >
                              {user.dueSips.length} SIPs {expandedRows.has(user.userId) ? "▲" : "▼"}
                            </button>
                            {expandedRows.has(user.userId) && (
                              <div className="mt-2 space-y-1 transition-all duration-200 ease-in-out">
                                {user.dueSips.map((sip, idx) => (
                                  <div key={idx} className="text-xs text-blue-700 pl-2 border-l-2 border-blue-300">
                                    {sip.sipName} — {new Date(sip.dueDate).toLocaleDateString()}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(user.netWorth)}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {user.assetAllocation?.IndianStock?.toFixed(1) || 0}%
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {user.assetAllocation?.FixedIncomeBonds?.toFixed(1) || 0}%
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {user.assetAllocation?.Gold?.toFixed(1) || 0}%
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {(() => {
                          const points = user.totalPoints || 0;
                          if (points >= 0 && points <= 21) return "Ultra Conservative";
                          if (points >= 22 && points <= 28) return "Very Conservative";
                          if (points >= 29 && points <= 35) return "Conservative";
                          if (points >= 36 && points <= 42) return "Moderately Conservative";
                          if (points >= 43 && points <= 49) return "Moderately Aggressive";
                          if (points >= 50 && points <= 56) return "Aggressive";
                          if (points >= 57 && points <= 63) return "Very Aggressive";
                          if (points >= 64 && points <= 70) return "Ultra Aggressive";
                          return "-";
                        })()}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.isRepair
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}
                        >
                          {user.isRepair ? 'Rebalance' : 'Healthy'}
                        </span>
                      </TableCell>

                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleViewUser(user.userId)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                          aria-label={`View details for ${user.userName}`}
                          title={`View details for ${user.userName}`}
                        >
                          <EyeIcon />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
