"use client";
import React from "react";
import Cookies from "js-cookie";
import RevenueCards from "@/components/ecommerce/RevenueCards";
import { useGlobalContext } from "@/context/GlobalState";
import { DashboardEndpoints } from "@/config/api-endpoints";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

interface RevenueData {
  revenue: number;
  aum: number;
  totalRevenue: number;
  totalAum: number;
  targetPercentage: number | null;
  monthlyTargetPercentage: number | null;
}

const RevenueCardsWrapper = () => {
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const { data: revenueData, loading } = useFilteredFetch<RevenueData>(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}${DashboardEndpoints.REVENUE_CARDS}?`;

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

      const data: RevenueData = await response.json();
      return data;
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

  return (
    <>
      <RevenueCards
        revenue={revenueData?.revenue || 0}
        aum={revenueData?.aum || 0}
        totalRevenue={revenueData?.totalRevenue || 0}
        totalAum={revenueData?.totalAum || 0}
        targetPercentage={revenueData?.targetPercentage || null}
        monthlyTargetPercentage={revenueData?.monthlyTargetPercentage || null}
        timeframe={selectedOption || "monthly"}
        customDates={customDates}
        loading={loading}
      />
    </>
  );
};

export default RevenueCardsWrapper;
