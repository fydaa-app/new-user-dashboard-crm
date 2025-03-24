"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface UserTabProps {
  userDetails: any;
  portfolioDetails: any[];
  transactions: any[];
  subscriptions: any[];
  stockOrders: any[];
}

export default function UserTab({
  userDetails,
  portfolioDetails,
  transactions,
  subscriptions,
  stockOrders
}: UserTabProps) {
  const [activeTab, setActiveTab] = useState('Portfolio');

  // Format currency values
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(value);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Left Column - User Profile */}
      <div className="col-span-12 xl:col-span-4 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userDetails?.firstName} {userDetails?.lastName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userDetails?.userRole}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userDetails?.city}, {userDetails?.country}
                </p>
              </div>
              {/* Additional User Details */}
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Email: {userDetails?.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Phone: {userDetails?.callingCode} {userDetails?.mobileNumber}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  PAN Status: {userDetails?.panStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Tabs Content */}
      <div className="col-span-12 xl:col-span-8 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5">
          {/* Tabs Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {['Portfolio', 'Transaction', 'Subscription', 'Stock', 'Profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    activeTab === tab 
                      ? 'bg-primary dark:bg-primary-dark bg-gray-100 text-gray-500'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            
            {/* Portfolio Tab */}
            {activeTab === 'Portfolio' && portfolioDetails?.map((portfolio) => (
              <div key={portfolio.portfolioId} className="p-4">
                <h3 className="text-lg font-semibold mb-4">{portfolio.portfolioName}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Stock Name</TableCell>
                      <TableCell>Ticker</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Invested Value</TableCell>
                      <TableCell>Current Value</TableCell>
                      <TableCell>Returns</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.stocks?.map((stock:any) => (
                      <TableRow key={stock.stockId}>
                        <TableCell>{stock.stockName}</TableCell>
                        <TableCell>{stock.ticker}</TableCell>
                        <TableCell>{stock.balanceQty}</TableCell>
                        <TableCell>{formatCurrency(stock.investedValue)}</TableCell>
                        <TableCell>{formatCurrency(stock.currentValue)}</TableCell>
                        <TableCell>
                          <Badge color={stock.totalProfit >= 0 ? "success" : "error"}>
                            {formatCurrency(stock.totalProfit)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Total Invested</p>
                    <p className="font-medium">{formatCurrency(portfolio.totalInvestedValue)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Current Value</p>
                    <p className="font-medium">{formatCurrency(portfolio.currentValue)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Transaction Tab */}
            {activeTab === 'Transaction' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.transactionId}>
                      <TableCell className="font-mono">{transaction.transactionId}</TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge color={transaction.orderType === 'BUY' ? 'success' : 'error'}>
                          {transaction.orderType}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.totalAmount)}</TableCell>
                      <TableCell>{transaction.totalTradeQty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Subscription Tab */}
            {activeTab === 'Subscription' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Plan Name</TableCell>
                    <TableCell>Subscription Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions?.map((subscription, index) => (
                    <TableRow key={index}>
                      <TableCell>{subscription.plan_name}</TableCell>
                      <TableCell>
                        {new Date(userDetails.subscription_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge color={userDetails.main_subscription_status ? 'success' : 'error'}>
                          {userDetails.main_subscription_status ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Stock Orders Tab */}
            {activeTab === 'Stock' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Stock</TableCell>
                    <TableCell>Ticker</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Avg. Price</TableCell>
                    <TableCell>Total Value</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockOrders?.map((order) => (
                    <TableRow key={order.stockId}>
                      <TableCell>{order['stock.stockName']}</TableCell>
                      <TableCell>{order['stock.ticker']}</TableCell>
                      <TableCell>{order.quantityDifference}</TableCell>
                      <TableCell>{formatCurrency(order.avgValue)}</TableCell>
                      <TableCell>{formatCurrency(order.netValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Profile Tab */}
            {activeTab === 'Profile' && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p>{new Date(userDetails.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p>{userDetails.address?.addressLine1}</p>
                    <p>{userDetails.pincode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">KYC Status</p>
                    <Badge color={userDetails.panStatus === 'KYC_SUCCESS' ? 'success' : 'error'}>
                      {userDetails.panStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Investment</p>
                    <p className="font-medium">{formatCurrency(userDetails.total_investment)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}