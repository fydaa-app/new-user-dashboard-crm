"use client";
import React from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import DashboardSkeleton from "@/components/common/DashboardSkeleton";
import DashboardLoadError from "@/components/common/DashboardLoadError";

interface SummaryData {
  totalOrders: number;
  totalTransactions: number;
  transactionCounts: {
    total: number;
    purchases: number;
    lumpsum: number;
    redemptions: number;
  };
  fullySuccessful: {
    count: number;
    amount: number;
    processedAmount: number;
    buy: {
      count: number;
      amount: number;
      processedAmount: number;
    };
    lumpsum: { count: number; amount: number; processedAmount: number; };
    sell: {
      count: number;
      amount: number;
      processedAmount: number;
    };
  };
  failed: {
    count: number;
    amount: number;
    processedAmount: number;
    buy: {
      count: number;
      amount: number;
      processedAmount: number;
    };
    lumpsum: { count: number; amount: number; processedAmount: number; };
    sell: {
      count: number;
      amount: number;
      processedAmount: number;
    };
  };
  partiallySuccessful: {
    count: number;
    amount: number;
    processedAmount: number;
    buy: {
      count: number;
      amount: number;
      processedAmount: number;
    };
    lumpsum: { count: number; amount: number; processedAmount: number; };
    sell: {
      count: number;
      amount: number;
      processedAmount: number;
    };
  };
  inProcess: {
    count: number;
    amount: number;
    processedAmount: number;
    buy: {
      count: number;
      amount: number;
      processedAmount: number;
    };
    lumpsum: { count: number; amount: number; processedAmount: number; };
    sell: {
      count: number;
      amount: number;
      processedAmount: number;
    };
  };
  overallStats: {
    totalAmount: number;
    totalProcessedAmount: number;
    totalBuyAmount: number;
    totalLumpsumAmount: number;
    totalSellAmount: number;
    totalProcessedBuyAmount: number;
    totalLumpsumProcessed: number;
    totalProcessedSellAmount: number;
    successRate: number;
  };
  stateBreakdown: {
    successful: number;
    failed: number;
    submitted: number;
  };
  typeBreakdown: {
    purchase: number;
    redemption: number;
    additional_purchase: number;
  };
}

const emptySummaryData = (): SummaryData => ({
  totalOrders: 0,
  totalTransactions: 0,
  transactionCounts: { total: 0, purchases: 0, lumpsum: 0, redemptions: 0 },
  fullySuccessful: {
    count: 0, amount: 0, processedAmount: 0,
    buy: { count: 0, amount: 0, processedAmount: 0 },
    lumpsum: { count: 0, amount: 0, processedAmount: 0 },
    sell: { count: 0, amount: 0, processedAmount: 0 },
  },
  failed: {
    count: 0, amount: 0, processedAmount: 0,
    buy: { count: 0, amount: 0, processedAmount: 0 },
    lumpsum: { count: 0, amount: 0, processedAmount: 0 },
    sell: { count: 0, amount: 0, processedAmount: 0 },
  },
  partiallySuccessful: {
    count: 0, amount: 0, processedAmount: 0,
    buy: { count: 0, amount: 0, processedAmount: 0 },
    lumpsum: { count: 0, amount: 0, processedAmount: 0 },
    sell: { count: 0, amount: 0, processedAmount: 0 },
  },
  inProcess: {
    count: 0, amount: 0, processedAmount: 0,
    buy: { count: 0, amount: 0, processedAmount: 0 },
    lumpsum: { count: 0, amount: 0, processedAmount: 0 },
    sell: { count: 0, amount: 0, processedAmount: 0 },
  },
  overallStats: {
    totalAmount: 0, totalProcessedAmount: 0, totalBuyAmount: 0, totalLumpsumAmount: 0,
    totalSellAmount: 0, totalProcessedBuyAmount: 0, totalLumpsumProcessed: 0,
    totalProcessedSellAmount: 0, successRate: 0,
  },
  stateBreakdown: { successful: 0, failed: 0, submitted: 0 },
  typeBreakdown: { purchase: 0, redemption: 0, additional_purchase: 0 },
});

