"use client";

import React from "react";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import TodaySaleWrapper from "@/components/ecommerce/TodaySaleWrapper";
import TodaySaleWrapperMf from "@/components/ecommerce/TodaySaleWrapperMf";
import TransactionSummaryWrapper from "@/components/ecommerce/TransactionSummaryWrapper";
import SipWrapper from "@/components/ecommerce/SipWrapper";
import MonthlySalesChartMf from "@/components/ecommerce/MonthlySalesChartMf";
import TopPackagesMf from "@/components/ecommerce/TopPackagesMf";
import TopGoalsMf from "@/components/ecommerce/TopGoalsMf";
import { useGlobalContext } from "@/context/GlobalState";
import RecentOrdersMf from "@/components/ecommerce/RecentOrdersMf";
import DueSipsWrapper from "@/components/ecommerce/DueSipsWrapper";
// import TargetVsRealityChartMf from "@/components/ecommerce/TargetVsRealityChartMf";
// import MonthlyTargetMf from "@/components/ecommerce/MonthlyTargetMf";
// import DemographicCard from "@/components/ecommerce/DemographicCard";
// import TargetVsRealityChart from "@/components/ecommerce/TargetvsRealityChart";
// import TopGoals from "@/components/ecommerce/TopGoals";
// import TopPackages from "@/components/ecommerce/TopPackages";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";

export default function Ecommerce() {
  const { appType } = useGlobalContext();

  if (appType === "Fydaa") {
    return (
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <TodaySaleWrapperMf />
        </div>

        <div className="col-span-12">
          <DueSipsWrapper />
        </div>

        <div className="col-span-12">
          <SipWrapper />
        </div>

        <div className="col-span-12">
          <TransactionSummaryWrapper />
        </div>
      
        <div className="col-span-12 xl:col-span-6">
          <MonthlySalesChartMf />
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

        <div className="col-span-12 xl:col-span-6">
          <div className="h-96 overflow-y-auto">
            <RecentOrdersMf />
          </div>        
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <TodaySaleWrapper />
      </div>
      
      <div className="col-span-12 xl:col-span-6">
        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <RecentOrders />
      </div>
           {/* <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div> */}

      {/* <div className="col-span-12 xl:col-span-6">
        <div className="h-96 overflow-y-auto">
          <TopPackages />
        </div>        
      </div> */}

      {/* <div className="col-span-12 xl:col-span-6">
       <div className="h-96 overflow-y-auto">
          <TopGoals />
        </div>
      </div> */}

      {/* <div className="col-span-12 xl:col-span-6">
        <TargetVsRealityChart />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <DemographicCard />
      </div> */}
      
      {/* <div className="col-span-12 xl:col-span-6">
        <TargetVsRealityChartMf />
      </div> */}

      {/* <div className="col-span-12 xl:col-span-6">
        <DemographicCard />
      </div> */}
      {/* <div className="col-span-12 xl:col-span-5">
        <MonthlyTargetMf />
      </div> */}

    </div>


  );
}