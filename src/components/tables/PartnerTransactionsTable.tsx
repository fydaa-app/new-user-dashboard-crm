"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface PartnerTransaction {
  date: string;
  username: string | null;
  amount: number;
  type: string;
}

interface PartnerTransactionsTableProps {
  transactions: PartnerTransaction[];
  isLoading: boolean;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value || 0);

export default function PartnerTransactionsTable({ transactions, isLoading }: PartnerTransactionsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                >
                  Username
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-end text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                >
                  Type
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {transactions.map((transaction, index) => {
                const isWithdrawal = transaction.type === "withdrawal";
                return (
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {transaction.date
                        ? new Date(transaction.date).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {transaction.username || "-"}
                    </TableCell>

                    <TableCell className={`px-5 py-4 text-end text-theme-sm font-medium ${
                      isWithdrawal 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-green-600 dark:text-green-400"
                    }`}>
                      {isWithdrawal ? "-" : "+"}{formatCurrency(transaction.amount)}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isWithdrawal
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}>
                        {transaction.type === "withdrawal" ? "Withdrawal" :
                         transaction.type === "fees_commission" ? "Advisory Fee Commission" :
                         transaction.type === "mf_goal_commission" ? "Fydaa Goal Commission" :
                         transaction.type === "package_commission" ? "Fydaa Package Commission" :
                         transaction.type}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}