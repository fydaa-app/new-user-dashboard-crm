"use client";

import React from "react";

interface Service {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

const TopServices: React.FC = () => {
  // Static data - will be replaced with API calls later
  const services: Service[] = [
    {
      name: "Financial Planning",
      count: 0,
      revenue: 0,
      percentage: 0,
    },
    {
      name: "Investment Advisory",
      count: 0,
      revenue: 0,
      percentage: 0,
    },
    {
      name: "Tax Consulting",
      count: 0,
      revenue: 0,
      percentage: 0,
    },
    {
      name: "Portfolio Management",
      count: 0,
      revenue: 0,
      percentage: 0,
    },
    {
      name: "Insurance Planning",
      count: 0,
      revenue: 0,
      percentage: 0,
    },
  ];

  const getColorClass = (index: number) => {
    const colors = [
      "bg-primary",
      "bg-secondary",
      "bg-success",
      "bg-warning",
      "bg-danger",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Top Services
        </h4>
      </div>
      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${getColorClass(index)}`}
                ></div>
                <span className="text-sm font-medium text-black dark:text-white">
                  {service.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-black dark:text-white">
                  ₹{service.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {service.count} clients
                </p>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-meta-4">
              <div
                className={`h-2 rounded-full ${getColorClass(index)}`}
                style={{ width: `${service.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      {services.length === 0 || services.every((s) => s.count === 0) ? (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No service data available
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default TopServices;