const TransactionSummary = ({
  data,
  loading,
  error,
  onRetry,
}: {
  data: SummaryData | null;
  loading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}) => {
  // Format currency to always show .00 even for whole numbers
  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0.00';
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return <DashboardSkeleton variant="cards" count={6} />;
  }

  if (error) {
    return (
      <DashboardLoadError
        message={error.message || "Failed to load transaction summary"}
        onRetry={onRetry || (() => {})}
      />
    );
  }

  const summary = data || emptySummaryData();

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              <a href="/siptransaction" className="flex items-center gap-2 group">
                Transaction Summary
                <ArrowRightIcon className="w-4 h-4 inline-block group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Comprehensive overview of all transactions
            </span>
          </div>

          <a
            href="/siptransaction"
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300 group"
          >
            View All
            <ArrowRightIcon className="w-3 h-3 inline-block group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>

        {/* Main Stats Grid - Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Total Transactions - All transactions */}
          <Link
            href="/siptransaction"
            className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 border border-purple-200 dark:border-purple-800 hover:scale-[1.02] transition-all duration-300 ease-in-out"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {summary.transactionCounts?.total || summary.totalTransactions}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
              </div>
            </div>
          </Link>

          {/* Total Purchases - Buy Only */}
          <Link
            href="/siptransaction?transactionType=BUY"
            className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 border border-green-200 dark:border-green-800 hover:scale-[1.02] transition-all duration-300 ease-in-out"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CurrencyRupeeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {summary.transactionCounts?.purchases || 0}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Purchases</p>
              </div>
            </div>
          </Link>

          {/* Total Lumpsum - Additional Purchases */}
          <Link
            href="/siptransaction?transactionType=ADDITIONAL_PURCHASE"
            className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 border border-indigo-200 dark:border-indigo-800 hover:scale-[1.02] transition-all duration-300 ease-in-out"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <CurrencyRupeeIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {summary.transactionCounts?.lumpsum || 0}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Lumpsum</p>
              </div>
            </div>
          </Link>

          {/* Total Redemptions - Sell */}
          <Link
            href="/siptransaction?transactionType=SELL"
            className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 border border-orange-200 dark:border-orange-800 hover:scale-[1.02] transition-all duration-300 ease-in-out"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <ArrowRightIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {summary.transactionCounts?.redemptions || 0}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Redemptions</p>
              </div>
            </div>
          </Link>

        </div>

        {/* Transaction Status Cards - Updated to 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Fully Successful */}
          <div className="rounded-xl bg-green-50 dark:bg-green-900/10 p-4 border border-green-200 dark:border-green-800 hover:scale-[1.02] transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <Link href="/siptransaction?reportType=FULLY_SUCCESSFUL" className="flex items-center gap-1.5 cursor-pointer group">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  Fully Successful
                </h4>
                <ArrowRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            <div className="space-y-3">
              <div className="space-y-1 pb-2 border-b border-green-200 dark:border-green-800/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Count:</span>
                  <span className="font-semibold text-gray-800 dark:text-white text-lg">
                    {summary.fullySuccessful.count}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>{summary.fullySuccessful.buy?.count || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>{summary.fullySuccessful.lumpsum?.count || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>{summary.fullySuccessful.sell?.count || 0}</span>
                </div>
              </div>
{/* 
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₹{formatCurrency(summary.fullySuccessful.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>₹{formatCurrency(summary.fullySuccessful.buy?.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>₹{formatCurrency(summary.fullySuccessful.lumpsum?.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>₹{formatCurrency(summary.fullySuccessful.sell?.amount)}</span>
                </div>
              </div> */}

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Processed Amount:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ₹{formatCurrency(summary.fullySuccessful.processedAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>₹{formatCurrency(summary.fullySuccessful.buy?.processedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>₹{formatCurrency(summary.fullySuccessful.lumpsum?.processedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>₹{formatCurrency(summary.fullySuccessful.sell?.processedAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Partially Successful */}
          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/10 p-4 border border-yellow-200 dark:border-yellow-800 hover:scale-[1.02] transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-2 mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <Link href="/siptransaction?reportType=PARTIALLY_SUCCESSFUL" className="flex items-center gap-1.5 cursor-pointer group">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  Partially Successful
                </h4>
                <ArrowRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            <div className="space-y-3">
              <div className="space-y-1 pb-2 border-b border-yellow-200 dark:border-yellow-800/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Count:</span>
                  <span className="font-semibold text-gray-800 dark:text-white text-lg">
                    {summary.partiallySuccessful.count}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>{summary.partiallySuccessful.buy?.count || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>{summary.partiallySuccessful.lumpsum?.count || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>{summary.partiallySuccessful.sell?.count || 0}</span>
                </div>
              </div>

              {/* <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₹{formatCurrency(summary.partiallySuccessful.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>₹{formatCurrency(summary.partiallySuccessful.buy?.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>₹{formatCurrency(summary.partiallySuccessful.lumpsum?.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>₹{formatCurrency(summary.partiallySuccessful.sell?.amount)}</span>
                </div>
              </div> */}

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Processed Amount:</span>
                  <span className="font-bold text-yellow-600 dark:text-yellow-400">
                    ₹{formatCurrency(summary.partiallySuccessful.processedAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>₹{formatCurrency(summary.partiallySuccessful.buy?.processedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>₹{formatCurrency(summary.partiallySuccessful.lumpsum?.processedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>₹{formatCurrency(summary.partiallySuccessful.sell?.processedAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Failed */}
          <div className="rounded-xl bg-red-50 dark:bg-red-900/10 p-4 border border-red-200 dark:border-red-800 hover:scale-[1.02] transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-2 mb-3">
              <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              <Link href="/siptransaction?reportType=FAILED" className="flex items-center gap-1.5 cursor-pointer group">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  Failed
                </h4>
                <ArrowRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            <div className="space-y-3">
              <div className="space-y-1 pb-2 border-b border-red-200 dark:border-red-800/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Count:</span>
                  <span className="font-semibold text-gray-800 dark:text-white text-lg">
                    {summary.failed.count}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>{summary.failed.buy?.count || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>{summary.failed.lumpsum?.count || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>{summary.failed.sell?.count || 0}</span>
                </div>
              </div>
{/* 
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₹{formatCurrency(summary.failed.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>₹{formatCurrency(summary.failed.buy?.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>₹{formatCurrency(summary.failed.lumpsum?.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>₹{formatCurrency(summary.failed.sell?.amount)}</span>
                </div>
              </div> */}

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Processed Amount:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    ₹{formatCurrency(summary.failed.processedAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>₹{formatCurrency(summary.failed.buy?.processedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>₹{formatCurrency(summary.failed.lumpsum?.processedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>₹{formatCurrency(summary.failed.sell?.processedAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* In Process - NEW CARD */}
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 p-4 border border-blue-200 dark:border-blue-800 hover:scale-[1.02] transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <Link href="/siptransaction?reportType=IN_PROCESS" className="flex items-center gap-1.5 cursor-pointer group">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  In Process
                </h4>
                <ArrowRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            <div className="space-y-3">
              <div className="space-y-1 pb-2 border-b border-blue-200 dark:border-blue-800/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Count:</span>
                  <span className="font-semibold text-gray-800 dark:text-white text-lg">
                    {summary.inProcess.count}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>{summary.inProcess.buy?.count || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>{summary.inProcess.lumpsum?.count || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>{summary.inProcess.sell?.count || 0}</span>
                </div>
              </div>

              {/* <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₹{formatCurrency(summary.inProcess.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>₹{formatCurrency(summary.inProcess.buy?.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>₹{formatCurrency(summary.inProcess.lumpsum?.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>₹{formatCurrency(summary.inProcess.sell?.amount)}</span>
                </div>
              </div> */}

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Processed Amount:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ₹{formatCurrency(summary.inProcess.processedAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-green-300 dark:border-green-700">
                  <span>Buy:</span>
                  <span>₹{formatCurrency(summary.inProcess.buy?.processedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span>Lumpsum:</span>
                  <span>₹{formatCurrency(summary.inProcess.lumpsum?.processedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-orange-300 dark:border-orange-700">
                  <span>Sell:</span>
                  <span>₹{formatCurrency(summary.inProcess.sell?.processedAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyRupeeIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-semibold text-gray-800 dark:text-white">
                Total Amount
              </h4>
            </div>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ₹{formatCurrency(summary.overallStats.totalAmount)}
            </p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Total Buy:</span>
                <span className="font-medium">₹{formatCurrency(summary.overallStats.totalBuyAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Total Lumpsum:</span>
                <span className="font-medium">₹{formatCurrency(summary.overallStats.totalLumpsumAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Total Sell:</span>
                <span className="font-medium">₹{formatCurrency(summary.overallStats.totalSellAmount)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-4 border border-teal-200 dark:border-teal-800">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyRupeeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h4 className="font-semibold text-gray-800 dark:text-white">
                Total Processed
              </h4>
            </div>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              ₹{formatCurrency(summary.overallStats.totalProcessedAmount)}
            </p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Buy Processed:</span>
                <span className="font-medium">₹{formatCurrency(summary.overallStats.totalProcessedBuyAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Lumpsum Processed:</span>
                <span className="font-medium">₹{formatCurrency(summary.overallStats.totalLumpsumProcessed)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Sell Processed:</span>
                <span className="font-medium">₹{formatCurrency(summary.overallStats.totalProcessedSellAmount)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {summary.overallStats.successRate.toFixed(2)}%
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="grid grid-cols-12 gap-4 mt-6">
          {/* Transaction Type Breakdown */}
          <div className="rounded-xl bg-gray-50 dark:bg-gray-900/20 p-4 border border-gray-200 dark:border-gray-800 xl:col-span-6 col-span-12">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
              Total Orders
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {summary.totalOrders}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {summary.typeBreakdown.purchase}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">SIP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {summary.typeBreakdown.redemption}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Redemption</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {summary.typeBreakdown.additional_purchase}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lumpsum</p>
              </div>
            </div>
          </div>

          {/* State Breakdown - Updated to 3 columns */}
          <div className="rounded-xl bg-gray-50 dark:bg-gray-900/20 p-4 border border-gray-200 dark:border-gray-800 xl:col-span-6 col-span-12">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
              Order State
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {summary.stateBreakdown.successful}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {summary.stateBreakdown.failed}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {summary.stateBreakdown.submitted}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">In Process</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TransactionSummary;