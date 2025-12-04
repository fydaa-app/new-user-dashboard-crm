"use client";

import React, { useState, useEffect } from "react";
import { xirrService, XIRRTableData } from "../../services/xirrService";
import { UserTabProps, Transaction, MutualFundTransaction } from "./types";
import UserProfileCard from "./UserProfileCard";
import TabNavigation from "./TabNavigation";
import PortfolioTab from "./PortfolioTab";
import TransactionTab from "./TransactionTab";
import SubscriptionTab from "./SubscriptionTab";
import StockTab from "./StockTab";
import ProfileTab from "./ProfileTab";
import XIRRTableSection from "./XIRRTableSection";

export async function fetchUserTabData(userId: number) {
  const authToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME + "="))
    ?.split("=")[1];

  if (!authToken) {
    console.error("[fetchUserTabData] No auth token found");
    return {
      userDetails: {},
      portfolioDetails: [],
      transactions: [],
      subscriptions: [],
      stockOrders: [],
      xirrData: null,
      mutualFundDetails: [],
      transactionsMF: [],
    };
  }

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const stockApiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL || "";

  try {
    // --- CRITICAL FIX: Fetch and extract transactionsMF FIRST ---
    const userDetailsRes = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_USER_DETAILS_ENDPOINT}/${userId}`,
      { headers, cache: "no-store" }
    );

    if (!userDetailsRes.ok) {
      throw new Error(`Failed to fetch user details: ${userDetailsRes.status}`);
    }

    const mainData = await userDetailsRes.json();
    
    // Extract IMMEDIATELY - this is the data we need
    const transactionsMF: MutualFundTransaction[] = mainData.transactionsMF || [];
    const userDetails = mainData.userDetails || mainData;
    const isFydaa = userDetails.fromApp?.toLowerCase() === "fydaa";

    console.log(`[fetchUserTabData] ✅ Extracted ${transactionsMF.length} MF transactions for user ${userId}`);

    // Now fetch the rest in parallel - if these fail, we still have transactionsMF
    const [portfolioRes, subscriptionsRes, stockOrdersRes, xirrRes] =
      await Promise.all([
        fetch(
          `${stockApiUrl}${process.env.NEXT_PUBLIC_PORTFOLIO_ENDPOINT}?userId=${userId}`,
          { headers, cache: "no-store" }
        ),
        fetch(
          `${apiUrl}${process.env.NEXT_PUBLIC_USER_LIST_ENDPOINT}?userId=${userId}`,
          { headers, cache: "no-store" }
        ),
        fetch(
          `${stockApiUrl}${process.env.NEXT_PUBLIC_STOCK_LIST_ENDPOINT}?userId=${userId}`,
          { headers, cache: "no-store" }
        ),
        !isFydaa ? xirrService.getUserXIRR(userId) : Promise.resolve(null),
      ]);

    // Parse responses
    const portfolioDetails = await portfolioRes.json();
    const subscriptions = await subscriptionsRes.json();
    const stockOrders = await stockOrdersRes.json();
    const xirrData: XIRRTableData | null = xirrRes;

    // Standard transactions for Savestment (only fetch if needed)
    let transactions: Transaction[] = [];
    if (!isFydaa) {
      const transactionsRes = await fetch(
        `${apiUrl}${process.env.NEXT_PUBLIC_TRANSACTIONS_LIST_ENDPOINT}?userId=${userId}`,
        { headers, cache: "no-store" }
      );
      const tData = await transactionsRes.json();
      transactions = tData || [];
    }

    // Mutual Fund Details
    const mutualFundDetails = mainData.mutualFundDetails || subscriptions.mutualFundDetails || [];

    return {
      userDetails,
      portfolioDetails,
      transactions,
      subscriptions,
      stockOrders,
      xirrData,
      mutualFundDetails,
      transactionsMF, // This now has data even if other fetches fail
    };
  } catch (error) {
    console.error("[fetchUserTabData] ❌ Error:", error);
    // Return empty data on error
    return {
      userDetails: {},
      portfolioDetails: [],
      transactions: [],
      subscriptions: [],
      stockOrders: [],
      xirrData: null,
      mutualFundDetails: [],
      transactionsMF: [],
    };
  }
}

export default function UserTab({
  userDetails,
  portfolioDetails,
  transactions,
  subscriptions,
  stockOrders,
  mutualFundDetails,
  transactionsMF = [], // This will now receive the correct data
}: UserTabProps) {
  const [activeTab, setActiveTab] = useState<string>("Portfolio");
  const [xirrData, setXirrData] = useState<XIRRTableData | null>(null);
  const [loadingXIRR, setLoadingXIRR] = useState<boolean>(false);
  const [xirrError, setXirrError] = useState<string | null>(null);

  // Verify data received
  useEffect(() => {
    console.log("=== UserTab Mounted ===");
    console.log("transactionsMF:", transactionsMF);
    console.log("Length:", transactionsMF.length);
  }, [transactionsMF]);

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
      setXirrData(null);
    }
  }, [activeTab, userDetails]);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <UserProfileCard userDetails={userDetails} />

      <div className="col-span-12 xl:col-span-8 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userDetails={userDetails}
          />

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {activeTab === "Portfolio" && (
              <PortfolioTab
                userDetails={userDetails}
                portfolioDetails={portfolioDetails}
                mutualFundDetails={mutualFundDetails}
              />
            )}

            {activeTab === "Transaction" && (
              <TransactionTab 
                transactions={transactions} 
                transactionsMF={transactionsMF}
                userDetails={userDetails}
              />
            )}

            {activeTab === "Subscription" && (
              <SubscriptionTab
                subscriptions={subscriptions}
                userDetails={userDetails}
              />
            )}

            {activeTab === "Stock" && (
              <StockTab
                userDetails={userDetails}
                stockOrders={stockOrders}
                portfolioDetails={portfolioDetails}
                mutualFundDetails={mutualFundDetails}
              />
            )}

            {activeTab === "Profile" && (
              <ProfileTab userDetails={userDetails} />
            )}
          </div>
        </div>
      </div>

      <XIRRTableSection
        activeTab={activeTab}
        fromApp={userDetails.fromApp}
        loadingXIRR={loadingXIRR}
        xirrError={xirrError}
        xirrData={xirrData}
      />
    </div>
  );
}
