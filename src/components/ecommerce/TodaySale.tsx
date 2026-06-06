"use client";
import React from "react";
import { SalesIcon, OrderIcon, DiscIcon, NewCustomerIcon } from "@/icons";
import { useGlobalContext } from "@/context/GlobalState";

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

const TodaySale = ({ data, loading }: { data: DataProps | null; loading: boolean }) => {
  const { selectedType } = useGlobalContext();

  if (loading) {
    return <p>Loading sales data...</p>;
  }

  if (!data) {
    return <p>No sales data available.</p>;
  }
  
  
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
                <h2 className="numbers-sale text-gray-900">{data.totalRevenue}</h2>
                <p className="total-sale-text">Total Revenue</p>
                {isTeamView && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Individual: {data.memberTotalRevenue || 0}</span>
                    <span>Team: {formatNumber((data.totalRevenue || 0) - (data.memberTotalRevenue || 0))}</span>
                  </div>
                )}
                <span className="total-yes"></span>
              </div>
          </div>
          <div className="col-span-4">
<div className="box-total-sales h-full">
                <OrderIcon /> 
                <h2 className="numbers-sale text-gray-900">{data.totalNoOfTransactions}</h2>
                <p className="total-sale-text">Total Transactions</p>
                {isTeamView && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Individual: {data.memberTotalNoOfTransactions || 0}</span>
                    <span>Team: {Math.round((data.totalNoOfTransactions || 0) - (data.memberTotalNoOfTransactions || 0))}</span>
                  </div>
                )}
                <span className="total-yes"></span>
              </div>
          </div>
          <div className="col-span-4">
<div className="box-total-sales h-full">
                <DiscIcon />
                <h2 className="numbers-sale text-gray-900">{data.noOfPayments}</h2>
                <p className="total-sale-text">Total Payments</p>
                {isTeamView && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Individual: {data.memberNoOfPayments || 0}</span>
                    <span>Team: {Math.round((data.noOfPayments || 0) - (data.memberNoOfPayments || 0))}</span>
                  </div>
                )}
                <span className="total-yes"></span>
              </div>
          </div>
          <div className="col-span-4">
<div className="box-total-sales h-full">
                <NewCustomerIcon />
                <h2 className="numbers-sale text-gray-900">{data.totalUsers}</h2>
                <p className="total-sale-text">Total Users</p>
                {isTeamView && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Individual: {data.memberTotalUsers || 0}</span>
                    <span>
                      Team: {Math.round((data.totalUsers || 0) - (data.memberTotalUsers || 0))}
                    </span>
                  </div>
                )}
                <span className="total-yes"></span>
                {/* <div className="justify-between flex items-center">
                              <span className="total-yes ">Active user : {data.activeUsers}</span><span className="total-yes ">Inactive user : {data.inactiveUsers} </span>
                </div>               */}
              </div>
          </div>
          <div className="col-span-4">
<div className="box-total-sales h-full">
                <SalesIcon />
                <h2 className="numbers-sale text-gray-900">{formatCurrency(data.assetsUnderManagement)}</h2>
                <p className="total-sale-text">Asset Under Advisory</p>
                {isTeamView && (
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Individual: {formatCurrency(data.memberAssetsUnderManagement || 0)}</span>
                   <span>Team: {formatCurrency(Math.max(0, data.assetsUnderManagement - (data.memberAssetsUnderManagement || 0)))}</span>
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