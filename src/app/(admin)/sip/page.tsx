"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import {
  OrderIconBlue,
  OrderIconGray,
  OrderIconGreen,
  OrderIconOrange,
  OrderIconPurple,
  OrderIconRed,
  OrderIconYellow,
} from "@/icons";

interface CardData {
  type: string;
  totalactivesip?: number;
  totalinactivesip?: number;
  totalcompletedsip?: number;
  totalinprogresssip?: number;
  totalpartiallyexitsip?: number;
  totalinvestedsip?: number;
  totalcancelledsip?: number;
}

interface SipCounts {
  activeSips: number;
  inactiveSips: number;
  investedSips: number;
  cancelledSips: number;
  inProgressSips: number;
  completedSips: number;
  partiallyExitSips: number;
}

const SipIndexPage = () => {
  const router = useRouter();

  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode } =
    useGlobalContext();

  const [sipCounts, setSipCounts] = useState<SipCounts>({
    activeSips: 0,
    inactiveSips: 0,
    investedSips: 0,
    cancelledSips: 0,
    inProgressSips: 0,
    completedSips: 0,
    partiallyExitSips: 0,
  });

  useEffect(() => {
    const fetchSipCounts = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");
      if (!AUTH_TOKEN) return;

      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/sip-cards-data-mf?`;

        if (selectedOption === "custom") {
          url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `timeframe=${selectedOption || "monthly"}`;
        }

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
          Cookies.remove("authToken");
          window.location.href = "/signin";
        }

        const data: CardData[] = await response.json();

        const counts: SipCounts = {
          activeSips: data.find((item) => item.type === "Total Active Sips")?.totalactivesip || 0,
          inactiveSips: data.find((item) => item.type === "Total In Active Sips")?.totalinactivesip || 0,
          investedSips: data.find((item) => item.type === "Total Invested Sips")?.totalinvestedsip || 0,
          cancelledSips: data.find((item) => item.type === "Cancelled Sips")?.totalcancelledsip || 0,
          inProgressSips: data.find((item) => item.type === "Total In Progress Sips")?.totalinprogresssip || 0,
          completedSips: data.find((item) => item.type === "Total Completed Sips")?.totalcompletedsip || 0,
          partiallyExitSips: data.find((item) => item.type === "Total Partially Exit Sips")?.totalpartiallyexitsip || 0,
        };

        setSipCounts(counts);
      } catch (error) {
        console.error("Error fetching SIP counts:", error);
      }
    };

    fetchSipCounts();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode]);

  const sipCategories = [
    {
      title: "Active SIPs",
      description: "View all active and running SIPs",
      route: "/sip/activesip",
      icon: OrderIconGreen,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: sipCounts.activeSips,
    },
    {
      title: "Invested SIPs",
      description: "SIPs with completed investments",
      route: "/sip/investedsip",
      icon: OrderIconBlue,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: sipCounts.investedSips,
    },
    {
      title: "In Progress SIPs",
      description: "SIPs currently being processed",
      route: "/sip/inprogresssip",
      icon: OrderIconYellow,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: sipCounts.inProgressSips,
    },
    {
      title: "Completed SIPs",
      description: "Fully completed SIP investments",
      route: "/sip/completedsip",
      icon: OrderIconPurple,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: sipCounts.completedSips,
    },
    {
      title: "Cancelled SIPs",
      description: "Cancelled or terminated SIPs",
      route: "/sip/cancelledsip",
      icon: OrderIconRed,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: sipCounts.cancelledSips,
    },
    {
      title: "Partially Exit SIPs",
      description: "SIPs with partial redemptions",
      route: "/sip/partiallyexitsip",
      icon: OrderIconOrange,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: sipCounts.partiallyExitSips,
    },
    {
      title: "Inactive SIPs",
      description: "Inactive or paused SIPs",
      route: "/sip/inactivesip",
      icon: OrderIconGray,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: sipCounts.inactiveSips,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          SIP Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Browse and manage all types of Systematic Investment Plans
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sipCategories.map((category, index) => (
          <div
            key={index}
            onClick={() => router.push(category.route)}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all 
hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${category.color}`}
                >
                  <category.icon />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {category.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Count */}
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {category.count.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
              View Details
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SipIndexPage;
