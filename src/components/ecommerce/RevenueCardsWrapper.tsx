"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import RevenueCards from "@/components/ecommerce/RevenueCards";
import { useGlobalContext } from "@/context/GlobalState";
import { DashboardEndpoints } from "@/config/api-endpoints";

interface RevenueData {
  revenue: number;
  aum: number;
  totalRevenue: number;
  totalAum: number;
  targetPercentage: number | null;
  monthlyTargetPercentage: number | null;
}

const RevenueCardsWrapper = () => {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    revenue: 0,
    aum: 0,
    totalRevenue: 0,
    totalAum: 0,
    targetPercentage: null,
    monthlyTargetPercentage: null,
  });
  const [loading, setLoading] = useState(true);
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode } = useGlobalContext();

  useEffect(() => {
    const fetchRevenueData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        console.error("Auth token not found in cookies");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
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
          const typeValue = Array.isArray(selectedType) ? selectedType[0] : selectedType;
          url += `&type=${selectedTeamMember ? hierarchyViewMode : typeValue}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });

        if (response.status === 401) {
          Cookies.remove('authToken');
          window.location.href = "/signin";
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: RevenueData = await response.json();

        setRevenueData({
          revenue: data.revenue || 0,
          aum: data.aum || 0,
          totalRevenue: data.totalRevenue || 0,
          totalAum: data.totalAum || 0,
          targetPercentage: data.targetPercentage,
          monthlyTargetPercentage: data.monthlyTargetPercentage,
        });

      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode]);

  return (
    <>
      <RevenueCards
        revenue={revenueData.revenue}
        aum={revenueData.aum}
        totalRevenue={revenueData.totalRevenue}
        totalAum={revenueData.totalAum}
        targetPercentage={revenueData.targetPercentage}
        monthlyTargetPercentage={revenueData.monthlyTargetPercentage}
        timeframe={selectedOption || "monthly"}
        customDates={customDates}
        loading={loading}
      />
    </>
  );
};

export default RevenueCardsWrapper;
