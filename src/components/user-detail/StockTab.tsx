"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { formatCurrency } from "./utils";
import { StockOrder, PortfolioDetails, MutualFundDetails, UserDetails } from "./types";

interface StockTabProps {
  userDetails: UserDetails;
  stockOrders: StockOrder[];
  portfolioDetails: PortfolioDetails[];
  mutualFundDetails?: MutualFundDetails[];
}

export default function StockTab({
  userDetails,
  stockOrders,
  portfolioDetails,
  mutualFundDetails,
}: StockTabProps) {
  const isFydaa = userDetails.fromApp?.toLowerCase() === "fydaa";
  const isSavestment = userDetails.fromApp?.toLowerCase() === "savestment";

  return (
    <>
      {/* Fydaa Users - Mutual Fund Holdings */}
      {isFydaa && mutualFundDetails && mutualFundDetails.length > 0 && (
        <div className="mb-6">
          <div className="p-4">
            <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-4">
              <h4 className="text-md font-medium dark:text-gray-400">Mutual Fund Holdings</h4>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Stock Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Ticker</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Type</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Balance Units</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Avg. Price</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Invested Value</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Current Value</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {mutualFundDetails.flatMap((mfPortfolio) =>
                    mfPortfolio.mutualFunds.map((fund) => (
                      <TableRow key={`${mfPortfolio.sipId}-${fund.stockId}`}>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {fund.stockName}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {fund.ticker}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <Badge color="info">{fund.capType}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {fund.balanceQty.toFixed(3)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          ₹{fund.averagePrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatCurrency(fund.investedValue)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatCurrency(fund.currentValue)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Savestment Users - Stock Orders */}
      {isSavestment && (
        <>
          {(stockOrders && stockOrders.length > 0) ||
          (portfolioDetails && portfolioDetails.some(pd => pd.stocks && pd.stocks.length > 0)) ? (
            <>
              {/* Stock Orders Section */}
              {stockOrders && stockOrders.length > 0 && (
                <div className="mb-6 ">
                  <div className="p-4">
                    <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-4">
                      <h4 className="text-md font-medium dark:text-gray-400">Stock Orders</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                          <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Stock</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Ticker</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Quantity</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Avg. Price</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Total Value</TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          {stockOrders
                            .slice()
                            .sort((a, b) => String(a['stock.stockName'] || '').localeCompare(String(b['stock.stockName'] || '')))
                            .map((order, index) => (
                              <TableRow key={order.stockId ?? `unknown-${index}`}>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{order['stock.stockName'] || '—'}</TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{order['stock.ticker']}</TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{order.quantityDifference}</TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(order.avgValue)}</TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(order.netValue)}</TableCell>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* Portfolio Stock Holdings */}
              {portfolioDetails && portfolioDetails.some(pd => pd.stocks && pd.stocks.length > 0) && (
                <div className="mb-6">
                  <div className="p-4">
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8a4 4 0 01-8 0V8a4 4 0 018 0zM8 20l4-4 4 4M8 4l4 4 4-4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Stock Orders Found</h3>
                <p className="text-gray-500 dark:text-gray-400">You have no stock orders in your portfolio.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* No data for either app type */}
      {!mutualFundDetails?.length && !stockOrders?.length &&
      !portfolioDetails?.some(pd => pd.stocks?.length > 0) && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Holdings Found</h3>
            <p className="text-gray-500 dark:text-gray-400">This user has no holdings in their portfolio.</p>
          </div>
        </div>
      )}
    </>
  );
}

