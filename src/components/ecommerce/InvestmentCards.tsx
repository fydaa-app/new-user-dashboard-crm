"use client";
import React from "react";
import { SalesIcon, SalesIconOrange, SalesIconGreen, SalesIconViolet } from "@/icons";

interface InvestmentCardsProps {
  totalAmount: number;
  totalProcessedAmount: number;
  totalLumpsumProcessedAmount: number;
  //totalRedemptionProcessedAmount: number;
  averageXIRR: number;
  uniqueSipCount: number;
  loading?: boolean;
}

const InvestmentCards = ({  
  totalProcessedAmount,
  totalLumpsumProcessedAmount,
  //totalRedemptionProcessedAmount,
  averageXIRR,
  uniqueSipCount,
  loading 
}: InvestmentCardsProps) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">Loading investment data...</p>
      </div>
    );
  }

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full
flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Investments
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Transaction Summary
            </span>
          </div>
        </div>

        <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
          {/* Card 1: Total Amount */}
          {/* <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(totalAmount)}
              </h2>
              <p className="total-sale-text">Total Amount</p>
              <span className="total-yes"></span>
            </div>
          </div> */}
          
          {/* Card 2: Total Processed Amount */}
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(totalProcessedAmount)}
              </h2>
              <p className="total-sale-text">Total Amount</p>
              <span className="total-yes"></span>
            </div>
          </div>

          {/* Card 3: Lumpsum */}
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconOrange />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(totalLumpsumProcessedAmount)}
              </h2>
              <p className="total-sale-text">Lumpsum</p>
              <span className="total-yes"></span>
            </div>
          </div>

          {/* Card 4: Redemption */}
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconGreen />
              <h2 className="numbers-sale text-gray-900">
                {averageXIRR?.toFixed(2) || '0.00'}%
              </h2>
              <p className="total-sale-text">Average XIRR</p>
              <span className="total-yes"></span>
            </div>
          </div>

          {/* Card 5: Active SIPs */}
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconViolet />
              <h2 className="numbers-sale text-gray-900">
                {uniqueSipCount.toLocaleString('en-IN')}
              </h2>
              <p className="total-sale-text">Active SIPs</p>
              <span className="total-yes"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCards;
