"use client";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import RevenueUserToggle from "../ui/button/RevenueUserToggle";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <p>Loading Chart...</p>,
});

interface ProgressItem {
  label: string;
  target: number;
  reality: number;
}

interface SeriesData {
  name: string;
  data: number[];
}

interface ApiResponse {
  progressData: ProgressItem[];
}

export default function TargetVsRealityChart() {
  const [series, setSeries] = useState<SeriesData[]>([
    { name: "Target", data: [] },
    { name: "Reality", data: [] },
  ]);
  const [categories, setCategories] = useState<string[]>([]);
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";
  const [currentView, setCurrentView] = useState<'revenue' | 'user'>('revenue');

  const { data: apiData } = useFilteredFetch<ApiResponse>(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");
      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_TARGET_REALITY_CHART_ENDPOINT}?metricType=${currentView}&`;

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

      const data: ApiResponse = await response.json();
      return data;
    },
    [
      selectedOption,
      customDates,
      currentView,
      selectedEmployee,
      selectedTeamMember,
      selectedType,
      hierarchyViewMode,
      userAppTypeLock,
    ]
  );

  // Update series and categories from apiData
  useEffect(() => {
    if (apiData?.progressData) {
      const progressData = apiData.progressData;
      const cats = progressData.map((item) => item.label);
      const targetData = progressData.map((item) => item.target);
      const realityData = progressData.map((item) => item.reality);
      setCategories(cats);
      setSeries([
        { name: "Target", data: targetData },
        { name: "Reality", data: realityData },
      ]);
    }
  }, [apiData]);

  const options: ApexOptions = {
    colors: ["#4AB58E", "#FFCF00"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 200,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "80%",
        borderRadius: 2,
        distributed: false,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: false },
    yaxis: { show: false },
    grid: {
      yaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Target vs Reality
        </h3>
        <RevenueUserToggle
          initialView={currentView}
          onChange={(view) => {
            setCurrentView(view);
          }}
          className="ml-4"
        />
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart options={options} series={series} type="bar" height={200} />
        </div>
      </div>
    </div>
  );
}
