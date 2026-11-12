"use client";
import React from "react";
import Cookies from "js-cookie";
import TodaySale from "@/components/ecommerce/TodaySale";
import { useGlobalContext } from "@/context/GlobalState";
import { DashboardEndpoints } from "@/config/api-endpoints";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

interface CardData {
  type: string;
  totalRevenue?: number;
  totalNoOfTransactions?: number;
  noOfPayments?: number;
  activeUsers?: number;
  newUsers?: number;
  totalUsers?: number;
  assetsUnderManagement?:number;
}

interface TodaySalesData {
  totalRevenue: number;
  totalNoOfTransactions: number;
  noOfPayments: number;
  activeUsers: number;
  newUsers: number;
  totalUsers: number;
  assetsUnderManagement:number;
  
  // Member-specific values for Individual field
  memberTotalRevenue?: number;
  memberTotalNoOfTransactions?: number;
  memberNoOfPayments?: number;
  memberTotalUsers?: number;
  memberAssetsUnderManagement?: number;
}

const transformCardData = (data: CardData[]): TodaySalesData => ({
  totalRevenue: data.find((item) => item.type === "Total Revenue")?.totalRevenue || 0,
  totalNoOfTransactions: data.find((item) => item.type === "Total Transactions")?.totalNoOfTransactions || 0,
  noOfPayments: data.find((item) => item.type === "Total Payments")?.noOfPayments || 0,
  newUsers: data.find((item) => item.type === "New Users")?.newUsers || 0,
  activeUsers: data.find((item) => item.type === "Active Users")?.activeUsers || 0,
  totalUsers: data.find((item) => item.type === "Total Users")?.totalUsers || 0,
  assetsUnderManagement: Number(
    (data.find((item) => item.type === "Assets under Management")?.assetsUnderManagement || 0).toFixed(2)
  ),
});

const TodaySaleWrapper = () => {
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock } = useGlobalContext();
  //const effectiveType = userAppTypeLock || selectedType || "team";
  const isTeamView = Array.isArray(selectedType) 
    ? selectedType[0] === "team" 
    : selectedType === "team";

  // Fetch team data (always)
  const { data: teamData, loading: teamLoading, error: teamError, refetch: refetchTeam } = useFilteredFetch(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}${DashboardEndpoints.CARD_DATA}?`;

      if (selectedOption === 'custom') {
        url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
      } else {
        url += `timeframe=${selectedOption || "monthly"}`;
      }

      // For team data, we MUST pass the employeeId (manager's ID) with type=team
      // This tells backend whose team aggregate to return
      const employeeId = selectedTeamMember || selectedEmployee;
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      url += `&type=team`;

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

  // Fetch member data only when in team view and a specific member is selected
  const { data: memberData, loading: memberLoading, error: memberError, refetch: refetchMember } = useFilteredFetch(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      // Only fetch member data when we're in team view AND have a specific member selected
      if (!isTeamView || !(selectedTeamMember || selectedEmployee)) {
        return null; // Return null to indicate no member data
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}${DashboardEndpoints.CARD_DATA}?`;

      if (selectedOption === 'custom') {
        url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
      } else {
        url += `timeframe=${selectedOption || "monthly"}`;
      }

      // Always include employeeId for member data
      const employeeId = selectedTeamMember || selectedEmployee;
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      
      // For member data, we want to see the member's individual stats
      // This might be "individual" type or we might not need a type filter at all
      // Let's try without type filter first, or use "individual" if needed
      url += `&type=individual`;

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

  // Combine team and member data - keep team and member data separate to prevent overwriting
  const combinedData = {
    // Main fields come ONLY from teamData
    totalRevenue: teamData?.totalRevenue ?? 0,
    totalNoOfTransactions: teamData?.totalNoOfTransactions ?? 0,
    noOfPayments: teamData?.noOfPayments ?? 0,
    newUsers: teamData?.newUsers ?? 0,
    activeUsers: teamData?.activeUsers ?? 0,
    totalUsers: teamData?.totalUsers ?? 0,
    assetsUnderManagement: teamData?.assetsUnderManagement ?? 0,
    
    // Member fields come ONLY from memberData
    memberTotalRevenue: memberData?.totalRevenue ?? 0,
    memberTotalNoOfTransactions: memberData?.totalNoOfTransactions ?? 0,
    memberNoOfPayments: memberData?.noOfPayments ?? 0,
    memberTotalUsers: memberData?.totalUsers ?? 0,
    memberAssetsUnderManagement: memberData?.assetsUnderManagement ?? 0,
  };

  const loading = teamLoading || memberLoading;
  const error = teamError || memberError;
  const refetch = () => {
    refetchTeam();
    refetchMember();
  };

  return (
    <TodaySale
      data={combinedData}
      loading={loading}
      error={error}
      onRetry={refetch}
    />
  );
};

export default TodaySaleWrapper;
