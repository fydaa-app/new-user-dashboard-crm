// components/payout/PayoutListTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface PayoutListItem {
  partnerId: number;
  partnerName: string;
  balanceEarned: number;
  balanceWithdrawable: number;
  lifetimeEarning: number;
  onboardingDate: string;
}

export interface PayoutListTableProps {
  payouts: PayoutListItem[];
  error: string | null;
  isLoading: boolean;
}


const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

export default function PayoutListTable({ 
  payouts, 
  error, 
  isLoading
}: PayoutListTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            {error && (
              <div className="m-4">
                <p style={{ color: "red" }}>{error}</p>
              </div>
            )}
            
            {isLoading && (
              <div className="flex h-[400px] items-center justify-center w-full">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!error && !isLoading && payouts.length > 0 ? (
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Partner Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Balance Earned
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Balance Withdrawable
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Lifetime Earning
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Onboarding Date
                    </TableCell>
                  </TableRow>
                </TableHeader>
                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {payouts.map((payout) => (
                    <TableRow key={payout.partnerId}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {payout.partnerName}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(payout.balanceEarned)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(payout.balanceWithdrawable)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(payout.lifetimeEarning)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(payout.onboardingDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              !error &&
              !isLoading && (
                <div className="m-4 flex items-center justify-center h-[200px]">
                  <p className="text-gray-500 dark:text-gray-400">No payout data found.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      
    </div>
  );
}
