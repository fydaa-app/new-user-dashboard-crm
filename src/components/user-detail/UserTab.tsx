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
  console.log("🔵 [UserTab] fetchUserTabData called with userId:", userId);
  console.log("🔵 [UserTab] fetchUserTabData - userId type:", typeof userId);
  
  const authToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME + "="))
    ?.split("=")[1];

  console.log("🔵 [UserTab] fetchUserTabData - Auth cookie name:", process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME);
  console.log("🔵 [UserTab] fetchUserTabData - All cookies:", document.cookie);
  console.log("🔵 [UserTab] fetchUserTabData - Auth token found:", !!authToken);
  console.log("🔵 [UserTab] fetchUserTabData - Auth token length:", authToken?.length || 0);

  if (!authToken) {
    console.error("❌ [UserTab] fetchUserTabData - User auth token not found");
    throw new Error("User auth token not found");
  }

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const stockApiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL || "";

  console.log("🔵 [UserTab] fetchUserTabData - API URLs:");
  console.log("  - apiUrl:", apiUrl);
  console.log("  - stockApiUrl:", stockApiUrl);
  console.log("🔵 [UserTab] fetchUserTabData - Environment variables:");
  console.log("  - NEXT_PUBLIC_USER_DETAILS_ENDPOINT:", process.env.NEXT_PUBLIC_USER_DETAILS_ENDPOINT);
  console.log("  - NEXT_PUBLIC_PORTFOLIO_ENDPOINT:", process.env.NEXT_PUBLIC_PORTFOLIO_ENDPOINT);
  console.log("  - NEXT_PUBLIC_TRANSACTIONS_LIST_ENDPOINT:", process.env.NEXT_PUBLIC_TRANSACTIONS_LIST_ENDPOINT);
  console.log("  - NEXT_PUBLIC_USER_LIST_ENDPOINT:", process.env.NEXT_PUBLIC_USER_LIST_ENDPOINT);
  console.log("  - NEXT_PUBLIC_STOCK_LIST_ENDPOINT:", process.env.NEXT_PUBLIC_STOCK_LIST_ENDPOINT);

  const userDetailsUrl = `${apiUrl}${process.env.NEXT_PUBLIC_USER_DETAILS_ENDPOINT}/${userId}`;
  const portfolioUrl = `${stockApiUrl}${process.env.NEXT_PUBLIC_PORTFOLIO_ENDPOINT}?userId=${userId}`;
  const transactionsUrl = `${apiUrl}${process.env.NEXT_PUBLIC_TRANSACTIONS_LIST_ENDPOINT}?userId=${userId}`;
  const subscriptionsUrl = `${apiUrl}${process.env.NEXT_PUBLIC_USER_LIST_ENDPOINT}?userId=${userId}`;
  const stockOrdersUrl = `${stockApiUrl}${process.env.NEXT_PUBLIC_STOCK_LIST_ENDPOINT}?userId=${userId}`;

  console.log("🔵 [UserTab] fetchUserTabData - Fetch URLs:");
  console.log("  - userDetailsUrl:", userDetailsUrl);
  console.log("  - portfolioUrl:", portfolioUrl);
  console.log("  - transactionsUrl:", transactionsUrl);
  console.log("  - subscriptionsUrl:", subscriptionsUrl);
  console.log("  - stockOrdersUrl:", stockOrdersUrl);

  console.log("🔵 [UserTab] fetchUserTabData - Starting Promise.all fetch...");
  const startTime = Date.now();

  const [
    userDetailsRes,
    portfolioRes,
    transactionsRes,
    subscriptionsRes,
    stockOrdersRes,
    xirrRes,
  ] = await Promise.all([
    fetch(userDetailsUrl, { headers }).then(async (res) => {
      console.log("🔵 [UserTab] fetchUserTabData - userDetailsRes status:", res.status, res.statusText);
      console.log("🔵 [UserTab] fetchUserTabData - userDetailsRes headers:", Object.fromEntries(res.headers.entries()));
      return res;
    }),
    fetch(portfolioUrl, { headers }).then(async (res) => {
      console.log("🔵 [UserTab] fetchUserTabData - portfolioRes status:", res.status, res.statusText);
      console.log("🔵 [UserTab] fetchUserTabData - portfolioRes headers:", Object.fromEntries(res.headers.entries()));
      return res;
    }),
    fetch(transactionsUrl, { headers }).then(async (res) => {
      console.log("🔵 [UserTab] fetchUserTabData - transactionsRes status:", res.status, res.statusText);
      console.log("🔵 [UserTab] fetchUserTabData - transactionsRes headers:", Object.fromEntries(res.headers.entries()));
      return res;
    }),
    fetch(subscriptionsUrl, { headers }).then(async (res) => {
      console.log("🔵 [UserTab] fetchUserTabData - subscriptionsRes status:", res.status, res.statusText);
      console.log("🔵 [UserTab] fetchUserTabData - subscriptionsRes headers:", Object.fromEntries(res.headers.entries()));
      return res;
    }),
    fetch(stockOrdersUrl, { headers }).then(async (res) => {
      console.log("🔵 [UserTab] fetchUserTabData - stockOrdersRes status:", res.status, res.statusText);
      console.log("🔵 [UserTab] fetchUserTabData - stockOrdersRes headers:", Object.fromEntries(res.headers.entries()));
      return res;
    }),
    xirrService.getUserXIRR(userId).then((res) => {
      console.log("🔵 [UserTab] fetchUserTabData - xirrRes:", res);
      return res;
    }).catch((error) => {
      console.error("❌ [UserTab] fetchUserTabData - xirrService error:", error);
      return null;
    }),
  ]);

  const fetchTime = Date.now() - startTime;
  console.log("🔵 [UserTab] fetchUserTabData - All fetches completed in", fetchTime, "ms");

  console.log("🔵 [UserTab] fetchUserTabData - Response statuses:");
  console.log("  - userDetailsRes.ok:", userDetailsRes.ok, "status:", userDetailsRes.status);
  console.log("  - portfolioRes.ok:", portfolioRes.ok, "status:", portfolioRes.status);
  console.log("  - transactionsRes.ok:", transactionsRes.ok, "status:", transactionsRes.status);
  console.log("  - subscriptionsRes.ok:", subscriptionsRes.ok, "status:", subscriptionsRes.status);
  console.log("  - stockOrdersRes.ok:", stockOrdersRes.ok, "status:", stockOrdersRes.status);

  if (!userDetailsRes.ok) {
    const errorText = await userDetailsRes.text();
    console.error("❌ [UserTab] fetchUserTabData - Failed to fetch user details");
    console.error("  - Status:", userDetailsRes.status, userDetailsRes.statusText);
    console.error("  - Response:", errorText);
    throw new Error("Failed to fetch user details");
  }
  if (!portfolioRes.ok) {
    const errorText = await portfolioRes.text();
    console.error("❌ [UserTab] fetchUserTabData - Failed to fetch portfolio details");
    console.error("  - Status:", portfolioRes.status, portfolioRes.statusText);
    console.error("  - Response:", errorText);
    throw new Error("Failed to fetch portfolio details");
  }
  if (!transactionsRes.ok) {
    const errorText = await transactionsRes.text();
    console.error("❌ [UserTab] fetchUserTabData - Failed to fetch transactions");
    console.error("  - Status:", transactionsRes.status, transactionsRes.statusText);
    console.error("  - Response:", errorText);
    throw new Error("Failed to fetch transactions");
  }
  if (!subscriptionsRes.ok) {
    const errorText = await subscriptionsRes.text();
    console.error("❌ [UserTab] fetchUserTabData - Failed to fetch subscriptions");
    console.error("  - Status:", subscriptionsRes.status, subscriptionsRes.statusText);
    console.error("  - Response:", errorText);
    throw new Error("Failed to fetch subscriptions");
  }
  if (!stockOrdersRes.ok) {
    const errorText = await stockOrdersRes.text();
    console.error("❌ [UserTab] fetchUserTabData - Failed to fetch stock orders");
    console.error("  - Status:", stockOrdersRes.status, stockOrdersRes.statusText);
    console.error("  - Response:", errorText);
    throw new Error("Failed to fetch stock orders");
  }

  console.log("🔵 [UserTab] fetchUserTabData - Parsing JSON responses...");
  const userDetails = await userDetailsRes.json();
  const portfolioDetails = await portfolioRes.json();
  const transactions = await transactionsRes.json();
  const subscriptions = await subscriptionsRes.json();
  const stockOrders = await stockOrdersRes.json();

  console.log("🔵 [UserTab] fetchUserTabData - Parsed data:");
  console.log("  - userDetails:", userDetails);
  console.log("  - portfolioDetails:", portfolioDetails);
  console.log("  - portfolioDetails length:", Array.isArray(portfolioDetails) ? portfolioDetails.length : "not an array");
  console.log("  - transactions:", transactions);
  console.log("  - transactions length:", Array.isArray(transactions) ? transactions.length : "not an array");
  console.log("  - subscriptions:", subscriptions);
  console.log("  - subscriptions length:", Array.isArray(subscriptions) ? subscriptions.length : "not an array");
  console.log("  - stockOrders:", stockOrders);
  console.log("  - stockOrders length:", Array.isArray(stockOrders) ? stockOrders.length : "not an array");

  const xirrData: XIRRTableData | null = xirrRes;
  console.log("🔵 [UserTab] fetchUserTabData - xirrData:", xirrData);

  const result = {
    userDetails,
    portfolioDetails,
    transactions,
    subscriptions,
    stockOrders,
    xirrData,
  };

  console.log("🔵 [UserTab] fetchUserTabData - Returning result:", result);
  return result;
}

