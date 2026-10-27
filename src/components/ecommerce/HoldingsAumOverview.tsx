"use client";

import React from "react";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import { pickModelMetric } from "@/context/investmentModel";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";
import {
  SalesIcon,
  SalesIconOrange,
  SalesIconGreen,
  SalesIconViolet,
} from "@/icons";

interface CardData {
  type: string;
  assetsUnderManagement?: number;
  assetsUnderManagementRia?: number;
  assetsUnderManagementArn?: number;
  invested?: number;
  investedRia?: number;
  investedArn?: number;
  netInflow?: number;
  netInflowRia?: number;
  netInflowArn?: number;
  redemptions?: number;
  redemptionsRia?: number;
  redemptionsArn?: number;
  returns?: number;
  returnsRia?: number;
  returnsArn?: number;
}

interface HoldingsMetrics {
  aum: number;
  aumRia: number;
  aumArn: number;
  invested: number;
  investedRia: number;
  investedArn: number;
  netInflow: number;
  netInflowRia: number;
  netInflowArn: number;
  redemptions: number;
  redemptionsRia: number;
  redemptionsArn: number;
  returns: number;
  returnsRia: number;
  returnsArn: number;
}

const emptyMetrics = (): HoldingsMetrics => ({
  aum: 0,
  aumRia: 0,
  aumArn: 0,
  invested: 0,
  investedRia: 0,
  investedArn: 0,
  netInflow: 0,
  netInflowRia: 0,
  netInflowArn: 0,
  redemptions: 0,
  redemptionsRia: 0,
  redemptionsArn: 0,
  returns: 0,
  returnsRia: 0,
  returnsArn: 0,
});

const transformHoldingsCards = (data: CardData[]): HoldingsMetrics => {
  const aum = data.find((item) => item.type === "Assets under Management");
  const invested = data.find((item) => item.type === "Invested");
  const netInflow = data.find((item) => item.type === "Net Inflow");
  const redemptions = data.find((item) => item.type === "Redemptions");
  const returns = data.find((item) => item.type === "Returns (%)");

  return {
    aum: aum?.assetsUnderManagement ?? 0,
    aumRia: aum?.assetsUnderManagementRia ?? 0,
    aumArn: aum?.assetsUnderManagementArn ?? 0,
    invested: invested?.invested ?? 0,
    investedRia: invested?.investedRia ?? 0,
    investedArn: invested?.investedArn ?? 0,
    netInflow: netInflow?.netInflow ?? 0,
    netInflowRia: netInflow?.netInflowRia ?? 0,
    netInflowArn: netInflow?.netInflowArn ?? 0,
    redemptions: redemptions?.redemptions ?? 0,
    redemptionsRia: redemptions?.redemptionsRia ?? 0,
    redemptionsArn: redemptions?.redemptionsArn ?? 0,
    returns: returns?.returns ?? 0,
    returnsRia: returns?.returnsRia ?? 0,
    returnsArn: returns?.returnsArn ?? 0,
  };
};

const HoldingsAumOverview = () => {
  const {
    selectedOption,
    customDates,
    selectedEmployee,
    selectedTeamMember,
    selectedType,
    hierarchyViewMode,
    userAppTypeLock,
    investmentModelFilter,
  } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const { data, loading } = useFilteredFetch(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");
      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/cards-data-mf-holdings?`;

      if (selectedOption === "custom") {
        url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
      } else {
        url += `timeframe=${selectedOption || "monthly"}`;
      }

      const employeeId = selectedTeamMember || selectedEmployee;
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      if (selectedType && selectedType.length > 0) {
        url += `&type=${selectedTeamMember ? hierarchyViewMode : effectiveType}`;
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        signal,
      });

      if (response.status === 401) {
        Cookies.remove("authToken");
        window.location.href = "/signin";
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const cards: CardData[] = await response.json();
      return transformHoldingsCards(cards);
    },
    [
      selectedOption,
      customDates,
      selectedEmployee,
      selectedTeamMember,
      selectedType,
      hierarchyViewMode,
      userAppTypeLock,
    ]
  );

  const metrics = data || emptyMetrics();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-IN").format(value);

  const metric = (
    combined: number,
    ria: number,
    arn: number,
    kind: "amount" | "rate" = "amount"
  ) => pickModelMetric(investmentModelFilter, combined, ria, arn, kind);

  const displayAum = metric(metrics.aum, metrics.aumRia, metrics.aumArn);
  const displayInvested = metric(
    metrics.invested,
    metrics.investedRia,
    metrics.investedArn
  );
  const displayReturns = metric(
    metrics.returns,
    metrics.returnsRia,
    metrics.returnsArn,
    "rate"
  );
  const displayNetInflow = metric(
    metrics.netInflow,
    metrics.netInflowRia,
    metrics.netInflowArn
  );
  const displayRedemptions = metric(
    metrics.redemptions,
    metrics.redemptionsRia,
    metrics.redemptionsArn
  );

  const renderMetricBreakdown = (
    arn: number,
    ria: number,
    formatValue: (value: number) => string
  ) =>
    investmentModelFilter !== "ALL" ? null : (
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-white/70 p-2 dark:bg-white/10">
        <div className="min-w-0 text-center">
          <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            ARN
          </p>
          <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
            {formatValue(arn)}
          </p>
        </div>
        <div className="min-w-0 text-center">
          <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            RIA
          </p>
          <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
            {formatValue(ria)}
          </p>
        </div>
      </div>
    );

  if (loading) {
    return <p>Loading holdings AUM data...</p>;
  }

  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Holdings AUM Overview
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Holdings-based AUM, invested cost basis, net inflow, and redemptions
              as of the selected period
            </span>
          </div>
        </div>

        <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconOrange />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(displayAum)}
              </h2>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="total-sale-text" style={{ margin: 0 }}>
                  Total AUM
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: "#000000", margin: 0, lineHeight: "24px" }}
                >
                  <span style={{ color: "#000000" }}>Invested: </span>
                  <span className="text-green-600">
                    {formatCurrency(displayInvested)}
                  </span>
                  {" | "}
                  <span style={{ color: "#000000" }}>Returns: </span>
                  <span
                    className={
                      displayReturns >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {displayReturns?.toFixed(2)}%
                  </span>
                </p>
              </div>
              {renderMetricBreakdown(
                metrics.aumArn,
                metrics.aumRia,
                formatCurrency
              )}
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(displayInvested)}
              </h2>
              <p className="total-sale-text">Invested</p>
              {renderMetricBreakdown(
                metrics.investedArn,
                metrics.investedRia,
                formatCurrency
              )}
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconGreen />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(displayNetInflow)}
              </h2>
              <p className="total-sale-text">Net Inflow</p>
              {renderMetricBreakdown(
                metrics.netInflowArn,
                metrics.netInflowRia,
                formatCurrency
              )}
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconViolet />
              <h2 className="numbers-sale text-gray-900">
                {formatNumber(displayRedemptions)}
              </h2>
              <p className="total-sale-text">Redemptions</p>
              {renderMetricBreakdown(
                metrics.redemptionsArn,
                metrics.redemptionsRia,
                formatNumber
              )}
              <span className="total-yes"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoldingsAumOverview;
