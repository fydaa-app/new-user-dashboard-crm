"use client";
import React from "react";
import { SalesIcon, SalesIconOrange, SalesIconGreen, SalesIconViolet } from "@/icons";

interface RevenueCardsProps {
  revenue: number;
  aum: number;
  totalRevenue: number;
  totalAum: number;
  targetPercentage: number | null;
  monthlyTargetPercentage: number | null;
  timeframe: string;
  loading?: boolean;
}

const RevenueCards = ({
  revenue,
  aum,
  totalRevenue,
  totalAum,
  targetPercentage,
  monthlyTargetPercentage,
  timeframe,
  loading,
}: RevenueCardsProps) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">Loading revenue data...</p>
      </div>
    );
  }

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

  const isMonthly = timeframe === "monthly";
  const displayTarget = isMonthly && monthlyTargetPercentage !== null 
    ? monthlyTargetPercentage 
    : targetPercentage;

  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Revenue Summary
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Monitor Revenue & AUM Metrics
            </span>
          </div>
        </div>

        <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(revenue)}
              </h2>
              <p className="total-sale-text">Revenue</p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconOrange />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(aum)}
              </h2>
              <p className="total-sale-text">AUM</p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconGreen />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(totalRevenue)}
              </h2>
              <p className="total-sale-text">Total Revenue</p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconViolet />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(totalAum)}
              </h2>
              <p className="total-sale-text">Total AUM</p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">
                {displayTarget !== null ? `${displayTarget.toFixed(2)}%` : 'N/A'}
              </h2>
              <p className="total-sale-text">Target %</p>
              <span className="total-yes"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueCards;
