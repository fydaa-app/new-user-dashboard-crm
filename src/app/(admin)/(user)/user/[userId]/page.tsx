"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTab from "@/components/user-detail/UserTab";
import Cookies from "js-cookie";
import { MutualFundTransaction } from "@/components/user-detail/types";

// Interfaces for nested mutual fund data per API response

interface MutualFund {
  portfolioName: string;
  portfolioId: number | null;
  sipId: number;
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

interface GoalItem {
  image: string;
  title: string;
  description: string;
}

interface Goal {
  id: number;
  name: string;
  termId: number;
  feePricing: string;
  tenureMin: number;
  tenureMax: number;
  goalAmountMin: string;
  goalAmountMax: string;
  brandName: string | null;
  discount: string;
  imageUrl: string;
  recommendationUrl: string;
  iconUrl: string | null;
  pendingUrl: string;
  description: string;
  items: GoalItem[];
  suggestion: string;
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface SIP {
  id: number;
  userId: number;
  portfolioId: number;
  goalId: number;
  feePricing: number;
  planId: number | null;
  sipTenure: number;
  sipName: string;
  userSipName: string | null;
  sipAmount: number;
  goalAmount: number;
  autoRenewDate: string;
  startDate: string;
  sipDate: string;
  endDate: string;
  status: string;
  paymentStatus: number;
  isRegister: boolean;
  isProgress: boolean;
  isAllocation: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Update your existing MutualFundDetail interface to reflect API data shape fully
interface MutualFundDetail {
  portfolioId: number | null;
  portfolioName: string;
  sipId: number;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  mutualFunds: MutualFund[];
  goal: Goal[];
  sip: SIP[];
}

// Other interfaces omitted for brevity, keep your existing ones unchanged.

interface Address {
  addressLine1: string;
  addressLine2: string;
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
}

interface UserSubscription {
  plan_id: number;
  plan_name: string;
}

interface UserTransaction {
  transactionId: string;
  orderType: string;
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: string;
  createdAt: string;
}

interface Transaction {
  transactionId: string;
  orderType: "BUY" | "SELL";
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: string;
  createdAt: string;
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

interface PortfolioDetail {
  portfolioId: number;
  portfolioName: string;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  stocks: StockDetails[];
  totalInvestedValue: number;
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

interface UserData {
  userDetails: UserDetails;
  userSubscriptionDetails: UserSubscription[];
  userTransactionDetails: UserTransaction[];
  portfolioDetails: PortfolioDetail[];
  stockOrders: StockOrder[];
  xirr: Record<string, unknown>;
  mutualFundDetails: MutualFundDetail[];
  // Mutual fund SIP transaction groups for Fydaa users
  transactionsMF?: MutualFundTransaction[];
}

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function UserDetails({ params }: PageProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const resolvedParams = await params;
        const { userId } = resolvedParams;

        const authToken =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("authToken="))
            ?.split("=")[1] || "";

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_USER_DETAILS_ENDPOINT}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.status === 401) {
          Cookies.remove("authToken");
          window.location.href = "/signin";
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UserData = await response.json();

        // Transform only transactions, keep mutualFundDetails and transactionsMF as-is
        const transformedData = {
          ...data,
          userTransactionDetails: data.userTransactionDetails.map((transaction) => ({
            ...transaction,
            orderType:
              transaction.orderType === "BUY" || transaction.orderType === "SELL"
                ? transaction.orderType
                : ("BUY" as "BUY" | "SELL"),
          })),
        };

        setUserData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params]);

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>No user data found</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="User" />
      <div className="space-y-6">
        <ComponentCard title="User Details">
          <UserTab
            userDetails={userData.userDetails}
            portfolioDetails={userData.portfolioDetails}
            transactions={userData.userTransactionDetails as Transaction[]}
            subscriptions={userData.userSubscriptionDetails}
            stockOrders={userData.stockOrders}
            mutualFundDetails={userData.mutualFundDetails}
            // Pass through mutual fund transactions for Fydaa users
            transactionsMF={userData.transactionsMF || []}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
