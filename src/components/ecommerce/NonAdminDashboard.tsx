"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import { SalesIcon, SalesIconOrange, SalesIconViolet, SalesIconGreen } from "@/icons";
import InvestmentTrendsChart from "./InvestmentTrendsChart";
import SalesByPackageChart from "./SalesByPackageChart";
import TopGoalsMf from "./TopGoalsMf";
import RecentOrdersMf from "./RecentOrdersMf";
import SalesByGoalChart from "./SalesByGoalChart";
import TopPackagesMf from "./TopPackagesMf";
import DashboardSkeleton from "@/components/common/DashboardSkeleton";
import DashboardLoadError from "@/components/common/DashboardLoadError";

interface AumSipNest {
  totalCount: number;
  activeCount: number;
  cancelledCount: number;
  inactiveCount: number;
  completedCount: number;
  inProgressCount: number;
  pausedCount: number;
  otherCount: number;
  grossInvestment: number;
  redemptions: number;
  netInflow: number;
}

interface AumLumpsumNest {
  transactionCount: number;
  grossInvestment: number;
  redemptions: number;
  netInflow: number;
}

interface AumUnclassifiedNest {
  transactionCount: number;
  grossInvestment: number;
  redemptions: number;
  netInflow: number;
}

interface AumSummaryBucket {
  grossInvestment: number;
  netInflow: number;
  redemptions: number;
  sip: AumSipNest;
  lumpsum: AumLumpsumNest;
  unclassified: AumUnclassifiedNest;
}

interface AumSummaryData {
  totalAum: AumSummaryBucket;
  inAppAum: AumSummaryBucket;
  migratedAum: AumSummaryBucket;
  externalAum: AumSummaryBucket;
}

const emptyAumSipNest = (): AumSipNest => ({
  totalCount: 0,
  activeCount: 0,
  cancelledCount: 0,
  inactiveCount: 0,
  completedCount: 0,
  inProgressCount: 0,
  pausedCount: 0,
  otherCount: 0,
  grossInvestment: 0,
  redemptions: 0,
  netInflow: 0,
});

const emptyAumLumpsumNest = (): AumLumpsumNest => ({
  transactionCount: 0,
  grossInvestment: 0,
  redemptions: 0,
  netInflow: 0,
});

const emptyAumUnclassifiedNest = (): AumUnclassifiedNest => ({
  transactionCount: 0,
  grossInvestment: 0,
  redemptions: 0,
  netInflow: 0,
});

const emptyAumBucket = (): AumSummaryBucket => ({
  grossInvestment: 0,
  netInflow: 0,
  redemptions: 0,
  sip: emptyAumSipNest(),
  lumpsum: emptyAumLumpsumNest(),
  unclassified: emptyAumUnclassifiedNest(),
});

const emptyAumSummary = (): AumSummaryData => ({
  totalAum: emptyAumBucket(),
  inAppAum: emptyAumBucket(),
  migratedAum: emptyAumBucket(),
  externalAum: emptyAumBucket(),
});

const normalizeAumBucket = (
  bucket?: Partial<AumSummaryBucket> | null,
): AumSummaryBucket => {
  const base = emptyAumBucket();
  if (!bucket) return base;
  return {
    grossInvestment: bucket.grossInvestment ?? 0,
    netInflow: bucket.netInflow ?? 0,
    redemptions: bucket.redemptions ?? 0,
    sip: { ...base.sip, ...(bucket.sip ?? {}) },
    lumpsum: { ...base.lumpsum, ...(bucket.lumpsum ?? {}) },
    unclassified: { ...base.unclassified, ...(bucket.unclassified ?? {}) },
  };
};

