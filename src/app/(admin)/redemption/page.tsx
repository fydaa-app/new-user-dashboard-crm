"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useGlobalContext } from "@/context/GlobalState";
import ComponentCard from "@/components/common/ComponentCard";
import RedemptionCards from "@/components/ecommerce/RedemptionCards";
import RedemptionsList from "@/components/ecommerce/RecentRedemptions";
import Cookies from "js-cookie";

interface RedemptionCardsData {
  totalRedeemedAmount: number;
  totalRedemptionsCount: number;
  totalRedemptionTransactions: number;
  totalOrders: number;
  totalSuccessfulOrders: number;
  totalFailedOrders: number;
  goalsAchieved: number;
  redemptionRate: number;
}

async function fetchRedemptionCards(
  selectedOption: string,
  selectedEmployee: string,
  selectedTeamMember: string,
  customDates: { start: string; end: string },
  selectedType: string,
  hierarchyViewMode: "team" | "individual",
  reportType: string = ""
): Promise<RedemptionCardsData> {
  try {
    const employeeId = selectedTeamMember || selectedEmployee;
    const authToken = Cookies.get("authToken");
    
    let queryParams = "";

    if (selectedOption === 'custom') {
      queryParams += `timeframe=custom&customStartDate=${customDates.start}&customEndDate=${customDates.end}`;
    } else {
      queryParams += `timeframe=${selectedOption || "yearly"}`;
    }

    if (employeeId) {
      queryParams += `&employeeId=${employeeId}`;
    }

    if (selectedType) {
      queryParams += `&type=${selectedTeamMember ? hierarchyViewMode : selectedType}`;
    }

    if (reportType) {
      queryParams += `&reportType=${reportType}`;
    }

    const cardsUrl = `${process.env.NEXT_PUBLIC_API_URL}/referrals/redemption-cards-mf?${queryParams}`;
    
    const response = await fetch(cardsUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch redemption cards");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching redemption cards:", err);
    return {
      totalRedeemedAmount: 0,
      totalRedemptionsCount: 0,
      totalRedemptionTransactions: 0,
      totalOrders: 0,
      totalSuccessfulOrders: 0,
      totalFailedOrders: 0,
      goalsAchieved: 0,
      redemptionRate: 0,
    };
  }
}

export default function RedemptionPage() {
  const {
    appType,
    selectedOption,
    customDates,
    selectedEmployee,
    selectedTeamMember,
    hierarchyViewMode,
    selectedType,
  } = useGlobalContext();

  const [reportType, setReportType] = useState("");

  const [cardsData, setCardsData] = useState<RedemptionCardsData>({
    totalRedeemedAmount: 0,
    totalRedemptionsCount: 0,
    totalRedemptionTransactions: 0,
    totalOrders: 0,
    totalSuccessfulOrders: 0,
    totalFailedOrders: 0,
    goalsAchieved: 0,
    redemptionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const previousFiltersRef = useRef({
    selectedOption,
    selectedEmployee,
    selectedTeamMember,
    customDates,
    selectedType,
    reportType,
  });

  const fetchCardsData = useCallback(async () => {
    if (!appType || appType !== "Fydaa") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const effectiveSelectedType = selectedType && selectedType.length > 0 ? selectedType[0] : "team";

      const result = await fetchRedemptionCards(
        selectedOption,
        selectedEmployee || "",
        selectedTeamMember || "",
        customDates,
        effectiveSelectedType,
        hierarchyViewMode,
        reportType
      );

      setCardsData(result);
    } catch (err) {
      console.error("Error fetching cards data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [appType, selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, reportType]);

  // Fetch cards data when filters change
  useEffect(() => {
    fetchCardsData();
  }, [appType, selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, reportType]);

  // Reset to page 1 when filters change
  useEffect(() => {

    previousFiltersRef.current = {
      selectedOption,
      selectedEmployee,
      selectedTeamMember,
      customDates,
      selectedType,
      reportType,
    };
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, reportType]);

  const handleReportTypeChange = (newReportType: string) => {
    setReportType(newReportType);
  };

  if (appType !== "Fydaa") {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Redemption Management
        </h1>
      </div>

      {/* Redemption Summary Cards */}
      <RedemptionCards
        totalRedeemedAmount={cardsData.totalRedeemedAmount}
        totalRedemptionsCount={cardsData.totalRedemptionTransactions}
        completedRedemptions={cardsData.goalsAchieved}
        redemptionRate={cardsData.redemptionRate}
        loading={isLoading}
      />

      {/* Redemptions List */}
      <ComponentCard title="Redemptions List">
        <RedemptionsList 
          reportType={reportType} 
          onReportTypeChange={handleReportTypeChange} 
        />
      </ComponentCard>
    </div>
  );
}
