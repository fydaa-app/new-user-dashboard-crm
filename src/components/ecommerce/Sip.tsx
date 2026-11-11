"use client";
import React from "react";
import Link from "next/link";
import { SalesIcon, SalesIconOrange, SalesIconGreen, SalesIconViolet } from "@/icons";
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import DashboardSkeleton from "@/components/common/DashboardSkeleton";
import DashboardLoadError from "@/components/common/DashboardLoadError";

interface DataProps {
  totalActiveSips?: number;
  totalInActiveSips?: number;
  totalCompletedSips?: number;
  totalInProgressSips?: number;
  totalPartiallyExitedSips?: number;
  totalInvestedSips?: number;
  totalCancelledSips?: number;
}

const emptySipData: DataProps = {
  totalActiveSips: 0,
  totalInActiveSips: 0,
  totalCompletedSips: 0,
  totalInProgressSips: 0,
  totalPartiallyExitedSips: 0,
  totalInvestedSips: 0,
  totalCancelledSips: 0,
};

const Sip = ({
  data,
  loading,
  error,
  onRetry,
}: {
  data: DataProps | null;
  loading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}) => {
  if (loading) {
    return <DashboardSkeleton variant="cards" count={7} />;
  }

  if (error) {
    return (
      <DashboardLoadError
        message={error.message || "Failed to load SIP data"}
        onRetry={onRetry || (() => {})}
      />
    );
  }

  const sipData = data || emptySipData;

  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              SIP Summary
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Overview of all SIPs
            </span>
          </div>
        </div>

        <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
          <div className="col-span-4">
            <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">{sipData.totalActiveSips || 0}</h2>
              <p className="total-sale-text">
                <Link href="/sip/activesip" className="flex items-center gap-2 hover:italic  transition-all duration-300 group">
                  Total Active SIPs Mandate
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-300"><ArrowRightIcon className="w-3 h-3 inline-block group-hover:translate-x-1 transition-transform duration-300" /></span>
                </Link>
              </p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
              <SalesIconOrange />
              <h2 className="numbers-sale text-gray-900">{sipData.totalInvestedSips || 0}</h2>
              <p className="total-sale-text">
                <Link href="/sip/investedsip" className="flex items-center gap-2 hover:italic transition-all duration-300 group">
                  Total Invested Sips
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-300"><ArrowRightIcon className="w-3 h-3 inline-block group-hover:translate-x-1 transition-transform duration-300" /></span>
                </Link>
              </p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
              <SalesIconGreen />
              <h2 className="numbers-sale text-gray-900">{sipData.totalInProgressSips || 0}</h2>
              <p className="total-sale-text">
                <Link href="/sip/inprogresssip" className="flex items-center gap-2 hover:italic transition-all duration-300 group">
                  Total In-Progress SIPs
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-300"><ArrowRightIcon className="w-3 h-3 inline-block group-hover:translate-x-1 transition-transform duration-300" /></span>
                </Link>
              </p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
              <SalesIconViolet />
              <h2 className="numbers-sale text-gray-900">{sipData.totalInActiveSips || 0}</h2>
              <p className="total-sale-text">
                <Link href="/sip/inactivesip" className="flex items-center gap-2 hover:italic  transition-all duration-300 group">
                  Total Inactive SIPs
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-300"><ArrowRightIcon className="w-3 h-3 inline-block group-hover:translate-x-1 transition-transform duration-300" /></span>
                </Link>
              </p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">{sipData.totalPartiallyExitedSips || 0}</h2>
              <p className="total-sale-text">
                <Link href="/sip/partiallyexitsip" className="flex items-center gap-2 hover:italic  transition-all duration-300 group">
                  Partially Exited SIPs
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-300"><ArrowRightIcon className="w-3 h-3 inline-block group-hover:translate-x-1 transition-transform duration-300" /></span>
                </Link>
              </p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
              <SalesIconOrange />
              <h2 className="numbers-sale text-gray-900">{sipData.totalCompletedSips || 0}</h2>
              <p className="total-sale-text">
                <Link href="/sip/completedsip" className="flex items-center gap-2 hover:italic  transition-all duration-300 group">
                  Total Completed SIPs
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-300"><ArrowRightIcon className="w-3 h-3 inline-block group-hover:translate-x-1 transition-transform duration-300" /></span>
                </Link>
              </p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
              <SalesIconGreen />
              <h2 className="numbers-sale text-gray-900">{sipData.totalCancelledSips || 0}</h2>
              <p className="total-sale-text">
                <Link href="/sip/cancelledsip" className="flex items-center gap-2 hover:italic  transition-all duration-300 group">
                  Cancelled SIPs
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-300"><ArrowRightIcon className="w-3 h-3 inline-block group-hover:translate-x-1 transition-transform duration-300" /></span>
                </Link>
              </p>
              <span className="total-yes"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sip;
