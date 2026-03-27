"use client";

import React from "react";
import RevenueCardsWrapper from "@/components/ecommerce/RevenueCardsWrapper";
import TopGoalsMf from "@/components/ecommerce/TopGoalsMf";
import TopPackagesMf from "@/components/ecommerce/TopPackagesMf";
import MonthlySalesChartMf from "@/components/ecommerce/MonthlySalesChartMf";

export default function RevenuePage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 w-full max-w-full">
      <div className="col-span-12">
        <RevenueCardsWrapper />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <div className="h-96 overflow-y-auto">
          <TopGoalsMf />
        </div>
      </div>

      <div className="col-span-12 xl:col-span-6">
        <div className="h-96 overflow-y-auto">
          <TopPackagesMf />
        </div>
      </div>

      <div className="col-span-12">
        <MonthlySalesChartMf />
      </div>
    </div>
  );
}