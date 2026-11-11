"use client";

import React from "react";
import { MutualFundDetails, UserDetails } from "./types";
import { formatCurrency } from "./utils";

interface ExternalHoldingsTabProps {
  userDetails: UserDetails;
  mutualFundDetails?: MutualFundDetails[];
}

export default function ExternalHoldingsTab({
  userDetails,
  mutualFundDetails,
}: ExternalHoldingsTabProps) {
  const isFydaa = userDetails.fromApp?.toLowerCase() === "fydaa";

  if (!isFydaa) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          External Holdings are only available for Fydaa users.
        </p>
      </div>
    );
  }

  const externalHoldings = mutualFundDetails
    ?.flatMap((mf) => mf.mutualFunds || [])
    .filter((fund) => fund.origin === "manual") || [];

  if (externalHoldings.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No External Holdings
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            This user has no offline/ARN holdings recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 font-medium">Scheme</th>
              <th className="pb-2 font-medium">Folio</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium text-right">Invested</th>
              <th className="pb-2 font-medium text-right">Units</th>
              <th className="pb-2 font-medium text-right">NAV</th>
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">ARN</th>
            </tr>
          </thead>
          <tbody>
            {externalHoldings.map((fund, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded"
                    >
                      Offline/ARN
                    </span>
                    <span className="font-medium">{fund.stockName}</span>
                  </div>
                </td>
                <td className="py-3 text-gray-600 dark:text-gray-400">
                  {fund.folioNumber || "-"}
                </td>
                <td className="py-3">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      fund.source === "outsideApp"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {fund.source || "purchase"}
                  </span>
                </td>
                <td className="py-3 text-right text-gray-900 dark:text-white">
                  {formatCurrency(fund.investedValue || 0)}
                </td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                  {fund.totalQty?.toFixed(4) || "-"}
                </td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                  {fund.nav ? formatCurrency(fund.nav) : "-"}
                </td>
                <td className="py-3 text-gray-600 dark:text-gray-400">
                  {fund.asOn
                    ? new Date(fund.asOn).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </td>
                <td className="py-3 text-gray-600 dark:text-gray-400">
                  {fund.arnCode || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-2">
          Important Notes
        </h4>
        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
          <li>
            External holdings are offline/ARN allotments for AMCs not covered by Finprim (e.g., SBI).
          </li>
          <li>
            Current value is calculated as remaining units × live NAV from MutualFund master data.
          </li>
          <li>
            In-app redemption is <strong>not available</strong> for these folios.
          </li>
          <li>
            Users must redeem directly through the AMC or their distributor.
          </li>
        </ul>
      </div>
    </div>
  );
}