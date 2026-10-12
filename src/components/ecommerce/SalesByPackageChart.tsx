"use client";

import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import { investmentModelQuery } from "@/context/investmentModel";
import { transformPackages } from "@/utils/packageTransform";
import dynamic from "next/dynamic";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

interface PackageData {
  packageName: string;
  userCount: number;
  totalAmount: number;
  userPercentage: number;
  amountPercentage: number;
}

interface TopPackagesResponse {
  employeeId: number;
  employeeName: string;
  timeframe: string;
  totalUsers: number;
  totalAmount: number;
  packageWiseData: PackageData[];
}

const SalesByPackageChart = () => {
  const [packageData, setPackageData] = useState<PackageData[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, investmentModelFilter } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const { data: apiData, loading, error } = useFilteredFetch<TopPackagesResponse>(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");
      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/top-packages-mf?`;

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

      url += investmentModelQuery(investmentModelFilter);

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

      const data: TopPackagesResponse = await response.json();
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
      investmentModelFilter,
    ]
  );

  useEffect(() => {
    if (apiData?.packageWiseData) {
      const transformedPackages = transformPackages(apiData.packageWiseData);
      setPackageData(transformedPackages);
    }
  }, [apiData]);

  const chartLabels = useMemo(() => packageData.map((pkg) => `${pkg.packageName} (${pkg.userCount} users)`), [packageData]);
  const chartSeries = useMemo(() => packageData.map((pkg) => pkg.totalAmount), [packageData]);
  const totalRevenue = useMemo(
    () => chartSeries.reduce((sum, value) => sum + value, 0),
    [chartSeries]
  );
  const activeIndex = hoveredIndex ?? selectedIndex;
  const activeLabel = activeIndex !== null ? chartLabels[activeIndex] : "";
  const activeValue =
    activeIndex !== null ? chartSeries[activeIndex] : null;
  const chartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif",
      events: {
        dataPointMouseEnter: (_event, _chartContext, config) => {
          setHoveredIndex(config.dataPointIndex);
        },
        dataPointMouseLeave: () => {
          setHoveredIndex(null);
        },
        dataPointSelection: (_event, _chartContext, config) => {
          setSelectedIndex((prev) =>
            prev === config.dataPointIndex ? null : config.dataPointIndex
          );
        },
      },
    },
    labels: chartLabels,
    colors: ["#3C50E0", "#6577F3", "#8FD0EF", "#0FADCF", "#80CAEE"],
    legend: {
      show: false,
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
            name: {
              show: false,
            },
            value: {
              show: false,
            },
            total: {
              show: false,
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
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sales by Package
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Revenue distribution of users across packages
          </span>
        </div>

        <p className="shrink-0 text-sm font-semibold text-gray-800 dark:text-white/90">
          Total: {totalRevenue.toLocaleString("en-IN")}
        </p>
      </div>

      {loading ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      ) : error ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-red-500">{error.message}</p>
        </div>
      ) : packageData.length === 0 ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-gray-500">No package data available</p>
        </div>
      ) : (
        <div className="relative">
          <div className="mb-2 h-7 flex items-center justify-center">
            {activeLabel && (
              <p className="truncate text-center text-lg font-semibold text-gray-800 dark:text-white/90">
                {activeLabel}
              </p>
            )}
          </div>
          <ApexCharts
            options={chartOptions}
            series={chartSeries}
            type="donut"
            height={350}
            width="100%"
          />
          {activeValue !== null && (
            <div className="pointer-events-none absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 text-center text-xl font-bold text-gray-800 dark:text-white">
              {activeValue.toLocaleString("en-IN")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesByPackageChart;
