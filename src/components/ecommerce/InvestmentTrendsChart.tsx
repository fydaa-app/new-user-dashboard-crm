"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const InvestmentTrendsChart: React.FC = () => {
  // Static data - will be replaced with API calls later
  const [timeframe, setTimeframe] = useState("month");

  const chartData = {
    series: [
      {
        name: "New Investments",
        data: [0, 0, 0, 0, 0, 0],
      },
      {
        name: "Existing Investments",
        data: [0, 0, 0, 0, 0, 0],
      },
      {
        name: "Redemptions",
        data: [0, 0, 0, 0, 0, 0],
      },
    ],
    categories: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
  };

  const options: any = {
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
      categories: chartData.categories,
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

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Investment Trends
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe("week")}
            className={`rounded px-3 py-1 text-sm ${
              timeframe === "week"
                ? "bg-primary text-white"
                : "bg-gray-2 text-gray-600 dark:bg-meta-4 dark:text-white"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe("month")}
            className={`rounded px-3 py-1 text-sm ${
              timeframe === "month"
                ? "bg-primary text-white"
                : "bg-gray-2 text-gray-600 dark:bg-meta-4 dark:text-white"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeframe("year")}
            className={`rounded px-3 py-1 text-sm ${
              timeframe === "year"
                ? "bg-primary text-white"
                : "bg-gray-2 text-gray-600 dark:bg-meta-4 dark:text-white"
            }`}
          >
            Year
          </button>
        </div>
      </div>
      <div>
        <ReactApexChart
          options={options}
          series={chartData.series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

export default InvestmentTrendsChart;
