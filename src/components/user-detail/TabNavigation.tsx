"use client";

import React, { useMemo } from "react";
import { getTabDisplayName } from "./utils";
import { UserDetails } from "./types";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userDetails: UserDetails;
}

export default function TabNavigation({ activeTab, onTabChange, userDetails }: TabNavigationProps) {
  const allowedTabs = useMemo(() => {
    const tabs = ["Portfolio", "Transaction", "Subscription", "Stock", "Profile", "PlanData"];
    if (userDetails.fromApp?.toLowerCase() === "savestment") {
      tabs.splice(4, 0, "Accounts");
    }
    return tabs;
  }, [userDetails.fromApp]);

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

