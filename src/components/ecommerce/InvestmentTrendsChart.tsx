"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";


const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const InvestmentTrendsChart: React.FC = () => {
  const context = useGlobalContext();
  
  if (!context) {
    throw new Error("GlobalStateContext must be used within GlobalStateProvider");
  }

  const { selectedEmployee, selectedTeamMember, selectedType, userAppTypeLock } = context;
  const effectiveType = userAppTypeLock || selectedType || "team";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [chartData, setChartData] = useState<{
    categories: string[];
    newInvestments: number[];
    existingInvestments: number[];
    redemptions: number[];
  } | null>(null);

  // Timeline controls - independent from global date filter
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [currentPeriod, setCurrentPeriod] = useState(0); // 0 = current, -1 = previous, etc.

  const timeframeOptions = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const AUTH_TOKEN = Cookies.get("authToken");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        let url = `${API_URL}/referrals/investment-trends-mf?timeframe=${timeframe}&period=${currentPeriod}`;

        const employeeId = selectedTeamMember || selectedEmployee;
        if (employeeId) {
          url += `&employeeId=${employeeId}`;
        }
        
        if (selectedType && selectedType.length > 0) {
          url += `&type=${effectiveType}`;
        }

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch investment trends");
        }

        const data = await response.json();
        setChartData(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Investment Trends Chart Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe, currentPeriod, selectedEmployee, selectedTeamMember, selectedType]);


  // Static data (fallback) - will be replaced with API calls later
  const getChartData = () => {
    // Use API data if available, otherwise use static fallback
    if (chartData) {
      return {
        categories: chartData.categories,
        newInvestments: chartData.newInvestments,
        existingInvestments: chartData.existingInvestments,
        redemptions: chartData.redemptions,
      };
    }
    
    // Static fallback data
    // This will be dynamic based on timeframe and currentPeriod
    const data = {
      weekly: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        newInvestments: [12000, 15000, 18000, 14000, 16000, 13000, 17000],
        existingInvestments: [8000, 9000, 7500, 10000, 9500, 8500, 11000],
        redemptions: [3000, 2500, 4000, 3500, 2000, 3000, 2500],
      },
      monthly: {
        categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
        newInvestments: [45000, 52000, 48000, 55000],
        existingInvestments: [32000, 38000, 35000, 40000],
        redemptions: [12000, 10000, 15000, 11000],
      },
      yearly: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        newInvestments: [150000, 165000, 180000, 175000, 190000, 200000, 195000, 210000, 205000, 220000, 215000, 230000],
        existingInvestments: [120000, 130000, 125000, 135000, 140000, 145000, 150000, 155000, 160000, 165000, 170000, 175000],
        redemptions: [40000, 35000, 45000, 42000, 38000, 50000, 48000, 45000, 52000, 49000, 46000, 55000],
      },
    };

    return data[timeframe];
  };

  const currentChartData = getChartData();

  const getPeriodLabel = () => {
    const labels = {
      weekly: currentPeriod === 0 ? "This Week" : currentPeriod === -1 ? "Last Week" : `${Math.abs(currentPeriod)} Weeks Ago`,
      monthly: currentPeriod === 0 ? "This Month" : currentPeriod === -1 ? "Last Month" : `${Math.abs(currentPeriod)} Months Ago`,
      yearly: currentPeriod === 0 ? "This Year" : currentPeriod === -1 ? "Last Year" : `${Math.abs(currentPeriod)} Years Ago`,
    };
    return labels[timeframe];
  };

  const handlePrevious = () => {
    setCurrentPeriod(currentPeriod - 1);
  };

  const handleNext = () => {
    if (currentPeriod < 0) {
      setCurrentPeriod(currentPeriod + 1);
    }
  };

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
      fontFamily: "Satoshi, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: currentChartData.categories,
    },
    yaxis: {
      title: {
        text: "Amount (₹)",
      },
      labels: {
        formatter: function (value: number) {
          return "₹" + value.toLocaleString();
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return "₹" + val.toLocaleString();
        },
      },
    },
    colors: ["#3C50E0", "#80CAEE", "#F87171"],
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
  };

  const series = [
    {
      name: "New Investments",
      data: currentChartData.newInvestments,
    },
    {
      name: "Existing Investments",
      data: currentChartData.existingInvestments,
    },
    {
      name: "Redemptions",
      data: currentChartData.redemptions,
    },
  ];

  return (
    <div className="h-full rounded-lg border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header with navigation and dropdown */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            className="flex h-8 w-8 items-center justify-center rounded border border-stroke hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
            title="Previous"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* Title with Period */}
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Investment Trends - {getPeriodLabel()}
          </h4>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPeriod >= 0}
            className={`flex h-8 w-8 items-center justify-center rounded border border-stroke dark:border-strokedark ${
              currentPeriod >= 0
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-2 dark:hover:bg-meta-4"
            }`}
            title="Next"
          >
            <svg className="h-4 w-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        {/* Timeframe Dropdown */}
        <div className="relative w-32">
          <Select
            options={timeframeOptions}
            placeholder="Select"
            onChange={(option) => {
              if (option) {
                setTimeframe(option.value as "weekly" | "monthly" | "yearly");
                setCurrentPeriod(0); // Reset to current period when changing timeframe
              }
            }}
            value={timeframe}
            className="dark:bg-dark-900"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      {/* Chart */}
      <div>
        {loading ? (
          <div className="flex h-[350px] items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex h-[350px] items-center justify-center">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : (
          <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
        )}
      </div>
    </div>
  );
};

export default InvestmentTrendsChart;
