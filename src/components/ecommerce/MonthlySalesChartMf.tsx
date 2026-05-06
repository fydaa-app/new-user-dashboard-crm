"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import Select from "@/components/form/Select";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type DataPoint = {
  label: string;
  revenue: number;
  transactionCount: number;
  userCount: number;
};

const chartOptions = [
  { value: "revenue", label: "Revenue" },
  { value: "transactionCount", label: "Transaction" },
  { value: "userCount", label: "User" }    
];

export default function MonthlySalesChart() {
  const [series, setSeries] = useState<{ name: string; data: number[] }[]>([
    { name: "Sales", data: [] },
  ]);
  const [categories, setCategories] = useState<string[]>([]);  
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [selectedDataType, setSelectedDataType] = useState("revenue");
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const { data: chartData } = useFilteredFetch<{ dataPoints: DataPoint[] }>(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");
      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/sales-report-mf?`;

      const timeframe = selectedOption === "custom" ? "monthly" : (selectedOption || "monthly");
      url += `timeframe=${timeframe}`;

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

      const data: { dataPoints: DataPoint[] } = await response.json();
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

  useEffect(() => {
    if (chartData?.dataPoints) {
      setDataPoints(chartData.dataPoints);
    }
  }, [chartData]);

  useEffect(() => {
    if (dataPoints.length === 0) return;

    const currentOption = chartOptions.find(option => option.value === selectedDataType);
    const seriesName = currentOption?.label || "Sales";

    const labels = dataPoints.map((point) => point.label);
    const dataValues = dataPoints.map((point) => {
      switch (selectedDataType) {
        case "revenue":
          return point.revenue;
        case "transactionCount":
          return point.transactionCount;
        case "userCount":
          return point.userCount;
        default:
          return 0;
      }
    });

    if(selectedOption != "till_date"){
      setCategories(labels);
    }    
    setSeries([{ name: seriesName, data: dataValues }]);
  }, [dataPoints, selectedDataType, selectedOption]);

  const handleSelectChange = (selected: { value: string; label: string } | null) => {
    if (selected) {
      setSelectedDataType(selected?.value || "revenue");
    }
  };

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 310,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: categories, 
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: { title: {
        text: chartOptions.find(opt => opt.value === selectedDataType)?.label,
        style: {
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "Outfit, sans-serif",
        }
      } 
    },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <div className="col-span-12 xl:col-span-7">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sales Report
          </h3>
        </div>
        <div className="col-span-12 xl:col-span-5">
        <Select
        options={chartOptions}
        placeholder="Select Metric"
        onChange={handleSelectChange}
        value={selectedDataType} 
        className="dark:bg-dark-900"
       />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart options={options} series={series} type="bar" height={310} />
        </div>
      </div>
    </div>
  );
}
