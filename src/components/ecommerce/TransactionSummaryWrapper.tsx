"use client";
import React from "react";
import Cookies from "js-cookie";
import TransactionSummary from "@/components/ecommerce/TransactionSummary";
import { useGlobalContext } from "@/context/GlobalState";
import { investmentModelQuery } from "@/context/investmentModel";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

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
    buy: { count: number; amount: number; processedAmount: number; };
    lumpsum: { count: number; amount: number; processedAmount: number; };
    sell: { count: number; amount: number; processedAmount: number; };
  };
  failed: {
    count: number;
    amount: number;
    processedAmount: number;
    buy: { count: number; amount: number; processedAmount: number; };
    lumpsum: { count: number; amount: number; processedAmount: number; };
    sell: { count: number; amount: number; processedAmount: number; };
  };
  partiallySuccessful: {
    count: number;
    amount: number;
    processedAmount: number;
    buy: { count: number; amount: number; processedAmount: number; };
    lumpsum: { count: number; amount: number; processedAmount: number; };
    sell: { count: number; amount: number; processedAmount: number; };
  };
  inProcess: {
    count: number;
    amount: number;
    processedAmount: number;
    buy: { count: number; amount: number; processedAmount: number; };
    lumpsum: { count: number; amount: number; processedAmount: number; };
    sell: { count: number; amount: number; processedAmount: number; };
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
  dailyBreakdown: Array<{
    date: string;
    transactionCount: number;
    totalAmount: number;
    processedAmount: number;
  }>;
  schemeBreakdown: Array<{
    scheme: string;
    transactionCount: number;
    totalAmount: number;
    processedAmount: number;
  }>;
  stateBreakdown: {
    successful: number;
    failed: number;
    submitted: number;
  };
  gatewayBreakdown: Record<string, number>;
  typeBreakdown: {
    purchase: number;
    redemption: number;
    additional_purchase: number;
  };
}

interface ApiResponse {
  success: boolean;
  data?: {
    summary: SummaryData;
  };
}

const TransactionSummaryWrapper = () => {
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, investmentModelFilter } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const { data: summaryData, loading } = useFilteredFetch<SummaryData>(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/transactions-summary-mf?`;

      if (selectedOption === 'custom') {
        url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
      } else {
        url += `timeframe=${selectedOption || "yearly"}`;
      }

      const employeeId = selectedTeamMember || selectedEmployee;
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      if (selectedType && selectedType.length > 0) {
        url += `&type=${selectedTeamMember ? hierarchyViewMode : effectiveType}`;
      }

      url += investmentModelQuery(investmentModelFilter);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        signal,
      });

      if (response.status === 401) {
        Cookies.remove('authToken');
        window.location.href = "/signin";
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data?.summary) {
        throw new Error("Invalid response format");
      }

      return result.data.summary;
    },
    [
      selectedOption,
      customDates,
      selectedEmployee,
      selectedTeamMember,
      selectedType,
      hierarchyViewMode,
      userAppTypeLock,
      investmentModelFilter,
    ]
  );

  return <TransactionSummary data={summaryData} loading={loading} />;
};

export default TransactionSummaryWrapper;