export default function UserTab({
  userDetails,
  portfolioDetails,
  transactions,
  subscriptions,
  stockOrders,
}: UserTabProps) {
  console.log("🟢 [UserTab] Component rendered/re-rendered");
  console.log("🟢 [UserTab] Props received:");
  console.log("  - userDetails:", userDetails);
  console.log("  - userDetails type:", typeof userDetails);
  console.log("  - userDetails.id:", userDetails?.id);
  console.log("  - userDetails.fromApp:", userDetails?.fromApp);
  console.log("  - portfolioDetails:", portfolioDetails);
  console.log("  - portfolioDetails type:", typeof portfolioDetails);
  console.log("  - portfolioDetails isArray:", Array.isArray(portfolioDetails));
  console.log("  - portfolioDetails length:", Array.isArray(portfolioDetails) ? portfolioDetails.length : "N/A");
  console.log("  - transactions:", transactions);
  console.log("  - transactions type:", typeof transactions);
  console.log("  - transactions isArray:", Array.isArray(transactions));
  console.log("  - transactions length:", Array.isArray(transactions) ? transactions.length : "N/A");
  console.log("  - subscriptions:", subscriptions);
  console.log("  - subscriptions type:", typeof subscriptions);
  console.log("  - subscriptions isArray:", Array.isArray(subscriptions));
  console.log("  - subscriptions length:", Array.isArray(subscriptions) ? subscriptions.length : "N/A");
  console.log("  - stockOrders:", stockOrders);
  console.log("  - stockOrders type:", typeof stockOrders);
  console.log("  - stockOrders isArray:", Array.isArray(stockOrders));
  console.log("  - stockOrders length:", Array.isArray(stockOrders) ? stockOrders.length : "N/A");

  const [activeTab, setActiveTab] = useState<string>("Portfolio");
  const [xirrData, setXirrData] = useState<XIRRTableData | null>(null);
  const [loadingXIRR, setLoadingXIRR] = useState<boolean>(false);
  const [xirrError, setXirrError] = useState<string | null>(null);

  console.log("🟢 [UserTab] State values:");
  console.log("  - activeTab:", activeTab);
  console.log("  - xirrData:", xirrData);
  console.log("  - loadingXIRR:", loadingXIRR);
  console.log("  - xirrError:", xirrError);

  useEffect(() => {
    console.log("🟡 [UserTab] useEffect triggered");
    console.log("🟡 [UserTab] useEffect - activeTab:", activeTab);
    console.log("🟡 [UserTab] useEffect - userDetails:", userDetails);
    console.log("🟡 [UserTab] useEffect - userDetails.id:", userDetails?.id);
    console.log("🟡 [UserTab] useEffect - userDetails.fromApp:", userDetails?.fromApp);

    async function fetchXIRR() {
      console.log("🟡 [UserTab] fetchXIRR function called");
      console.log("🟡 [UserTab] fetchXIRR - userDetails.fromApp:", userDetails?.fromApp);
      console.log("🟡 [UserTab] fetchXIRR - userDetails.fromApp?.toLowerCase():", userDetails?.fromApp?.toLowerCase());
      console.log("🟡 [UserTab] fetchXIRR - Comparison result:", userDetails.fromApp?.toLowerCase() !== "savestment");

      if (userDetails.fromApp?.toLowerCase() !== "savestment") {
        console.log("🟡 [UserTab] fetchXIRR - Not a Savestment user, skipping XIRR fetch");
        setXirrData(null);
        return;
      }
      try {
        console.log("🟡 [UserTab] fetchXIRR - Starting XIRR fetch for user ID:", userDetails.id);
        setLoadingXIRR(true);
        setXirrError(null);
        const data = await xirrService.getUserXIRR(userDetails.id);
        console.log("🟡 [UserTab] fetchXIRR - XIRR data received:", data);
        console.log("🟡 [UserTab] fetchXIRR - XIRR data type:", typeof data);
        console.log("🟡 [UserTab] fetchXIRR - XIRR data truthy:", !!data);
        if (data) {
          console.log("🟡 [UserTab] fetchXIRR - Setting XIRR data");
          setXirrData(data);
        } else {
          console.warn("🟡 [UserTab] fetchXIRR - No XIRR data returned (null/undefined)");
          setXirrData(null);
          setXirrError("Failed to load XIRR data");
        }
      } catch (error) {
        console.error("❌ [UserTab] fetchXIRR - Error occurred:", error);
        console.error("❌ [UserTab] fetchXIRR - Error message:", error instanceof Error ? error.message : String(error));
        console.error("❌ [UserTab] fetchXIRR - Error stack:", error instanceof Error ? error.stack : "N/A");
        setXirrData(null);
        setXirrError("Failed to load XIRR data");
      } finally {
        console.log("🟡 [UserTab] fetchXIRR - Setting loading to false");
        setLoadingXIRR(false);
      }
    }
    if (activeTab === "Portfolio") {
      console.log("🟡 [UserTab] useEffect - Active tab is Portfolio, calling fetchXIRR");
      fetchXIRR();
    } else {
      console.log("🟡 [UserTab] useEffect - Active tab is not Portfolio, resetting XIRR data");
      setXirrData(null); // Reset on tab change
    }
  }, [activeTab, userDetails]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

  // Allowed tabs excluding 'Reports' and 'Payments'
  const allowedTabs = ["Portfolio", "Transaction", "Subscription", "Stock", "Profile"];

  console.log("🟢 [UserTab] Rendering - allowedTabs:", allowedTabs);
  console.log("🟢 [UserTab] Rendering - activeTab:", activeTab);

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
                onClick={() => {
                  console.log("🟠 [UserTab] Tab clicked:", tab);
                  console.log("🟠 [UserTab] Previous activeTab:", activeTab);
                  setActiveTab(tab);
                  console.log("🟠 [UserTab] New activeTab set to:", tab);
                }}
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
            {activeTab === "Portfolio" && (() => {
              console.log("🟣 [UserTab] Rendering Portfolio tab");
              console.log("🟣 [UserTab] Portfolio - portfolioDetails:", portfolioDetails);
              console.log("🟣 [UserTab] Portfolio - portfolioDetails isArray:", Array.isArray(portfolioDetails));
              console.log("🟣 [UserTab] Portfolio - portfolioDetails length:", Array.isArray(portfolioDetails) ? portfolioDetails.length : "N/A");
              console.log("🟣 [UserTab] Portfolio - portfolioDetails truthy:", !!portfolioDetails);
              return portfolioDetails?.map((portfolio, index) => {
                console.log(`🟣 [UserTab] Portfolio - Rendering portfolio ${index}:`, portfolio);
                console.log(`🟣 [UserTab] Portfolio - portfolio ${index} portfolioId:`, portfolio?.portfolioId);
                console.log(`🟣 [UserTab] Portfolio - portfolio ${index} portfolioName:`, portfolio?.portfolioName);
                return (
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
                )
  })
})()} 

            {/* XIRR Table for Savestment Users */}
            {activeTab === "Portfolio" &&
              userDetails.fromApp?.toLowerCase() === "savestment" &&
              (() => {
                console.log("🟣 [UserTab] XIRR Table - Rendering check");
                console.log("🟣 [UserTab] XIRR Table - activeTab === 'Portfolio':", activeTab === "Portfolio");
                console.log("🟣 [UserTab] XIRR Table - userDetails.fromApp:", userDetails.fromApp);
                console.log("🟣 [UserTab] XIRR Table - userDetails.fromApp?.toLowerCase() === 'savestment':", userDetails.fromApp?.toLowerCase() === "savestment");
                console.log("🟣 [UserTab] XIRR Table - loadingXIRR:", loadingXIRR);
                console.log("🟣 [UserTab] XIRR Table - xirrError:", xirrError);
                console.log("🟣 [UserTab] XIRR Table - xirrData:", xirrData);
                console.log("🟣 [UserTab] XIRR Table - xirrData truthy:", !!xirrData);
                
                if (loadingXIRR) {
                  console.log("🟣 [UserTab] XIRR Table - Rendering loading state");
                  return <div className="col-span-12 w-full p-5 dark:text-gray-400">Loading performance metrics...</div>;
                }
                if (xirrError) {
                  console.log("🟣 [UserTab] XIRR Table - Rendering error state");
                  return (
                    <div className="col-span-12 w-full p-5 dark:text-gray-400">
                      <Badge color="warning">No XIRR Data Available</Badge>
                    </div>
                  );
                }
                if (xirrData) {
                  console.log("🟣 [UserTab] XIRR Table - Rendering XIRR data");
                  console.log("🟣 [UserTab] XIRR Table - xirrData.portfolioXIRR:", xirrData.portfolioXIRR);
                  console.log("🟣 [UserTab] XIRR Table - xirrData.benchmarkXIRR:", xirrData.benchmarkXIRR);
                  return (
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
                  );
                }
                console.log("🟣 [UserTab] XIRR Table - No condition met, returning null");
                return null;
              })()}

            {/* Transaction Tab */}
            {activeTab === "Transaction" && (() => {
              console.log("🟣 [UserTab] Rendering Transaction tab");
              console.log("🟣 [UserTab] Transaction - transactions:", transactions);
              console.log("🟣 [UserTab] Transaction - transactions isArray:", Array.isArray(transactions));
              console.log("🟣 [UserTab] Transaction - transactions length:", Array.isArray(transactions) ? transactions.length : "N/A");
              console.log("🟣 [UserTab] Transaction - transactions truthy:", !!transactions);
              return (
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
              );
            })()}

            {/* Subscription Tab */}
            {activeTab === "Subscription" && (() => {
              console.log("🟣 [UserTab] Rendering Subscription tab");
              console.log("🟣 [UserTab] Subscription - subscriptions:", subscriptions);
              console.log("🟣 [UserTab] Subscription - subscriptions isArray:", Array.isArray(subscriptions));
              console.log("🟣 [UserTab] Subscription - subscriptions length:", Array.isArray(subscriptions) ? subscriptions.length : "N/A");
              console.log("🟣 [UserTab] Subscription - subscriptions truthy:", !!subscriptions);
              console.log("🟣 [UserTab] Subscription - userDetails.subscription_date:", userDetails?.subscription_date);
              console.log("🟣 [UserTab] Subscription - userDetails.main_subscription_status:", userDetails?.main_subscription_status);
              return (
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
              );
            })()}

            {/* Stock Orders Tab */}
            {activeTab === "Stock" && (() => {
              console.log("🟣 [UserTab] Rendering Stock tab");
              console.log("🟣 [UserTab] Stock - stockOrders:", stockOrders);
              console.log("🟣 [UserTab] Stock - stockOrders isArray:", Array.isArray(stockOrders));
              console.log("🟣 [UserTab] Stock - stockOrders length:", Array.isArray(stockOrders) ? stockOrders.length : "N/A");
              console.log("🟣 [UserTab] Stock - stockOrders truthy:", !!stockOrders);
              return (
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
              );
            })()}

            {/* Profile Tab */}
            {activeTab === "Profile" && (() => {
              console.log("🟣 [UserTab] Rendering Profile tab");
              console.log("🟣 [UserTab] Profile - userDetails:", userDetails);
              console.log("🟣 [UserTab] Profile - userDetails.dob:", userDetails?.dob);
              console.log("🟣 [UserTab] Profile - userDetails.address:", userDetails?.address);
              console.log("🟣 [UserTab] Profile - userDetails.pincode:", userDetails?.pincode);
              console.log("🟣 [UserTab] Profile - userDetails.panStatus:", userDetails?.panStatus);
              console.log("🟣 [UserTab] Profile - userDetails.total_investment:", userDetails?.total_investment);
              return (
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
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
