"use client";

export interface BehindGoalItem {
  sipId: number;
  userId: number;
  username: string;
  referredByName: string;
  userMobileNumber: string;
  userOnboardingDate: Date;
  userSipName: string;
  sipName: string;
  sipAmount: number;
  sipDate: Date;
  sipTenure: number;
  sipFrequency: string;
  startDate: Date;
  endDate: Date;
  portfolioId: number;
  goalId: number;
  totalPlans: number;
  nextInstallmentDate: Date | null;
  goalName: string;
  goalPercentage: number;
  investedAmount: number;
  goalAmount: number;
}

export interface BehindGoalsData {
  data: BehindGoalItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface BehindGoalsListProps {
  data: BehindGoalsData | null;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export default function BehindGoalsList({
  data,
  loading,
  onPageChange,
}: BehindGoalsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No behind goals found
        </p>
      </div>
    );
  }

  const { data: goals, pagination } = data;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Goal Name</th>
              <th className="px-4 py-3 font-medium text-right">Progress</th>
              <th className="px-4 py-3 font-medium text-right">Invested</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {goals.map((goal) => (
              <tr
                key={goal.sipId}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {goal.username}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-700 dark:text-gray-300">
                    {goal.goalName}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${Math.min(goal.goalPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.goalPercentage.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{goal.investedAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
