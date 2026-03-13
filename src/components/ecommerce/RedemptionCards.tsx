"use client";
import React from "react";
import {  SalesIcon, SalesIconOrange, SalesIconGreen, SalesIconViolet } from "@/icons";

interface RedemptionCardsProps {
  totalRedeemedAmount: number;
  totalRedemptionsCount: number;
  completedRedemptions: number;
  redemptionRate: number;
  loading?: boolean;
}

const RedemptionCards = ({  
  totalRedeemedAmount,
  totalRedemptionsCount,
  completedRedemptions,
  redemptionRate,
  loading 
}: RedemptionCardsProps) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">Loading redemption data...</p>
      </div>
    );
  }

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value || 0);

  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Redemption Summary
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Monitor redemption metrics across users
            </span>
          </div>
        </div>

        <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
          {/* Card 1: Total Redeemed Amount */}
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(totalRedeemedAmount)}
              </h2>
              <p className="total-sale-text">Total Redeemed Amount</p>
              <span className="total-yes"></span>
            </div>
          </div>

          {/* Card 2: Total Redemptions */}
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconOrange />
              <h2 className="numbers-sale text-gray-900">
                {totalRedemptionsCount.toLocaleString('en-IN')}
              </h2>
              <p className="total-sale-text">Total Redemptions</p>
              <span className="total-yes"></span>
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconGreen />
              <h2 className="numbers-sale text-gray-900">
                {completedRedemptions.toLocaleString('en-IN')}
              </h2>
              <p className="total-sale-text">Completed</p>
              <span className="total-yes"></span>
            </div>
          </div>

          {/* Card 4: Redemption Rate */}
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconViolet />
              <h2 className="numbers-sale text-gray-900">
                {(redemptionRate || 0).toFixed(2)}%
              </h2>
              <p className="total-sale-text">Redemption Rate</p>
              <span className="total-yes"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedemptionCards;
