"use client";
import React from "react";
import Cookies from "js-cookie";
import TodaySale from "@/components/ecommerce/TodaySale";
import { useGlobalContext } from "@/context/GlobalState";
import { pickModelMetric } from "@/context/investmentModel";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

interface CardData {
  type: string;
  totalRevenue?: number;
  totalRevenueRia?: number;
  totalRevenueArn?: number;
  totalNoOfTransactions?: number;
  totalNoOfTransactionsRia?: number;
  totalNoOfTransactionsArn?: number;
  noOfPayments?: number;
  noOfPaymentsRia?: number;
  noOfPaymentsArn?: number;
  activeUsers?: number;
  activeUsersRia?: number;
  activeUsersArn?: number;
  inactiveUsers?: number;
  inactiveUsersRia?: number;
  inactiveUsersArn?: number;
  totalUsers?: number;
  totalUsersRia?: number;
  totalUsersArn?: number;
  assetsUnderManagement?: number;
  assetsUnderManagementRia?: number;
  assetsUnderManagementArn?: number;
}

interface TodaySalesData {
  totalRevenue: number;
  totalRevenueRia: number;
  totalRevenueArn: number;
  totalNoOfTransactions: number;
  totalNoOfTransactionsRia: number;
  totalNoOfTransactionsArn: number;
  noOfPayments: number;
  noOfPaymentsRia: number;
  noOfPaymentsArn: number;
  activeUsers: number;
  activeUsersRia: number;
  activeUsersArn: number;
  inactiveUsers: number;
  inactiveUsersRia: number;
  inactiveUsersArn: number;
  totalUsers: number;
  totalUsersRia: number;
  totalUsersArn: number;
  assetsUnderManagement: number;
  assetsUnderManagementRia: number;
  assetsUnderManagementArn: number;
}

const transformCardData = (data: CardData[]): TodaySalesData => {
  const revenue = data.find((item) => item.type === "Total Revenue");
  const transactions = data.find((item) => item.type === "Total Transactions");
  const payments = data.find((item) => item.type === "Total Payments");
  const inactive = data.find((item) => item.type === "InActive Users");
  const active = data.find((item) => item.type === "Active Users");
  const users = data.find((item) => item.type === "Total Users");
  const aum = data.find((item) => item.type === "Assets under Management");
  return {
    totalRevenue: revenue?.totalRevenue || 0,
    totalRevenueRia: revenue?.totalRevenueRia || 0,
    totalRevenueArn: revenue?.totalRevenueArn || 0,
    totalNoOfTransactions: transactions?.totalNoOfTransactions || 0,
    totalNoOfTransactionsRia: transactions?.totalNoOfTransactionsRia || 0,
    totalNoOfTransactionsArn: transactions?.totalNoOfTransactionsArn || 0,
    noOfPayments: payments?.noOfPayments || 0,
    noOfPaymentsRia: payments?.noOfPaymentsRia || 0,
    noOfPaymentsArn: payments?.noOfPaymentsArn || 0,
    inactiveUsers: inactive?.inactiveUsers || 0,
    inactiveUsersRia: inactive?.inactiveUsersRia || 0,
    inactiveUsersArn: inactive?.inactiveUsersArn || 0,
    activeUsers: active?.activeUsers || 0,
    activeUsersRia: active?.activeUsersRia || 0,
    activeUsersArn: active?.activeUsersArn || 0,
    totalUsers: users?.totalUsers || 0,
    totalUsersRia: users?.totalUsersRia || 0,
    totalUsersArn: users?.totalUsersArn || 0,
    assetsUnderManagement: Number((aum?.assetsUnderManagement || 0).toFixed(2)),
    assetsUnderManagementRia: Number((aum?.assetsUnderManagementRia || 0).toFixed(2)),
    assetsUnderManagementArn: Number((aum?.assetsUnderManagementArn || 0).toFixed(2)),
  };
};

const TodaySaleWrapper = () => {
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, investmentModelFilter } = useGlobalContext();
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

      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/cards-data-mf?`;

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

      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/cards-data-mf?`;

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

  const pick = (
    combined?: number,
    ria?: number,
    arn?: number,
  ) => pickModelMetric(investmentModelFilter, combined, ria, arn);

  // Combine team and member data - keep team and member data separate to prevent overwriting
  const combinedData = {
    // Main fields come ONLY from teamData
    totalRevenue: pick(teamData?.totalRevenue, teamData?.totalRevenueRia, teamData?.totalRevenueArn),
    totalNoOfTransactions: pick(teamData?.totalNoOfTransactions, teamData?.totalNoOfTransactionsRia, teamData?.totalNoOfTransactionsArn),
    noOfPayments: pick(teamData?.noOfPayments, teamData?.noOfPaymentsRia, teamData?.noOfPaymentsArn),
    activeUsers: pick(teamData?.activeUsers, teamData?.activeUsersRia, teamData?.activeUsersArn),
    inactiveUsers: pick(teamData?.inactiveUsers, teamData?.inactiveUsersRia, teamData?.inactiveUsersArn),
    totalUsers: pick(teamData?.totalUsers, teamData?.totalUsersRia, teamData?.totalUsersArn),
    assetsUnderManagement: pick(teamData?.assetsUnderManagement, teamData?.assetsUnderManagementRia, teamData?.assetsUnderManagementArn),

    // Member fields come ONLY from memberData
    memberTotalRevenue: pick(memberData?.totalRevenue, memberData?.totalRevenueRia, memberData?.totalRevenueArn),
    memberTotalNoOfTransactions: pick(memberData?.totalNoOfTransactions, memberData?.totalNoOfTransactionsRia, memberData?.totalNoOfTransactionsArn),
    memberNoOfPayments: pick(memberData?.noOfPayments, memberData?.noOfPaymentsRia, memberData?.noOfPaymentsArn),
    memberTotalUsers: pick(memberData?.totalUsers, memberData?.totalUsersRia, memberData?.totalUsersArn),
    memberAssetsUnderManagement: pick(memberData?.assetsUnderManagement, memberData?.assetsUnderManagementRia, memberData?.assetsUnderManagementArn),
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
