"use client";
import React from "react";
import Cookies from "js-cookie";
import Sip from "@/components/ecommerce/Sip";
import { useGlobalContext } from "@/context/GlobalState";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

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

interface SipData {
  totalActiveSips: number;
  totalInActiveSips: number;
  totalCompletedSips: number;
  totalInProgressSips: number;
  totalPartiallyExitedSips: number;
  totalInvestedSips: number;
  totalCancelledSips: number;
}

const transformSipData = (data: CardData[]): SipData => ({
  totalActiveSips: data.find((item) => item.type === "Total Active Sips")?.totalactivesip || 0,
  totalInActiveSips: data.find((item) => item.type === "Total Inactive Sips")?.totalinactivesip || 0,
  totalCompletedSips: data.find((item) => item.type === "Total Completed Sips")?.totalcompletedsip || 0,
  totalInProgressSips: data.find((item) => item.type === "Total In Progress Sips")?.totalinprogresssip || 0,
  totalPartiallyExitedSips: data.find((item) => item.type === "Partially Exited Sips")?.totalpartiallyexitsip || 0,
  totalInvestedSips: data.find((item) => item.type === "Total Invested Sips")?.totalinvestedsip || 0,
  totalCancelledSips: data.find((item) => item.type === "Cancelled Sips")?.totalcancelledsip || 0,
});

const SipWrapper = () => {
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const { data: sipData, loading } = useFilteredFetch(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/sip-cards-data-mf?`;

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
      return transformSipData(data);
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

  return <Sip data={sipData || {
    totalActiveSips: 0,
    totalInActiveSips: 0,
    totalCompletedSips: 0,
    totalInProgressSips: 0,
    totalPartiallyExitedSips: 0,
    totalInvestedSips: 0,
    totalCancelledSips: 0,
  }} loading={loading} />;
};

export default SipWrapper;
