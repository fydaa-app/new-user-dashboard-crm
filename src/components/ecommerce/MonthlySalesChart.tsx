"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import Cookies from "js-cookie";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const [series, setSeries] = useState<{ name: string; data: number[] }[]>([
    { name: "Sales", data: [] },
  ]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSalesData() {
       const AUTH_TOKEN = Cookies.get("authToken");
      try {
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_SALE_ENDPOINT}`, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });

        const data: { dataPoints: { label: string; revenue: number }[] } = await response.json();

        if (data.dataPoints) {
          const labels = data.dataPoints.map((point) => point.label);
          const salesData = data.dataPoints.map((point) => point.revenue); // Using `transactionCount` for the graph

          setCategories(labels);
          setSeries([{ name: "Sales", data: salesData }]);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    }

    fetchSalesData();
  }, []);

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
      categories: categories, // Dynamic categories
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: { title: { text: undefined } },
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Sales Report
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart options={options} series={series} type="bar" height={310} />
        </div>
      </div>
    </div>
  );
}
