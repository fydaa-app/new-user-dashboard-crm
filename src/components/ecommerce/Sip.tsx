"use client";
import React from "react";
import { SalesIcon, OrderIcon, DiscIcon, NewCustomerIcon } from "@/icons";

interface DataProps {
  totalActiveSips?: number;
  totalInActiveSips?: number;
  totalCompletedSips?: number;
  totalInProgressSips?: number;
  totalPartiallyExitedSips?: number;
}

const Sip = ({ data, loading }: { data: DataProps | null; loading: boolean }) => {
  if (loading) {
    return <p>Loading Sip data...</p>;
  }

  if (!data) {
    return <p>No SIP data available.</p>;
  }

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

        <div className="xl:flex items-end justify-between mt-5 sales-box-row">
          <div className="col-span-4">
            <div className="box-total-sales">
              <SalesIcon />
              <h2 className="numbers-sale">{data.totalActiveSips || 0}</h2>
              <p className="total-sale-text"><a href="/sip/activesip">Total Active SIPs</a></p>
              <span className="total-yes"></span>
            </div>
          </div>
          <div className="col-span-4">
            <div className="box-total-sales">
              <OrderIcon /> 
              <h2 className="numbers-sale">{data.totalInActiveSips || 0}</h2>
              <p className="total-sale-text"><a href="/sip/inactivesip">Total Inactive SIPs</a></p>
              <span className="total-yes"></span>
            </div>
          </div>
          <div className="col-span-4">
            <div className="box-total-sales">
              <DiscIcon />
              <h2 className="numbers-sale">{data.totalCompletedSips || 0}</h2>
              <p className="total-sale-text"><a href="/sip/completedsip">Total Completed SIPs</a></p>
              <span className="total-yes"></span>
            </div>
          </div>
          <div className="col-span-4">
            <div className="box-total-sales">
              <NewCustomerIcon />
              <h2 className="numbers-sale">{data.totalInProgressSips || 0}</h2>
              <p className="total-sale-text"><a href="/sip/inprogresssip">Total In-Progress SIPs</a></p>
              <span className="total-yes"></span>
            </div>
          </div>
          <div className="col-span-4">
            <div className="box-total-sales">
              <SalesIcon />
              <h2 className="numbers-sale">{data.totalPartiallyExitedSips || 0}</h2>
              <p className="total-sale-text"><a href="/sip/partiallyexitsip">Partially Exited SIPs</a></p>
              <span className="total-yes"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sip;