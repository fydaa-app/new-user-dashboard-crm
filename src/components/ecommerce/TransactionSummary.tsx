"use client";
import React from "react";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface SummaryData {
  totalOrders: number;
  totalTransactions: number;
  fullySuccessful: {
    count: number;
    amount: number;
    processedAmount: number;
  };
  failed: {
    count: number;
    amount: number;
    processedAmount: number;
  };
  partiallySuccessful: {
    count: number;
    amount: number;
    processedAmount: number;
  };
  inProcess: {
    count: number;
    amount: number;
    processedAmount: number;
  };
  overallStats: {
    totalAmount: number;
    totalProcessedAmount: number;
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

const TransactionSummary = ({ 
  data, 
  loading 
}: { 
  data: SummaryData | null; 
  loading: boolean 
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-center text-gray-500">Loading transaction summary...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-center text-gray-500">No transaction data available.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
             <a href="/siptransaction">Transaction Summary</a> 
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Comprehensive overview of all transactions
            </span>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Total Transactions */}
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {data.totalTransactions}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          

          {/* Total Orders */}
          {/* <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {data.totalOrders}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              </div>
            </div>
          </div> */}

        </div>

        {/* Transaction Status Cards - Updated to 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Fully Successful */}
          <div className="rounded-xl bg-green-50 dark:bg-green-900/10 p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="font-semibold text-gray-800 dark:text-white">
                Fully Successful
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Count:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {data.fullySuccessful.count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  ₹{data.fullySuccessful.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Processed:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ₹{data.fullySuccessful.processedAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Partially Successful */}
          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/10 p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h4 className="font-semibold text-gray-800 dark:text-white">
                Partially Successful
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Count:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {data.partiallySuccessful.count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  ₹{data.partiallySuccessful.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Processed:</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  ₹{data.partiallySuccessful.processedAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Failed */}
          <div className="rounded-xl bg-red-50 dark:bg-red-900/10 p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-3">
              <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h4 className="font-semibold text-gray-800 dark:text-white">
                Failed
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Count:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {data.failed.count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  ₹{data.failed.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Processed:</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  ₹{data.failed.processedAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* In Process - NEW CARD */}
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-gray-800 dark:text-white">
                In Process
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Count:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {data.inProcess.count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  ₹{data.inProcess.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Processed:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  ₹{data.inProcess.processedAmount.toLocaleString()}
                </span>
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
              ₹{data.overallStats.totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-4 border border-teal-200 dark:border-teal-800">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyRupeeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h4 className="font-semibold text-gray-800 dark:text-white">
                Total Processed
              </h4>
            </div>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              ₹{data.overallStats.totalProcessedAmount.toLocaleString()}
            </p>
          </div>

           <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {data.overallStats.successRate.toFixed(2)}%
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
                   {data.totalOrders}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.typeBreakdown.purchase}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">SIP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {data.typeBreakdown.redemption}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Redemption</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {data.typeBreakdown.additional_purchase}
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
                  {data.stateBreakdown.successful}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {data.stateBreakdown.failed}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.stateBreakdown.submitted}
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