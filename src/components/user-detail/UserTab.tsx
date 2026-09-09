"use client";

import React, { useState, useEffect } from "react";
import { xirrService, XIRRTableData } from "../../services/xirrService";
import {
  UserTabProps,
  Transaction,
  MutualFundTransaction,
  UserDetails,
  MutualFundDetails,
  FinancialPlan,
} from "./types";
import UserProfileCard from "./UserProfileCard";
import TabNavigation from "./TabNavigation";
import PortfolioTab from "./PortfolioTab";
import TransactionTab from "./TransactionTab";
import SubscriptionTab from "./SubscriptionTab";
import StockTab from "./StockTab";
import ProfileTab from "./ProfileTab";
import PlanDataTab from "./PlanDataTab";
import XIRRTableSection from "./XIRRTableSection";
import AccountsTab from "./AccountsTab";
import { apiClient } from "@/services/api-client";
import { UserEndpoints, StockEndpoints, TransactionEndpoints, FinancialPlanEndpoints } from "@/config/api-endpoints";

interface UserDetailsApiResponse {
  transactionsMF?: MutualFundTransaction[];
  userDetails?: UserDetails;
  mutualFundDetails?: MutualFundDetails[];
  [key: string]: unknown; // Allow other properties
}

export async function fetchUserTabData(userId: number) {
  try {
    const userDetailsRes = await apiClient.get<UserDetailsApiResponse | UserDetails>(
      `${UserEndpoints.USER_DETAILS}/${userId}`,
      { baseUrl: 'crm' }
    );

    if (!userDetailsRes.ok || !userDetailsRes.data) {
      throw new Error(`Failed to fetch user details: ${userDetailsRes.status}`);
    }

    const mainData = userDetailsRes.data;
    
    const transactionsMF: MutualFundTransaction[] = 
      (mainData as UserDetailsApiResponse).transactionsMF || [];
    const userDetails = (mainData as UserDetailsApiResponse).userDetails || (mainData as UserDetails);
    const isFydaa = userDetails.fromApp?.toLowerCase() === "fydaa";

    console.log(`[fetchUserTabData] ✅ Extracted ${transactionsMF.length} MF transactions for user ${userId}`);

    // Fetch financial plan from onboarding service (admin endpoint)
    const [financialPlanRes] = await Promise.all([
      apiClient.get<FinancialPlan>(
        `${FinancialPlanEndpoints.FINANCIAL_PLAN_BY_USER.replace('{userId}', userId.toString())}`,
        { baseUrl: 'onboarding' }
      ),
    ]);

    const financialPlan = financialPlanRes.ok ? financialPlanRes.data : undefined;

    // Now fetch the rest in parallel - if these fail, we still have transactionsMF
    const [portfolioRes, subscriptionsRes, stockOrdersRes, xirrRes] =
      await Promise.all([
        apiClient.get(
          `${StockEndpoints.PORTFOLIO}?userId=${userId}`,
          { baseUrl: 'stock' }
        ),
        apiClient.get(
          `${UserEndpoints.USER_LIST}?userId=${userId}`,
          { baseUrl: 'crm' }
        ),
        apiClient.get(
          `${StockEndpoints.STOCK_LIST}?userId=${userId}`,
          { baseUrl: 'stock' }
        ),
        !isFydaa ? xirrService.getUserXIRR(userId) : Promise.resolve(null),
      ]);

    const portfolioDetails = portfolioRes.ok ? portfolioRes.data : [];
    const subscriptions = subscriptionsRes.ok ? subscriptionsRes.data : [];
    const stockOrders = stockOrdersRes.ok ? stockOrdersRes.data : [];
    const xirrData: XIRRTableData | null = xirrRes;

    let transactions: Transaction[] = [];
    if (!isFydaa) {
      const transactionsRes = await apiClient.get<Transaction[]>(
        `${TransactionEndpoints.TRANSACTIONS_LIST}?userId=${userId}`,
        { baseUrl: 'crm' }
      );
      transactions = transactionsRes.ok && Array.isArray(transactionsRes.data) ? transactionsRes.data : [];
    }

    const mutualFundDetails = (mainData as UserDetailsApiResponse).mutualFundDetails || 
      (subscriptions as { mutualFundDetails?: MutualFundDetails[] }).mutualFundDetails || [];

    return {
      userDetails,
      portfolioDetails,
      transactions,
      subscriptions,
      stockOrders,
      xirrData,
      mutualFundDetails,
      transactionsMF,
      financialPlan,
    };
  } catch (error) {
    console.error("[fetchUserTabData] ❌ Error:", error);
    return {
      userDetails: {},
      portfolioDetails: [],
      transactions: [],
      subscriptions: [],
      stockOrders: [],
      xirrData: null,
      mutualFundDetails: [],
      transactionsMF: [],
      financialPlan: undefined,
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
  transactionsMF = [],
  financialPlan,
  questions,
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

            {activeTab === "Account Ledger" && (
              <AccountsTab userId={userDetails.id} />
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

{activeTab === "PlanData" && (
              <PlanDataTab financialPlan={financialPlan} userId={userDetails?.id?.toString()} questions={questions} fromApp={userDetails.fromApp}/>
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
