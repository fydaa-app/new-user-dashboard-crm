"use client";

import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import dynamic from "next/dynamic";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

interface GoalData {
  goalId: number;
  goalName: string;
  userCount: number;
  totalRevenue: number;
  percentage: number;
}

interface GoalResponse {
  employeeId: number;
  employeeName: string;
  timeframe: string;
  totalUsers: number;
  totalRevenue: number;
  goalInvestmentData: GoalData[];
}

const SalesByGoalChart = () => {
  const [goalData, setGoalData] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode } =
useGlobalContext();

  useEffect(() => {
    const fetchGoalData = async () => {
      setLoading(true);
      try {
        const authToken = Cookies.get("authToken");
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/top-goals-mf?timeframe=${selectedOption}`;

        if (selectedOption === "custom" && customDates.start && customDates.end) {
                  url += `&startDate=${customDates.start}&endDate=${customDates.end}`;
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
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch top goals");
        }

        const data: GoalResponse = await response.json();
        setGoalData(data.goalInvestmentData || []);
        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching goal data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setGoalData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGoalData();
  }, [selectedOption, customDates.start, customDates.end, selectedEmployee, selectedTeamMember, selectedType, 
hierarchyViewMode]);

  const chartLabels = useMemo(() => goalData.map((goal) => `${goal.goalName} (${goal.userCount} users)`), 
[goalData]);
  const chartSeries = useMemo(() => goalData.map((goal) => goal.totalRevenue), [goalData]);

  const chartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif",
    },
    labels: chartLabels,
    colors: ["#3C50E0", "#6577F3", "#8FD0EF", "#0FADCF", "#80CAEE"],
    legend: {
      show: true,
      position: "right",
      fontSize: "14px",
      fontWeight: 500,
      horizontalAlign: "left",
      floating: false,
      labels: {
        colors: "#64748B",
      },
      scroll: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "55%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Total Revenue",
              fontSize: "16px",
              fontWeight: 600,
              color: "#64748B",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
              },
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 700,
              color: "#1F2937",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: "100%",
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: "100%",
          },
        },
      },
    ],
  }), [chartLabels]);

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] 
sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Sales by Goal
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Revenue distribution across goals
        </span>
      </div>

      {loading ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      ) : error ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : goalData.length === 0 ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-gray-500">No goal data available</p>
        </div>
      ) : (
        <div className="relative">
          <ApexCharts
            options={chartOptions}
            series={chartSeries}
            type="donut"
            height={350}
            width="100%"
          />
        </div>
      )}
    </div>
  );
};

export default SalesByGoalChart;
