"use client";
import React from "react";
import Cookies from "js-cookie";
import Sip from "@/components/ecommerce/Sip";
import { useGlobalContext } from "@/context/GlobalState";
import { pickModelMetric } from "@/context/investmentModel";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

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
}

interface SipData {
  totalActiveSips: number;
  totalActiveSipsRia: number;
  totalActiveSipsArn: number;
  totalInActiveSips: number;
  totalInActiveSipsRia: number;
  totalInActiveSipsArn: number;
  totalCompletedSips: number;
  totalCompletedSipsRia: number;
  totalCompletedSipsArn: number;
  totalInProgressSips: number;
  totalInProgressSipsRia: number;
  totalInProgressSipsArn: number;
  totalPartiallyExitedSips: number;
  totalPartiallyExitedSipsRia: number;
  totalPartiallyExitedSipsArn: number;
  totalInvestedSips: number;
  totalInvestedSipsRia: number;
  totalInvestedSipsArn: number;
  totalCancelledSips: number;
  totalCancelledSipsRia: number;
  totalCancelledSipsArn: number;
}

const readSip = (
  data: CardData[],
  type: string,
  combined: keyof CardData,
  ria: keyof CardData,
  arn: keyof CardData,
) => {
  const item = data.find((row) => row.type === type);
  return {
    combined: Number(item?.[combined] || 0),
    ria: Number(item?.[ria] || 0),
    arn: Number(item?.[arn] || 0),
  };
};

const transformSipData = (data: CardData[]): SipData => {
  const active = readSip(data, "Total Active Sips", "totalactivesip", "totalactivesipRia", "totalactivesipArn");
  const inactive = readSip(data, "Total Inactive Sips", "totalinactivesip", "totalinactivesipRia", "totalinactivesipArn");
  const completed = readSip(data, "Total Completed Sips", "totalcompletedsip", "totalcompletedsipRia", "totalcompletedsipArn");
  const inProgress = readSip(data, "Total In Progress Sips", "totalinprogresssip", "totalinprogresssipRia", "totalinprogresssipArn");
  const partial = readSip(data, "Partially Exited Sips", "totalpartiallyexitsip", "totalpartiallyexitsipRia", "totalpartiallyexitsipArn");
  const invested = readSip(data, "Total Invested Sips", "totalinvestedsip", "totalinvestedsipRia", "totalinvestedsipArn");
  const cancelled = readSip(data, "Cancelled Sips", "totalcancelledsip", "totalcancelledsipRia", "totalcancelledsipArn");
  return {
    totalActiveSips: active.combined,
    totalActiveSipsRia: active.ria,
    totalActiveSipsArn: active.arn,
    totalInActiveSips: inactive.combined,
    totalInActiveSipsRia: inactive.ria,
    totalInActiveSipsArn: inactive.arn,
    totalCompletedSips: completed.combined,
    totalCompletedSipsRia: completed.ria,
    totalCompletedSipsArn: completed.arn,
    totalInProgressSips: inProgress.combined,
    totalInProgressSipsRia: inProgress.ria,
    totalInProgressSipsArn: inProgress.arn,
    totalPartiallyExitedSips: partial.combined,
    totalPartiallyExitedSipsRia: partial.ria,
    totalPartiallyExitedSipsArn: partial.arn,
    totalInvestedSips: invested.combined,
    totalInvestedSipsRia: invested.ria,
    totalInvestedSipsArn: invested.arn,
    totalCancelledSips: cancelled.combined,
    totalCancelledSipsRia: cancelled.ria,
    totalCancelledSipsArn: cancelled.arn,
  };
};

const SipWrapper = () => {
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, investmentModelFilter } = useGlobalContext();
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

  const pick = (combined?: number, ria?: number, arn?: number) =>
    pickModelMetric(investmentModelFilter, combined, ria, arn);

  return <Sip data={{
    totalActiveSips: pick(sipData?.totalActiveSips, sipData?.totalActiveSipsRia, sipData?.totalActiveSipsArn),
    totalInActiveSips: pick(sipData?.totalInActiveSips, sipData?.totalInActiveSipsRia, sipData?.totalInActiveSipsArn),
    totalCompletedSips: pick(sipData?.totalCompletedSips, sipData?.totalCompletedSipsRia, sipData?.totalCompletedSipsArn),
    totalInProgressSips: pick(sipData?.totalInProgressSips, sipData?.totalInProgressSipsRia, sipData?.totalInProgressSipsArn),
    totalPartiallyExitedSips: pick(sipData?.totalPartiallyExitedSips, sipData?.totalPartiallyExitedSipsRia, sipData?.totalPartiallyExitedSipsArn),
    totalInvestedSips: pick(sipData?.totalInvestedSips, sipData?.totalInvestedSipsRia, sipData?.totalInvestedSipsArn),
    totalCancelledSips: pick(sipData?.totalCancelledSips, sipData?.totalCancelledSipsRia, sipData?.totalCancelledSipsArn),
  }} loading={loading} />;
};

export default SipWrapper;
