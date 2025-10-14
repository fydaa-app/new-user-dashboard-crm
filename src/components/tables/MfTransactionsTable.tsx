import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

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
  };
  sipId: number;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  totalAmount: number;
  processedAmount: number;
  status: string;
  createdAt: string;
  orders: Order[];
}

export interface TransactionsTableProps {
  transactions: Transaction[];
  error: string | null;
}

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

const getOrderStateColor = (state: string): 'success' | 'error' => {
  return state === 'successful' ? 'success' : 'error';
};

export default function TransactionsTable({ transactions, error }: TransactionsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (transactionId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1600px]">
          {error && <div className="m-4"><p style={{ color: "red" }}>{error}</p></div>}
          {!error && transactions.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400 w-10">
                    .
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Transaction ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    User Name
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
                {transactions.map((transaction) => {
                  const isExpanded = expandedRows.has(transaction.transactionId);
                  return (
                    <React.Fragment key={transaction.transactionId}>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer">
                        <TableCell className="px-5 py-4 text-start">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleRow(transaction.transactionId)}
                            onKeyPress={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                toggleRow(transaction.transactionId);
                              }
                            }}
                            className="inline-flex items-center cursor-pointer"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "Collapse row" : "Expand row"}
                          >
                            {isExpanded ? (
                              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                            {transaction.transactionId}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {transaction.userInfo.firstName} {transaction.userInfo.lastName}
                          </span>
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
                      
                      {/* Expanded Orders Details */}
                      {isExpanded && (
                        <TableRow>
                          <td colSpan={11} className="px-8 py-4 bg-gray-50 dark:bg-white/[0.02]">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-3">
                                Order Details ({transaction.orders.length} orders)
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full">
                                  <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Scheme</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Scheme Name</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">State</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Processed</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Error</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {transaction.orders.map((order) => (
                                      <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-white/[0.03]">
                                        <td className="px-3 py-2 text-xs font-mono text-gray-600 dark:text-gray-400">
                                          {order.scheme}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-xs truncate">
                                          {order.schemeName}
                                        </td>
                                        <td className="px-3 py-2 text-xs">
                                          <Badge color={getOrderStateColor(order.state)} size="sm">
                                            {order.state}
                                          </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                                          {formatCurrency(order.amount)}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                                          {formatCurrency(order.processed_amount)}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-red-600 dark:text-red-400">
                                          {order.last_error || '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            !error &&
            <div className="m-4">
              <p>No transactions found.</p>
            </div>             
          )}
        </div>
      </div>
    </div>
  );
}