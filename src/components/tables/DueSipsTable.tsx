import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

export interface DueSipItem {
  sipId: number;
  userId: number;
  userName: string;
  userMobileNumber: string;
  userOnboardingDate: Date;
  sipName: string;
  userSipName: string;
  sipAmount: number;
  sipDate: Date;
  sipTenure: number;
  status: string;
  goalAmount: number;
  startDate: Date;
  endDate: Date;
  portfolioId: number;
  goalId?: number;
  totalPlans: number;
  goalName?: string;
  nextInstallmentDate?: Date | null;
}

export interface DueSipsTableProps {
  sips: DueSipItem[];
  error: string | null;
  loading?: boolean;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

const formatDate = (date: Date | null | undefined): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get date without time for accurate comparison
const getDateOnly = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

// Helper function to determine badge status
const getBadgeStatus = (dueDate: Date) => {
  const dueDateOnly = getDateOnly(dueDate);
  const todayOnly = getDateOnly(new Date());

  if (dueDateOnly < todayOnly) {
    return { color: 'error', text: 'Overdue' };
  } else if (dueDateOnly === todayOnly) {
    return { color: 'warning', text: 'Due Today' };
  } else {
    return { color: 'info', text: 'Due' };
  }
};

export default function DueSipsTable({ sips, error, loading }: DueSipsTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading due SIPs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto overflow-y-auto max-h-[500px]">
        <div className="min-w-[1400px]">
          {error && <div className="m-4"><p style={{ color: "red" }}>{error}</p></div>}
          {!error && sips.length > 0 ? (
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Onboarding Date
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    User Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Mobile
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    SIP Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    User SIP Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Amount
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Tenure
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Goal Amount
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Total Plans
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Start Date
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Due Date
                  </TableCell>
                </TableRow>
              </TableHeader>
              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {sips.map((sip, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      {formatDate(sip.userOnboardingDate)}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {sip.userName}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {sip.userMobileNumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {sip.goalName || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {sip.sipName || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(sip.sipAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {sip.sipTenure} months
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(sip.goalAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {sip.totalPlans}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(sip.startDate)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        {formatDate(sip.nextInstallmentDate)}
                        {sip.nextInstallmentDate && (() => {
                          const badgeStatus = getBadgeStatus(new Date(sip.nextInstallmentDate));
                          return (
                            <Badge color={badgeStatus.color as 'error' | 'warning' | 'info'}>
                              {badgeStatus.text}
                            </Badge>
                          );
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-4 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No due SIPs found for the selected period.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}