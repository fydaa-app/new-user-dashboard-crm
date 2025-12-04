"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import PerformanceXIRRTable from "../tables/PerformanceXIRRTable";
import { XIRRTableData } from "../../services/xirrService";

interface XIRRTableSectionProps {
  activeTab: string;
  fromApp?: string;
  loadingXIRR: boolean;
  xirrError: string | null;
  xirrData: XIRRTableData | null;
}

export default function XIRRTableSection({
  activeTab,
  fromApp,
  loadingXIRR,
  xirrError,
  xirrData,
}: XIRRTableSectionProps) {
  if (activeTab !== "Portfolio" || fromApp?.toLowerCase() !== "savestment") {
    return null;
  }

  if (loadingXIRR) {
    return (
      <div className="col-span-12 w-full p-5 dark:text-gray-400">Loading performance metrics...</div>
    );
  }

  if (xirrError) {
    return (
      <div className="col-span-12 w-full p-5 dark:text-gray-400">
        <Badge color="warning">No XIRR Data Available</Badge>
      </div>
    );
  }

  if (!xirrData) {
    return null;
  }

  return (
    <div className="col-span-12 w-full p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
      <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6 ">
        <h3 className="text-lg font-semibold dark:text-gray-400">Performance Metrics (XIRR)</h3>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <PerformanceXIRRTable
              portfolioXIRR={xirrData.portfolioXIRR}
              benchmarkXIRR={xirrData.benchmarkXIRR}
              loading={loadingXIRR}
              error={xirrError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

