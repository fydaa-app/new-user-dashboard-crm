"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import PerformanceXIRRTable from "../tables/PerformanceXIRRTable";
import { xirrService, XIRRTableData } from "../../services/xirrService";

// Interfaces for API response data (trimmed for clarity)
interface Address {
  addressLine1: string;
  addressLine2?: string;
}
interface UserGoal {
  sipAmount: number;
  goalAmount: number;
  timePeriod: number;
  interestRate: number;
}
interface UserDetails {
  id: number;
  firstName: string;
  lastName: string;
  referredBy: string | null;
  referralCode: string;
  deeplink: string | null;
  callingCode: string;
  mobileNumber: string;
  email: string;
  panStatus: string;
  total_investment: number;
  current_balance: number;
  userRole: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  gender: string;
  dob: string;
  address: Address;
  userGoal: UserGoal;
  subscription_date: string;
  main_subscription_status: number;
  fromApp?: string;
}
interface Subscription {
  plan_id: number;
  plan_name: string;
}
interface Transaction {
  transactionId: string;
  orderType: "BUY" | "SELL";
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: string;
  createdAt: string;
}
interface StockOrder {
  stockId: number;
  buyQuantity: string;
  sellQuantity: string;
  quantityDifference: string;
  totalValue: number;
  avgValue: number;
  netValue: number;
  "stock.stockName": string;
  "stock.ticker": string;
}
interface StockDetails {
  portfolioName: string;
  portfolioId: number;
  stockName: string;
  capType: string;
  stockType: string;
  sector: number;
  ticker: string;
  ltp: string;
  balanceQty: number;
  totalQty: number;
  averagePrice: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  investedValue: number;
  currentValue: number;
  stockId: number;
}
interface PortfolioDetails {
  portfolioId: number;
  portfolioName: string;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  stocks: StockDetails[];
  totalInvestedValue: number;
}

interface UserTabProps {
  userDetails: UserDetails;
  portfolioDetails: PortfolioDetails[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  stockOrders: StockOrder[];
}

export async function fetchUserTabData(userId: number) {
  const authToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME + "="))
    ?.split("=")[1];

  if (!authToken) throw new Error("User auth token not found");

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const stockApiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL || "";

  const [
    userDetailsRes,
    portfolioRes,
    transactionsRes,
    subscriptionsRes,
    stockOrdersRes,
    xirrRes,
  ] = await Promise.all([
    fetch(`${apiUrl}${process.env.NEXT_PUBLIC_USER_DETAILS_ENDPOINT}/${userId}`, { headers }),
    fetch(`${stockApiUrl}${process.env.NEXT_PUBLIC_PORTFOLIO_ENDPOINT}?userId=${userId}`, { headers }),
    fetch(`${apiUrl}${process.env.NEXT_PUBLIC_TRANSACTIONS_LIST_ENDPOINT}?userId=${userId}`, { headers }),
    fetch(`${apiUrl}${process.env.NEXT_PUBLIC_USER_LIST_ENDPOINT}?userId=${userId}`, { headers }), // Replace with real subs endpoint if exists
    fetch(`${stockApiUrl}${process.env.NEXT_PUBLIC_STOCK_LIST_ENDPOINT}?userId=${userId}`, { headers }),
    xirrService.getUserXIRR(userId),
  ]);

  if (!userDetailsRes.ok) throw new Error("Failed to fetch user details");
  if (!portfolioRes.ok) throw new Error("Failed to fetch portfolio details");
  if (!transactionsRes.ok) throw new Error("Failed to fetch transactions");
  if (!subscriptionsRes.ok) throw new Error("Failed to fetch subscriptions");
  if (!stockOrdersRes.ok) throw new Error("Failed to fetch stock orders");

  const userDetails = await userDetailsRes.json();
  const portfolioDetails = await portfolioRes.json();
  const transactions = await transactionsRes.json();
  const subscriptions = await subscriptionsRes.json();
  const stockOrders = await stockOrdersRes.json();

  const xirrData: XIRRTableData | null = xirrRes;

  return {
    userDetails,
    portfolioDetails,
    transactions,
    subscriptions,
    stockOrders,
    xirrData,
  };
}