const NonAdminDashboard = () => {
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, appType } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  React.useEffect(() => {
    // console.log('[DEBUG NonAdminDashboard] ===== MOUNT/UPDATE =====');
    // console.log('[DEBUG NonAdminDashboard] userAppTypeLock:', userAppTypeLock);
    // console.log('[DEBUG NonAdminDashboard] selectedType:', selectedType);
    // console.log('[DEBUG NonAdminDashboard] effectiveType:', effectiveType);
    // console.log('[DEBUG NonAdminDashboard] appType (global):', appType);
    // console.log('[DEBUG NonAdminDashboard] localStorage appType:', localStorage.getItem('appType'));
    // console.log('[DEBUG NonAdminDashboard] localStorage userAppTypeLock:', localStorage.getItem('userAppTypeLock'));
  }, [userAppTypeLock, selectedType, effectiveType, appType]);

  const [aumSummaryLoading, setAumSummaryLoading] = useState(true);
  const [aumSummaryError, setAumSummaryError] = useState<Error | null>(null);
  const [aumSummaryRetry, setAumSummaryRetry] = useState(0);
  const [aumSummary, setAumSummary] = useState<AumSummaryData>(emptyAumSummary);

  // Investment Overview (aum-summary-mf): total / in-app / migrated / external flows
  useEffect(() => {
    const controller = new AbortController();
    setAumSummaryLoading(true);
    setAumSummaryError(null);
    setAumSummary(emptyAumSummary());

    const fetchAumSummary = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        setAumSummaryError(new Error("Auth token not found"));
        setAumSummaryLoading(false);
        return;
      }

      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/aum-summary-mf?`;

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
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch investment overview");
        }

        const data: AumSummaryData = await response.json();
        setAumSummary({
          totalAum: normalizeAumBucket(data.totalAum),
          inAppAum: normalizeAumBucket(data.inAppAum),
          migratedAum: normalizeAumBucket(data.migratedAum),
          externalAum: normalizeAumBucket(data.externalAum),
        });
        setAumSummaryError(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setAumSummaryError(
          error instanceof Error ? error : new Error(String(error)),
        );
      } finally {
        if (!controller.signal.aborted) {
          setAumSummaryLoading(false);
        }
      }
    };

    fetchAumSummary();

    return () => controller.abort();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, aumSummaryRetry]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-IN").format(value);
  };

  const investmentOverviewCards: Array<{
    key: keyof AumSummaryData;
    title: string;
    icon: React.ReactNode;
  }> = [
    { key: "totalAum", title: "Total AUM", icon: <SalesIcon /> },
    { key: "inAppAum", title: "In-App AUM", icon: <SalesIconOrange /> },
    { key: "migratedAum", title: "Migrated AUM", icon: <SalesIconGreen /> },
    { key: "externalAum", title: "External AUM", icon: <SalesIconViolet /> },
  ];

  const sipActivityCards: Array<{
    key: string;
    title: string;
    icon: React.ReactNode;
    cardClass: string;
    data: AumSipNest;
  }> = [
    {
      key: "total-sip",
      title: "Total SIP",
      icon: <SalesIcon />,
      cardClass: "bg-[#FA5A7D]/10 border-[#FA5A7D]/20 dark:bg-[#FA5A7D]/15 dark:border-[#FA5A7D]/25",
      data: aumSummary.totalAum.sip,
    },
    {
      key: "in-app-sip",
      title: "In-App SIP",
      icon: <SalesIconOrange />,
      cardClass: "bg-[#ff947a]/10 border-[#ff947a]/20 dark:bg-[#ff947a]/15 dark:border-[#ff947a]/25",
      data: aumSummary.inAppAum.sip,
    },
    {
      key: "migrated-sip",
      title: "Migrated SIP",
      icon: <SalesIconGreen />,
      cardClass: "bg-[#3cd856]/10 border-[#3cd856]/20 dark:bg-[#3cd856]/15 dark:border-[#3cd856]/25",
      data: aumSummary.migratedAum.sip,
    },
    {
      key: "external-sip",
      title: "External SIP",
      icon: <SalesIconViolet />,
      cardClass: "bg-[#bf83ff]/10 border-[#bf83ff]/20 dark:bg-[#bf83ff]/15 dark:border-[#bf83ff]/25",
      data: aumSummary.externalAum.sip,
    },
  ];

  const inAppLumpsum = aumSummary.inAppAum.lumpsum;
  const migratedLumpsum = aumSummary.migratedAum.unclassified;
  const externalLumpsum = aumSummary.externalAum.unclassified;

  const totalLumpsumFromParts = {
    transactionCount:
      inAppLumpsum.transactionCount +
      migratedLumpsum.transactionCount +
      externalLumpsum.transactionCount,
    grossInvestment:
      inAppLumpsum.grossInvestment +
      migratedLumpsum.grossInvestment +
      externalLumpsum.grossInvestment,
    redemptions:
      inAppLumpsum.redemptions +
      migratedLumpsum.redemptions +
      externalLumpsum.redemptions,
    netInflow:
      inAppLumpsum.netInflow +
      migratedLumpsum.netInflow +
      externalLumpsum.netInflow,
  };

  const lumpsumActivityCards: Array<{
    key: string;
    title: string;
    icon: React.ReactNode;
    cardClass: string;
    data: AumLumpsumNest | AumUnclassifiedNest;
  }> = [
    {
      key: "total-lumpsum",
      title: "Total Lumpsum",
      icon: <SalesIcon />,
      cardClass: "bg-[#FA5A7D]/10 border-[#FA5A7D]/20 dark:bg-[#FA5A7D]/15 dark:border-[#FA5A7D]/25",
      data: totalLumpsumFromParts,
    },
    {
      key: "in-app-lumpsum",
      title: "In-App Lumpsum",
      icon: <SalesIconOrange />,
      cardClass: "bg-[#ff947a]/10 border-[#ff947a]/20 dark:bg-[#ff947a]/15 dark:border-[#ff947a]/25",
      data: inAppLumpsum,
    },
    {
      key: "migrated-lumpsum",
      title: "Migrated Lumpsum",
      icon: <SalesIconGreen />,
      cardClass: "bg-[#3cd856]/10 border-[#3cd856]/20 dark:bg-[#3cd856]/15 dark:border-[#3cd856]/25",
      data: migratedLumpsum,
    },
    {
      key: "external-lumpsum",
      title: "External Lumpsum",
      icon: <SalesIconViolet />,
      cardClass: "bg-[#bf83ff]/10 border-[#bf83ff]/20 dark:bg-[#bf83ff]/15 dark:border-[#bf83ff]/25",
      data: externalLumpsum,
    },
  ];

  const renderMoneyMetrics = (
    grossInvestment: number,
    redemptions: number,
    netInflow: number,
  ) => (
    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Net Inflow
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
          {formatCurrency(netInflow)}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Gross Investment
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
          {formatCurrency(grossInvestment)}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Redemptions
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
          {formatCurrency(redemptions)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 w-full max-w-full">
      {/* Investment Overview: total / in-app / migrated / external net inflow */}
      <div className="col-span-12">
        {aumSummaryLoading ? (
          <DashboardSkeleton variant="cards" count={4} />
        ) : aumSummaryError ? (
          <DashboardLoadError
            message={aumSummaryError.message || "Failed to load investment overview"}
            onRetry={() => setAumSummaryRetry((c) => c + 1)}
          />
        ) : (
          <div className="grid">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Investment Overview
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Net inflow by source for the selected period, with gross investments and redemptions
                  </span>
                </div>
              </div>

              <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
                {investmentOverviewCards.map((card) => {
                  const bucket = aumSummary[card.key];
                  return (
                    <div key={card.key} className="col-span-4">
                      <div className="box-total-sales h-full">
                        {card.icon}
                        <h2 className="numbers-sale text-gray-900">
                          {formatCurrency(bucket.netInflow)}
                        </h2>
                        <p className="total-sale-text">{card.title}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-white/70 p-2 dark:bg-white/10">
                          <div className="min-w-0 text-center">
                            <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                              Gross
                            </p>
                            <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(bucket.grossInvestment)}
                            </p>
                          </div>
                          <div className="min-w-0 text-center">
                            <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                              Redemptions
                            </p>
                            <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(bucket.redemptions)}
                            </p>
                          </div>
                        </div>
                        <span className="total-yes"></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: SIP Activity */}
      <div className="col-span-12">
        {aumSummaryLoading ? (
          <DashboardSkeleton variant="cards" count={4} />
        ) : aumSummaryError ? (
          <DashboardLoadError
            message={aumSummaryError.message || "Failed to load SIP activity"}
            onRetry={() => setAumSummaryRetry((c) => c + 1)}
          />
        ) : (
          <div className="grid">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    SIP Activity
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    SIP counts and investment flows by source for the selected period.
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {sipActivityCards.map((card) => (
                  <div
                    key={card.key}
                    className={`rounded-lg border p-6 shadow-sm transition-all hover:shadow-lg ${card.cardClass}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-transparent">
                          {card.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {card.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Total SIP Count
                          </p>
                        </div>
                      </div>
                      <p className="shrink-0 text-xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(card.data.totalCount)}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="min-w-0 rounded-lg bg-gray-50 p-2 dark:bg-white/10">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Active
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {formatNumber(card.data.activeCount)}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-lg bg-gray-50 p-2 dark:bg-white/10">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Cancelled
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {formatNumber(card.data.cancelledCount)}
                        </p>
                      </div>
                    </div>

                    {renderMoneyMetrics(
                      card.data.grossInvestment,
                      card.data.redemptions,
                      card.data.netInflow,
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Lumpsum Activity */}
      <div className="col-span-12">
        {aumSummaryLoading ? (
          <DashboardSkeleton variant="cards" count={4} />
        ) : aumSummaryError ? (
          <DashboardLoadError
            message={aumSummaryError.message || "Failed to load lumpsum activity"}
            onRetry={() => setAumSummaryRetry((c) => c + 1)}
          />
        ) : (
          <div className="grid">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Lumpsum Activity
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Lumpsum transaction counts and investment flows by source for the selected period.
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {lumpsumActivityCards.map((card) => (
                  <div
                    key={card.key}
                    className={`rounded-lg border p-6 shadow-sm transition-all hover:shadow-lg ${card.cardClass}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-transparent">
                          {card.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {card.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Total Transactions
                          </p>
                        </div>
                      </div>
                      <p className="shrink-0 text-xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(card.data.transactionCount)}
                      </p>
                    </div>

                    {renderMoneyMetrics(
                      card.data.grossInvestment,
                      card.data.redemptions,
                      card.data.netInflow,
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Investment Trends, Sales by Package, Sales by Goal */}
      <div className="col-span-12 grid grid-cols-12 gap-4 md:gap-6 xl:items-stretch">
        {/* Investment Trends Chart */}
        <div className="col-span-12 xl:col-span-4 xl:h-full">
          <InvestmentTrendsChart />
        </div>

        {/* Sales by Package */}
        <div className="col-span-12 xl:col-span-4 xl:h-full">
          <SalesByPackageChart />
        </div>

        {/* Sales by Goal */}
        <div className="col-span-12 xl:col-span-4 xl:h-full">
          <SalesByGoalChart />
        </div>
      </div>

      {/* Row 4: Sales by Goal, Recent Activity, Top Services */}
      <div className="col-span-12 grid grid-cols-12 gap-4 md:gap-6">
        {/* Sales by Package */}
        <div className="col-span-12 xl:col-span-4">
          <div className="xl:h-96 overflow-y-auto">
            <TopPackagesMf />
          </div>
        </div>

        {/* Sales by Goal */}
        <div className="col-span-12 xl:col-span-4">
          <div className="xl:h-96 overflow-y-auto">
            <TopGoalsMf />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 xl:col-span-4">
          <div className="xl:h-96 overflow-y-auto">
            <RecentOrdersMf />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonAdminDashboard;
