"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import TransactionSummary from "@/components/ecommerce/TransactionSummary";
import { useGlobalContext } from "@/context/GlobalState";

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

const TransactionSummaryWrapper = () => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode } = useGlobalContext();

  useEffect(() => {
    const fetchSummaryData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        console.error("Auth token not found in cookies");
        setLoading(false);
        return;
      }

      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/transactions-summary-mf?`;

        if (selectedOption === 'custom') {
          url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `timeframe=${selectedOption || "yearly"}`;
        }
        // Use selectedTeamMember if available (team mode), otherwise use selectedEmployee
        const employeeId = selectedTeamMember || selectedEmployee;
        if (employeeId) {
          url += `&employeeId=${employeeId}`;
        }
        if (selectedType && selectedType.length > 0) {
          const typeValue = Array.isArray(selectedType) ? selectedType[0] : selectedType;
          url += `&type=${selectedTeamMember ? hierarchyViewMode : typeValue}`;
        }
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });

        if (response.status === 401) {
          Cookies.remove('authToken');
          window.location.href = "/signin";
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data?.summary) {
          setSummaryData(result.data.summary);
        }
      } catch (error) {
        console.error("Error fetching transaction summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode]);

  return <TransactionSummary data={summaryData} loading={loading} />;
};

export default TransactionSummaryWrapper;