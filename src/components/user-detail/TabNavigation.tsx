"use client";

import React, { useMemo } from "react";
import { getTabDisplayName } from "./utils";
import { UserDetails, MutualFundDetails } from "./types";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userDetails: UserDetails;
  mutualFundDetails?: MutualFundDetails[];
}

export default function TabNavigation({ 
  activeTab, 
  onTabChange, 
  userDetails, 
  mutualFundDetails 
}: TabNavigationProps) {
  const hasExternalHoldings = useMemo(() => {
    if (!mutualFundDetails?.length) return false;
    return mutualFundDetails.some((mf) => 
      mf.mutualFunds?.some((fund) => fund.origin === "manual")
    );
  }, [mutualFundDetails]);

  const allowedTabs = useMemo(() => {
    const tabs = ["Portfolio", "Transaction", "Subscription", "Stock", "Profile", "PlanData"];
    if (userDetails.fromApp?.toLowerCase() === "savestment") {
      tabs.splice(4, 0, "Account Ledger");
    }
    if (hasExternalHoldings) {
      tabs.splice(3, 0, "External Holdings");
    }
    return tabs;
  }, [userDetails.fromApp, hasExternalHoldings]);

  return (
    <div className="flex gap-2 overflow-x-auto">
      {allowedTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab
              ? "bg-primary dark:bg-primary-dark bg-gray-100 text-gray-500"
              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {getTabDisplayName(tab, userDetails.fromApp)}
        </button>
      ))}
    </div>
  );
}

