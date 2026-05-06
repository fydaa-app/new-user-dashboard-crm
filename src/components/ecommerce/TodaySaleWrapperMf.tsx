"use client";
import React from "react";
import Cookies from "js-cookie";
import TodaySale from "@/components/ecommerce/TodaySale";
import { useGlobalContext } from "@/context/GlobalState";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

interface CardData {
  type: string;
  totalRevenue?: number;
  totalNoOfTransactions?: number;
  noOfPayments?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  totalUsers?: number;
  assetsUnderManagement?:number;
}

interface TodaySalesData {
  totalRevenue: number;
  totalNoOfTransactions: number;
  noOfPayments: number;
  activeUsers: number;
  inactiveUsers: number;
  totalUsers: number;
  assetsUnderManagement:number;
}

const transformCardData = (data: CardData[]): TodaySalesData => ({
  totalRevenue: data.find((item) => item.type === "Total Revenue")?.totalRevenue || 0,
  totalNoOfTransactions: data.find((item) => item.type === "Total Transactions")?.totalNoOfTransactions || 0,
  noOfPayments: data.find((item) => item.type === "Total Payments")?.noOfPayments || 0,
  inactiveUsers: data.find((item) => item.type === "InActive Users")?.inactiveUsers || 0,
  activeUsers: data.find((item) => item.type === "Active Users")?.activeUsers || 0,
  totalUsers: data.find((item) => item.type === "Total Users")?.totalUsers || 0,
  assetsUnderManagement: Number(
    (data.find((item) => item.type === "Assets under Management")?.assetsUnderManagement || 0).toFixed(2)
  ),
});

const TodaySaleWrapper = () => {
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const { data: salesData, loading } = useFilteredFetch(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/cards-data-mf?`;

      if (selectedOption === 'custom') {
        url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
      } else {
        url += `timeframe=${selectedOption || "monthly"}`;
      }

      const employeeId = selectedTeamMember || selectedEmployee;
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      if (selectedType && selectedType.length > 0) {
        url += `&type=${selectedTeamMember ? hierarchyViewMode : effectiveType}`;
      }

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

      const data: CardData[] = await response.json();
      return transformCardData(data);
    },
    [
      selectedOption,
      customDates,
      selectedEmployee,
      selectedTeamMember,
      selectedType,
      hierarchyViewMode,
      userAppTypeLock,
    ]
  );

  return <TodaySale data={salesData || {
    totalRevenue: 0,
    totalNoOfTransactions: 0,
    noOfPayments: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalUsers: 0,
    assetsUnderManagement: 0,
  }} loading={loading} />;
};

export default TodaySaleWrapper;
