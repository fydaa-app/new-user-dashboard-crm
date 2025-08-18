import type { Metadata } from "next";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import TargetVsRealityChart from "@/components/ecommerce/TargetvsRealityChart";
// import TopProducts from "@/components/ecommerce/TopProducts";
import TopGoals from "@/components/ecommerce/TopGoals";
import TopPackages from "@/components/ecommerce/TopPackages";
import TodaySaleWrapper from "@/components/ecommerce/TodaySaleWrapper";

export const metadata: Metadata = {
  title: "Fydaa - Admin Dashboard",
  description: "This is Fydaa Admin Dashboard",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <TodaySaleWrapper />
      </div>
      
      <div className="col-span-12 xl:col-span-7">
        <MonthlySalesChart />
      </div>
      
      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <div className="h-96 overflow-y-auto">
          <TopPackages />
        </div>        
      </div>

      <div className="col-span-12 xl:col-span-6">
       <div className="h-96 overflow-y-auto">
          <TopGoals />
        </div>
      </div>

      {/* <div className="col-span-12 xl:col-span-4">
        <TopProducts />
      </div> */}

      <div className="col-span-12 xl:col-span-6">
        <TargetVsRealityChart />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <RecentOrders />
      </div>
           
    </div>
  );
}