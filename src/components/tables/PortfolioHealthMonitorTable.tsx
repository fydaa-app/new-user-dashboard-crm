"use client";

import { useRouter } from "next/navigation";
import Pagination from "./Pagination";

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
  dueSips: any[];
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
  refetch: () => void;
}

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
  refetch,
}: PortfolioHealthMonitorTableProps) {
  const router = useRouter();
  const limit = 10;
  const totalPages = Math.ceil(totalUsers / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
    setPage(1);
  };

  const handleViewUser = (userId: number) => {
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort("userName")}
              >
                Client {sortBy === "userName" && (sortOrder === "ASC" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Plan
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Due SIPs
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort("netWorth")}
              >
                Networth {sortBy === "netWorth" && (sortOrder === "ASC" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Equity
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Debt
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Gold
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort("totalPoints")}
              >
                Risk {sortBy === "totalPoints" && (sortOrder === "ASC" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Health
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.userId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {user.userName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.planName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-900 dark:text-white">
                    {user.dueSips?.length || 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-900 dark:text-white">
                    ₹{user.netWorth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-900 dark:text-white">
                    {user.assetAllocation?.IndianStock?.toFixed(1) || 0}%
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-900 dark:text-white">
                    {user.assetAllocation?.FixedIncomeBonds?.toFixed(1) || 0}%
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-900 dark:text-white">
                    {user.assetAllocation?.Gold?.toFixed(1) || 0}%
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-900 dark:text-white">
                    {user.totalPoints}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isRepair
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {user.isRepair ? 'Rebalance' : 'Healthy'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-center">
                    <button
                      onClick={() => handleViewUser(user.userId)}
                      className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
