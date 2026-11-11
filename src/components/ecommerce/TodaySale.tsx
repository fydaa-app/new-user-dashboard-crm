"use client";
import React from "react";
import { SalesIcon, OrderIcon, DiscIcon, NewCustomerIcon } from "@/icons";
import { useGlobalContext } from "@/context/GlobalState";
import DashboardSkeleton from "@/components/common/DashboardSkeleton";
import DashboardLoadError from "@/components/common/DashboardLoadError";

interface DataProps {
  totalRevenue?: number;
  totalNoOfTransactions?: number;
  noOfPayments?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  totalUsers?: number;
  assetsUnderManagement: number;
  
  // Member-specific values for Individual field
  memberTotalRevenue?: number;
  memberTotalNoOfTransactions?: number;
  memberNoOfPayments?: number;
  memberTotalUsers?: number;
  memberAssetsUnderManagement?: number;
}

const emptySalesData: DataProps = {
  totalRevenue: 0,
  totalNoOfTransactions: 0,
  noOfPayments: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  totalUsers: 0,
  assetsUnderManagement: 0,
  memberTotalRevenue: 0,
  memberTotalNoOfTransactions: 0,
  memberNoOfPayments: 0,
  memberTotalUsers: 0,
  memberAssetsUnderManagement: 0,
};

const TodaySale = ({
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
  const { selectedType } = useGlobalContext();

  if (loading) {
    return <DashboardSkeleton variant="cards" count={4} />;
  }

  if (error) {
    return (
      <DashboardLoadError
        message={error.message || "Failed to load sales data"}
        onRetry={onRetry || (() => {})}
      />
    );
  }

  const salesData = data || emptySalesData;
  
  
  const isTeamView = Array.isArray(selectedType) 
    ? selectedType[0] === "team" 
    : selectedType === "team";
  
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

  const formatNumber = (value: number): string =>
    Number(value).toFixed(2);

  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Today’s Sales
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Sales Summary
            </span>
          </div>         
        </div>

        <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
          <div className="col-span-4">
<div className="box-total-sales h-full">
                <SalesIcon />
                <h2 className="numbers-sale text-gray-900">{salesData.totalRevenue}</h2>
                <p className="total-sale-text">Total Revenue</p>
                {isTeamView && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Individual: {salesData.memberTotalRevenue || 0}</span>
                    <span>Team: {formatNumber((salesData.totalRevenue || 0) - (salesData.memberTotalRevenue || 0))}</span>
                  </div>
                )}
                <span className="total-yes"></span>
              </div>
          </div>
          <div className="col-span-4">
<div className="box-total-sales h-full">
                <OrderIcon /> 
                <h2 className="numbers-sale text-gray-900">{salesData.totalNoOfTransactions}</h2>
                <p className="total-sale-text">Total Transactions</p>
                {isTeamView && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Individual: {salesData.memberTotalNoOfTransactions || 0}</span>
                    <span>Team: {Math.round((salesData.totalNoOfTransactions || 0) - (salesData.memberTotalNoOfTransactions || 0))}</span>
                  </div>
                )}
                <span className="total-yes"></span>
              </div>
          </div>
          <div className="col-span-4">
<div className="box-total-sales h-full">
                <DiscIcon />
                <h2 className="numbers-sale text-gray-900">{salesData.noOfPayments}</h2>
                <p className="total-sale-text">Total Payments</p>
                {isTeamView && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Individual: {salesData.memberNoOfPayments || 0}</span>
                    <span>Team: {Math.round((salesData.noOfPayments || 0) - (salesData.memberNoOfPayments || 0))}</span>
                  </div>
                )}
                <span className="total-yes"></span>
              </div>
          </div>
          <div className="col-span-4">
<div className="box-total-sales h-full">
                <NewCustomerIcon />
                <h2 className="numbers-sale text-gray-900">{salesData.totalUsers}</h2>
                <p className="total-sale-text">Total Users</p>
                {isTeamView && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Individual: {salesData.memberTotalUsers || 0}</span>
                    <span>
                      Team: {Math.round((salesData.totalUsers || 0) - (salesData.memberTotalUsers || 0))}
                    </span>
                  </div>
                )}
                <span className="total-yes"></span>
                {/* <div className="justify-between flex items-center">
                              <span className="total-yes ">Active user : {salesData.activeUsers}</span><span className="total-yes ">Inactive user : {salesData.inactiveUsers} </span>
                </div>               */}
              </div>
          </div>
          <div className="col-span-4">
<div className="box-total-sales h-full">
                <SalesIcon />
                <h2 className="numbers-sale text-gray-900">{formatCurrency(salesData.assetsUnderManagement)}</h2>
                <p className="total-sale-text">Asset Under Advisory</p>
                {isTeamView && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Individual: {formatCurrency(salesData.memberAssetsUnderManagement || 0)}</span>
                   <span>Team: {formatCurrency(Math.max(0, salesData.assetsUnderManagement - (salesData.memberAssetsUnderManagement || 0)))}</span>
                    </div>
                )}
                <span className="total-yes"></span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaySale;