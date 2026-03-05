"use client";

import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import dynamic from "next/dynamic";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode } = useGlobalContext();

  useEffect(() => {
    console.log("⚡ useEffect TRIGGERED! Dependencies:", {
      selectedOption,
      "customDates.start": customDates.start,
      "customDates.end": customDates.end,
      selectedEmployee,
      selectedTeamMember,
      selectedType,
      hierarchyViewMode
    });
    const fetchPackageData = async () => {
      setLoading(true);  // Reset loading state on each fetch
      console.log("🔍 SalesByPackageChart: Fetching data with filters:", {
        selectedOption,
        customDates,
        selectedEmployee,
        selectedTeamMember,
        selectedType,
        hierarchyViewMode
      });
      const AUTH_TOKEN = Cookies.get("authToken");
      
      if (!AUTH_TOKEN) {
        console.error("Auth token not found");
        setLoading(false);
        return;
      }

      try {
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
          throw new Error("Failed to fetch package data");
        }

        const data: TopPackagesResponse = await response.json();
        console.log("📊 SalesByPackageChart: Received data:", data);
        setPackageData(data.packageWiseData);
        console.log("✅ SalesByPackageChart: Updated packageData state:", data.packageWiseData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [selectedOption, customDates.start, customDates.end, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode]);

  // Prepare chart data with useMemo to trigger re-render
  console.log("🔄 SalesByPackageChart: packageData changed, recalculating chart data. Length:", packageData.length);
  const chartLabels = useMemo(() => packageData.map((pkg) => `${pkg.packageName} (${pkg.userCount} users)`), [packageData]);
  console.log("📈 chartLabels calculated:", chartLabels);
  const chartSeries = useMemo(() => packageData.map((pkg) => pkg.totalAmount), [packageData]);
  console.log("📊 chartSeries calculated:", chartSeries);
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
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Sales by Package
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Revenue distribution of users across packages
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
      ) : packageData.length === 0 ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-gray-500">No package data available</p>
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

export default SalesByPackageChart;
