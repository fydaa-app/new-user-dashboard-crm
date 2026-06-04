"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { formatCurrency } from "./utils";
import { Transaction, MutualFundTransaction, UserDetails } from "./types";

interface TransactionTabProps {
  transactions: Transaction[];
  transactionsMF?: MutualFundTransaction[];
  userDetails: UserDetails;
}

const StatusBadge = ({ status }: { status: 'FULLY_SUCCESSFUL' | 'PARTIALLY_SUCCESSFUL' | 'FAILED' | 'IN_PROCESS' }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  let variantClasses = "";
  let displayText = "";

  switch (status) {
    case 'FULLY_SUCCESSFUL':
      variantClasses = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      displayText = "Success";
      break;
    case 'FAILED':
      variantClasses = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      displayText = "Failed";
      break;
    case 'IN_PROCESS':
      variantClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      displayText = "In Process";
      break;
    case 'PARTIALLY_SUCCESSFUL':
      variantClasses = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      displayText = "Partial";
      break;
    default:
      variantClasses = "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      displayText = status || "Unknown";
  }

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {displayText}
    </span>
  );
};

const OrderStateBadge = ({ state }: { state: 'submitted' | 'failed' | 'successful' }) => {
  const baseClasses = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  let variantClasses = "";

  switch (state) {
    case 'successful':
      variantClasses = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case 'failed':
      variantClasses = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
    case 'submitted':
      variantClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    default:
      variantClasses = "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {state ? (state.charAt(0).toUpperCase() + state.slice(1)) : "Unknown"}
    </span>
  );
};

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  }).format(date);
};

const getTypeColor = (type: string, lumpsumId?: number | null): 'success' | 'error' | 'warning' => {
  if (type === 'redemption') return 'error';
  if (lumpsumId != null) return 'warning';
  return 'success';
};
const getTypeLabel = (type: string, lumpsumId?: number | null): string => {
  if (type === 'redemption') return 'Sell';
  if (lumpsumId != null) return 'Lumpsum';
  return 'Buy';
};

export default function TransactionTab({ transactions, transactionsMF, userDetails }: TransactionTabProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const isFydaa = userDetails.fromApp?.toLowerCase() === "fydaa";

  const toggleRow = (transactionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedRows(newExpanded);
  };

  // 1. Fydaa Mutual Fund Transactions View
  if (isFydaa) {
    return (
      <div className="overflow-hidden">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            {transactionsMF && transactionsMF.length > 0 ? (
              <table className="w-full">
                <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                  <tr>
                    <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400 w-12"></th>
                    <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Transaction ID</th>
                    <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Type</th> 
                    <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Total Orders</th>
                    <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Successful</th>
                    <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Failed</th>
                    <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Total Amount</th>
                    <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Processed</th>
                    <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Status</th>
                    <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {transactionsMF.map((transaction) => {
                    const isExpanded = expandedRows.has(transaction.transactionId);

                    return (
                      <React.Fragment key={transaction.transactionId}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4 text-start">
                            <button
                              onClick={() => toggleRow(transaction.transactionId)}
                              className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              <svg
                                className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </td>
                          <td className="px-5 py-4 text-start">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {transaction.transactionId}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-start">
                            <Badge color={getTypeColor(transaction.type, transaction.lumpsumId)} size="sm">
                              {getTypeLabel(transaction.type, transaction.lumpsumId)}
                            </Badge>
                          </td>                          
                          <td className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                            {transaction.totalOrders}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                            {transaction.successfulOrders}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                            {transaction.failedOrders}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {formatCurrency(transaction.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {formatCurrency(transaction.processedAmount)}
                          </td>
                          <td className="px-4 py-3 text-start">
                            <StatusBadge status={transaction.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {formatDate(transaction.createdAt)}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={10} className="px-0 py-0 bg-gray-50 dark:bg-white/[0.01]">
                              <div className="px-8 py-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                  Order Details ({transaction.orders?.length || 0} orders)
                                </h4>
                                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/[0.05]">
                                  <table className="w-full">
                                    <thead className="bg-gray-100 dark:bg-white/[0.02]">
                                      <tr>
                                        <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">Scheme</th>
                                        <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">Scheme Name</th>
                                        <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">State</th>
                                        <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">Amount</th>
                                        <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">Processed</th>
                                        <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-start dark:text-gray-400">Error</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                                      {transaction.orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-mono">
                                            {order.scheme}
                                          </td>
                                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                            {order.schemeName}
                                          </td>
                                          <td className="px-4 py-3 text-start">
                                            <OrderStateBadge state={order.state} />
                                          </td>
                                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                            {formatCurrency(order.amount)}
                                          </td>
                                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                            {formatCurrency(order.processed_amount)}
                                          </td>
                                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                            {order.last_error || order.failure_code || "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Transactions Found</h3>
                  <p className="text-gray-500 dark:text-gray-400">This user has no mutual fund transactions.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Savestment Stock Transactions View (Fallback)
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
              Transaction ID
            </TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
              Date
            </TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
              Type
            </TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
              Amount
            </TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
              Quantity
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TableRow key={transaction.transactionId}>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {transaction.transactionId}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge color={transaction.orderType === "BUY" ? "success" : "error"}>
                    {transaction.orderType}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {formatCurrency(transaction.totalAmount)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {transaction.totalTradeQty}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              {/* Use native 'td' here because TableCell does NOT support colSpan props */}
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No stock transactions found.
              </td>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
