"use client";
import React from "react";
import {ExportIcon ,SalesIcon,OrderIcon,DiscIcon,NewCustomerIcon} from "@/icons";

export const TodaySale = () => {
  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Today’s Sales
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Sales Summery
                </span>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                <ExportIcon /> Export
            </button>
        </div>

        <div className="flex items-end justify-between mt-5 sales-box-row">
            
           <div className="col-span-4">
            <div className="box-total-sales">
              <SalesIcon />
              <h2 className="numbers-sale">$1k</h2>
              <p className="total-sale-text">Total Sales</p>
              <span className="total-yes">+8% from yesterday</span>
            </div>
           </div>
           <div className="col-span-4">
            <div className="box-total-sales">
              <OrderIcon />
              <h2 className="numbers-sale">300</h2>
              <p className="total-sale-text">Total Order</p>
              <span className="total-yes">+5% from yesterday</span>
            </div>
           </div>
           <div className="col-span-4">
            <div className="box-total-sales">
              <DiscIcon />
              <h2 className="numbers-sale">5</h2>
              <p className="total-sale-text">Product Sold</p>
              <span className="total-yes">+1.2% from yesterday</span>
            </div>
           </div>
           <div className="col-span-4">
            <div className="box-total-sales">
              <NewCustomerIcon />
              <h2 className="numbers-sale">8</h2>
              <p className="total-sale-text">New Customers</p>
              <span className="total-yes">+0.5% from yesterday</span>
            </div>
           </div>
        </div>       
    </div> 
    </div>

  );
};
