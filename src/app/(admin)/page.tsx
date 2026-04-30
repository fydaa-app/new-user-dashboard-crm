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
import NonAdminDashboard from "@/components/ecommerce/NonAdminDashboard";
import { useGlobalContext } from "@/context/GlobalState";
import { useAuth } from "@/context/AuthContext";
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
  const { appType, userAppTypeLock } = useGlobalContext();
  const { user } = useAuth();

  // Use locked app type if set, otherwise use user selection
  const effectiveAppType = userAppTypeLock || appType;

  // DEBUG: Track all state changes
  React.useEffect(() => {
    // console.log('[DEBUG AdminPage] ===== STATE =====');
    // console.log('[DEBUG AdminPage] user:', user);
    // console.log('[DEBUG AdminPage] isAdmin:', user?.role === "0");
    // console.log('[DEBUG AdminPage] appType (from GlobalState):', appType);
    // console.log('[DEBUG AdminPage] userAppTypeLock (from GlobalState):', userAppTypeLock);
    // console.log('[DEBUG AdminPage] effectiveAppType:', effectiveAppType);
    // console.log('[DEBUG AdminPage] localStorage appType:', localStorage.getItem('appType'));
    // console.log('[DEBUG AdminPage] localStorage userAppTypeLock:', localStorage.getItem('userAppTypeLock'));
    //const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    // console.log('[DEBUG AdminPage] userInfo.app_type_lock:', userInfo.app_type_lock);
    // console.log('[DEBUG AdminPage] ======================');
  }, [user, appType, userAppTypeLock, effectiveAppType]);

  // DEBUG: Track mount
  React.useEffect(() => {
    //console.log('[DEBUG AdminPage] ===== MOUNTED =====');
  }, []);

  // Check if user is admin (role "0")
  const isAdmin = user?.role === "0";

  // Non-admin users get the new dashboard
  if (!isAdmin && effectiveAppType === "Fydaa") {
    return <NonAdminDashboard />;
  }

  // Admin users get the original dashboard
  if (effectiveAppType === "Fydaa") {
    return (
      <div className="grid grid-cols-12 gap-4 md:gap-6 w-full max-w-full">
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
    <div className="grid grid-cols-12 gap-4 md:gap-6 w-full max-w-full">
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