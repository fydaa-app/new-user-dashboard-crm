"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import { pickModelMetric } from "@/context/investmentModel";
import { useFydaaOnlyPage } from "@/hooks/useFydaaOnlyPage";
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
  totalactivesipRia?: number;
  totalactivesipArn?: number;
  totalinactivesip?: number;
  totalinactivesipRia?: number;
  totalinactivesipArn?: number;
  totalcompletedsip?: number;
  totalcompletedsipRia?: number;
  totalcompletedsipArn?: number;
  totalinprogresssip?: number;
  totalinprogresssipRia?: number;
  totalinprogresssipArn?: number;
  totalpartiallyexitsip?: number;
  totalpartiallyexitsipRia?: number;
  totalpartiallyexitsipArn?: number;
  totalinvestedsip?: number;
  totalinvestedsipRia?: number;
  totalinvestedsipArn?: number;
  totalcancelledsip?: number;
  totalcancelledsipRia?: number;
  totalcancelledsipArn?: number;
  behindgoalscount?: number;
  behindgoalscountRia?: number;
  behindgoalscountArn?: number;
}

interface SipCounts {
  activeSips: number;
  inactiveSips: number;
  investedSips: number;
  cancelledSips: number;
  inProgressSips: number;
  completedSips: number;
  partiallyExitSips: number;
  behindGoalsSips: number;
}

const SipIndexPage = () => {
  useFydaaOnlyPage();
  const router = useRouter();

  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, investmentModelFilter } =
    useGlobalContext();

  const [sipCards, setSipCards] = useState<CardData[]>([]);

  const sipRequestIdRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const currentRequestId = ++sipRequestIdRef.current;

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
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          Cookies.remove("authToken");
          window.location.href = "/signin";
        }

        const data: CardData[] = await response.json();

        if (currentRequestId === sipRequestIdRef.current && !controller.signal.aborted) {
          setSipCards(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (currentRequestId === sipRequestIdRef.current && !controller.signal.aborted) {
          console.error("Error fetching SIP counts:", error);
        }
      }
    };

    fetchSipCounts();

    return () => controller.abort();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode]);

  const sipCount = (
    type: string,
    combined: keyof CardData,
    ria: keyof CardData,
    arn: keyof CardData,
  ) => {
    const item = sipCards.find((row) => row.type === type);
    return pickModelMetric(investmentModelFilter, Number(item?.[combined] || 0), Number(item?.[ria] || 0), Number(item?.[arn] || 0));
  };

  const filteredCounts: SipCounts = {
    activeSips: sipCount("Total Active Sips", "totalactivesip", "totalactivesipRia", "totalactivesipArn"),
    inactiveSips: sipCount("Total In Active Sips", "totalinactivesip", "totalinactivesipRia", "totalinactivesipArn"),
    investedSips: sipCount("Total Invested Sips", "totalinvestedsip", "totalinvestedsipRia", "totalinvestedsipArn"),
    cancelledSips: sipCount("Cancelled Sips", "totalcancelledsip", "totalcancelledsipRia", "totalcancelledsipArn"),
    inProgressSips: sipCount("Total In Progress Sips", "totalinprogresssip", "totalinprogresssipRia", "totalinprogresssipArn"),
    completedSips: sipCount("Total Completed SIPs", "totalcompletedsip", "totalcompletedsipRia", "totalcompletedsipArn"),
    partiallyExitSips: sipCount("Partially Exited SIPs", "totalpartiallyexitsip", "totalpartiallyexitsipRia", "totalpartiallyexitsipArn"),
    behindGoalsSips: sipCount("Behind Goals", "behindgoalscount", "behindgoalscountRia", "behindgoalscountArn"),
  };

  const sipCategories = [
    {
      title: "Active SIPs",
      description: "View all active and running SIPs",
      route: "/sip/activesip",
      icon: OrderIconGreen,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: filteredCounts.activeSips,
    },
    {
      title: "Invested SIPs",
      description: "SIPs with completed investments",
      route: "/sip/investedsip",
      icon: OrderIconBlue,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: filteredCounts.investedSips,
    },
    {
      title: "In Progress SIPs",
      description: "SIPs currently being processed",
      route: "/sip/inprogresssip",
      icon: OrderIconYellow,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: filteredCounts.inProgressSips,
    },
    {
      title: "Completed SIPs",
      description: "Fully completed SIP investments",
      route: "/sip/completedsip",
      icon: OrderIconPurple,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: filteredCounts.completedSips,
    },
    {
      title: "Cancelled SIPs",
      description: "Cancelled or terminated SIPs",
      route: "/sip/cancelledsip",
      icon: OrderIconRed,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: filteredCounts.cancelledSips,
    },
    {
      title: "Failed SIPs",
      description: "SIPs falling behind their goal targets",
      route: "/sip/behindgoalssip",
      icon: OrderIconRed,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: filteredCounts.behindGoalsSips,
    },
    {
      title: "Partially Exit SIPs",
      description: "SIPs with partial redemptions",
      route: "/sip/partiallyexitsip",
      icon: OrderIconOrange,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: filteredCounts.partiallyExitSips,
    },
    {
      title: "Inactive SIPs",
      description: "Inactive or paused SIPs",
      route: "/sip/inactivesip",
      icon: OrderIconGray,
      color: "bg-white dark:dark:bg-white/[0.03]",
      count: filteredCounts.inactiveSips,
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
