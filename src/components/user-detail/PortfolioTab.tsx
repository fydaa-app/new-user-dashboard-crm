"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import { formatCurrency } from "./utils";
import { PortfolioDetails, MutualFundDetails, UserDetails } from "./types";

interface PortfolioTabProps {
  userDetails: UserDetails;
  portfolioDetails: PortfolioDetails[];
  mutualFundDetails?: MutualFundDetails[];
}

export default function PortfolioTab({
  userDetails,
  portfolioDetails,
  mutualFundDetails,
}: PortfolioTabProps) {
  const isSavestment = userDetails.fromApp?.toLowerCase() === "savestment";
  const isFydaa = userDetails.fromApp?.toLowerCase() === "fydaa";

  return (
    <>
      {/* Savestment Users - Stock Portfolios */}
      {isSavestment && portfolioDetails && portfolioDetails.length > 0 &&
        portfolioDetails.map((portfolio) => (
          <div key={portfolio.portfolioId} className="p-4">
            <div className="border-b border-gray-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-semibold mb-4 dark:text-gray-400">{portfolio.portfolioName}</h3>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Invested Amount</p>
                <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.totalInvestedValue)}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.currentValue)}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Realised Profit</p>
                <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.realizedReturn)}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Unrealised Profit</p>
                <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.unrealizedReturn)}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Absolute Return</p>
                <p className="font-medium dark:text-gray-400">
                  {portfolio.totalInvestedValue > 0
                    ? (((portfolio.currentValue - portfolio.totalInvestedValue) / portfolio.totalInvestedValue) * 100).toFixed(2)
                    : "0.00"}
                  %
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
                <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.totalProfit)}</p>
              </div>
            </div>
          </div>
        ))}

      {/* Fydaa Users - Mutual Fund Portfolios */}
      {isFydaa && mutualFundDetails && mutualFundDetails.length > 0 &&
        mutualFundDetails.map((mfPortfolio, index) => (
          <div key={mfPortfolio.sipId || index} className="p-4 mb-4">
            <div className="border-b border-gray-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-semibold mb-4 dark:text-gray-400">
                {mfPortfolio.portfolioName || (mfPortfolio.goal?.[0]?.name) || `Mutual Fund Portfolio ${index + 1}`}
              </h3>
              {mfPortfolio.portfolioName && mfPortfolio.goal && mfPortfolio.goal.length > 0 && (
                <div className="mb-4">
                  <Badge color="info">{mfPortfolio.goal[0].name}</Badge>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Invested Amount</p>
                <p className="font-medium dark:text-gray-400">
                  {formatCurrency(mfPortfolio.mutualFunds.reduce((sum, fund) => sum + fund.investedValue, 0))}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                <p className="font-medium dark:text-gray-400">{formatCurrency(mfPortfolio.currentValue)}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Realised Return</p>
                <p className={`font-medium ${mfPortfolio.realizedReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(mfPortfolio.realizedReturn)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Unrealised Return</p>
                <p className={`font-medium ${mfPortfolio.unrealizedReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(mfPortfolio.unrealizedReturn)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Absolute Return</p>
                <p className="font-medium dark:text-gray-400">
                  {mfPortfolio.mutualFunds.reduce((sum, fund) => sum + fund.investedValue, 0) > 0
                    ? (((mfPortfolio.currentValue - mfPortfolio.mutualFunds.reduce((sum, fund) => sum + fund.investedValue, 0)) /
                        mfPortfolio.mutualFunds.reduce((sum, fund) => sum + fund.investedValue, 0)) * 100).toFixed(2)
                    : "0.00"}
                  %
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
                <p className={`font-medium ${mfPortfolio.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(mfPortfolio.totalProfit)}
                </p>
              </div>
            </div>

            {/* SIP Details if available */}
            {mfPortfolio.sip && mfPortfolio.sip.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">SIP Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">SIP Amount: </span>
                    <span className="font-medium dark:text-gray-300">{formatCurrency(mfPortfolio.sip[0].sipAmount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Goal Amount: </span>
                    <span className="font-medium dark:text-gray-300">{formatCurrency(mfPortfolio.sip[0].goalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status: </span>
                    <Badge color={mfPortfolio.sip[0].status === "ACTIVE" ? "success" : "warning"}>
                      {mfPortfolio.sip[0].status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tenure: </span>
                    <span className="font-medium dark:text-gray-300">{mfPortfolio.sip[0].sipTenure} months</span>
                  </div>
                  
                  {/* ✅ Next Installment Date */}
                  {mfPortfolio.sip[0].next_installment_date && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Next Due Date: </span>
                      <span className="font-medium dark:text-gray-300">
                        {new Date(mfPortfolio.sip[0].next_installment_date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  
                  {/* ✅ Remaining Installments (bonus info) */}
                  {mfPortfolio.sip[0].remaining_installments !== undefined && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Remaining: </span>
                      <span className="font-medium dark:text-gray-300">
                        {mfPortfolio.sip[0].remaining_installments} installments
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

      {/* No Portfolio Data */}
      {(!portfolioDetails || portfolioDetails.length === 0) &&
        (!mutualFundDetails || mutualFundDetails.length === 0) && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Portfolio Found</h3>
              <p className="text-gray-500 dark:text-gray-400">This user has no portfolio data available.</p>
            </div>
          </div>
        )}
    </>
  );
}