export default function UserTab({
  userDetails,
  portfolioDetails,
  transactions,
  subscriptions,
  stockOrders,
}: UserTabProps) {
  const [activeTab, setActiveTab] = useState<string>("Portfolio");
  const [xirrData, setXirrData] = useState<XIRRTableData | null>(null);
  const [loadingXIRR, setLoadingXIRR] = useState<boolean>(false);
  const [xirrError, setXirrError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchXIRR() {
      if (userDetails.fromApp?.toLowerCase() !== "savestment") {
        setXirrData(null);
        return;
      }
      try {
        setLoadingXIRR(true);
        setXirrError(null);
        const data = await xirrService.getUserXIRR(userDetails.id);
        if (data) {
          setXirrData(data);
        } else {
          setXirrData(null);
          setXirrError("Failed to load XIRR data");
        }
      } catch (error) {
  console.error("XIRR fetch error:", error);
  setXirrData(null);
  setXirrError("Failed to load XIRR data");
} finally {
  setLoadingXIRR(false);
}

    }
    if (activeTab === "Portfolio") {
      fetchXIRR();
    } else {
      setXirrData(null); // Reset on tab change
    }
  }, [activeTab, userDetails]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

  // Allowed tabs excluding 'Reports' and 'Payments'
  const allowedTabs = ["Portfolio", "Transaction", "Subscription", "Stock", "Profile"];

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Left Column - User Profile */}
      <div className="col-span-12 xl:col-span-4 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="items-center w-full">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 mb-4">
              <Image width={80} height={80} src="/images/user/user-image.png" alt="user" />
            </div>
            <div className="order-3 xl:order-2 mb-4">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userDetails.firstName} {userDetails.lastName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{userDetails.userRole}</p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userDetails.city}, {userDetails.country}
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Email : {userDetails.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Phone : {userDetails.callingCode} {userDetails.mobileNumber}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">PAN Status : {userDetails.panStatus}</p>
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
            {allowedTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary dark:bg-primary-dark bg-gray-100 text-gray-500"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

            {/* Portfolio Tab */}
            {activeTab === "Portfolio" &&
              portfolioDetails?.map((portfolio) => (
                <div key={portfolio.portfolioId} className="p-4">
                  <div className="border-b border-gray-100 dark:border-white/[0.05]">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-400">{portfolio.portfolioName}</h3>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Invested Amount</p>
                      <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.totalInvestedValue)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                      <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.currentValue)}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Realised Profit</p>
                      <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.realizedReturn)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Unrealised Profit</p>
                      <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.unrealizedReturn)}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Absolute Return </p>
                      <p className="font-medium dark:text-gray-400">
                        {portfolio.totalInvestedValue > 0
                          ? (((portfolio.currentValue - portfolio.totalInvestedValue) / portfolio.totalInvestedValue) * 100).toFixed(2)
                          : "0.00"}
                        %
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit </p>
                      <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.totalProfit)}</p>
                    </div>
                  </div>
                </div>
              ))}

           

            {/* Transaction Tab */}
            {activeTab === "Transaction" && (
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
                  {transactions?.map((transaction) => (
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
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Subscription Tab */}
            {activeTab === "Subscription" && (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
                      Plan Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
                      Subscription Date
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
                      Status
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {subscriptions?.map((subscription, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {subscription.plan_name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {new Date(userDetails.subscription_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge color={userDetails.main_subscription_status === 1 ? "success" : "error"}>
                          {userDetails.main_subscription_status === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Stock Orders Tab */}
            {activeTab === "Stock" && (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
                      Stock
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
                      Ticker
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
                      Quantity
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
                      Avg. Price
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
                      Total Value
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {stockOrders?.map((order) => (
                    <TableRow key={order.stockId}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order["stock.stockName"]}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order["stock.ticker"]}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order.quantityDifference}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(order.avgValue)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(order.netValue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Profile Tab */}
            {activeTab === "Profile" && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-400">Date of Birth</p>
                    <p className="text-theme-sm text-gray-500">{new Date(userDetails.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-400">Address</p>
                    <p className="text-theme-sm text-gray-500">{userDetails.address?.addressLine1}</p>
                    <p className="text-theme-sm text-gray-500">{userDetails.pincode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-400">KYC Status</p>
                    <Badge
                      color={
                        userDetails.panStatus === "KYC_SUCCESS" || userDetails.panStatus === "KYCSUCCESS"
                          ? "success"
                          : "error"
                      }
                    >
                      {userDetails.panStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-400">Total Investment</p>
                    <p className="text-theme-sm text-gray-500">{formatCurrency(userDetails.total_investment)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
       {/* XIRR Table for Savestment Users */}
            {activeTab === "Portfolio" &&
              userDetails.fromApp?.toLowerCase() === "savestment" &&
              (loadingXIRR ? (
                <div className="col-span-12 w-full p-5 dark:text-gray-400">Loading performance metrics...</div>
              ) : xirrError ? (
                <div className="col-span-12 w-full p-5 dark:text-gray-400">
                  <Badge color="warning">No XIRR Data Available</Badge>
                </div>
              ) : xirrData && (
                <div className="col-span-12 w-full p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
                  <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6 ">
                    <h3 className="text-lg font-semibold dark:text-gray-400">Performance Metrics (XIRR)</h3>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                      <div className="min-w-[1200px]">
                        <PerformanceXIRRTable
                          portfolioXIRR={xirrData.portfolioXIRR}
                          benchmarkXIRR={xirrData.benchmarkXIRR}
                          loading={loadingXIRR}
                          error={xirrError}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
    </div>
  );
}
