"use client";

import React from "react";
import { useRouter } from "next/navigation";

const SipIndexPage = () => {
  const router = useRouter();

  const sipCategories = [
    {
      title: "Active SIPs",
      description: "View all active and running SIPs",
      route: "/sip/activesip",
      icon: "✅",
      color: "bg-green-500",
    },
    {
      title: "Invested SIPs",
      description: "SIPs with completed investments",
      route: "/sip/investedsip",
      icon: "💰",
      color: "bg-blue-500",
    },
    {
      title: "In Progress SIPs",
      description: "SIPs currently being processed",
      route: "/sip/inprogresssip",
      icon: "⏳",
      color: "bg-yellow-500",
    },
    {
      title: "Completed SIPs",
      description: "Fully completed SIP investments",
      route: "/sip/completedsip",
      icon: "✔️",
      color: "bg-purple-500",
    },
    {
      title: "Cancelled SIPs",
      description: "Cancelled or terminated SIPs",
      route: "/sip/cancelledsip",
      icon: "❌",
      color: "bg-red-500",
    },
    {
      title: "Partially Exit SIPs",
      description: "SIPs with partial redemptions",
      route: "/sip/partiallyexitsip",
      icon: "↗️",
      color: "bg-orange-500",
    },
    {
      title: "Inactive SIPs",
      description: "Inactive or paused SIPs",
      route: "/sip/inactivesip",
      icon: "⏸️",
      color: "bg-gray-500",
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
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${category.color} 
text-2xl`}>
                {category.icon}
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
            <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
              View Details
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SipIndexPage;