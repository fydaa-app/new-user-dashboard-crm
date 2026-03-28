"use client";
import React from "react";
import { SalesIcon, SalesIconOrange, SalesIconGreen, SalesIconViolet } from "@/icons";

interface RevenueCardsProps {
  revenue: number;
  aum: number;
  totalRevenue: number;
  totalAum: number;
  targetPercentage: number | null;
  monthlyTargetPercentage: number | null;
  timeframe: string;
  customDates?: { start: string; end: string };
  loading?: boolean;
}

const RevenueCards = ({
  revenue,
  aum,
  totalRevenue,
  totalAum,
  targetPercentage,
  monthlyTargetPercentage,
  timeframe,
  customDates,
  loading,
}: RevenueCardsProps) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">Loading revenue data...</p>
      </div>
    );
  }

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

  const isMonthly = timeframe === "monthly";
  const displayTarget = isMonthly && monthlyTargetPercentage !== null 
    ? monthlyTargetPercentage 
    : targetPercentage;

  const getTimeframeLabel = (): string => {
    if (timeframe === "custom" && customDates?.start && customDates?.end) {
      const start = new Date(customDates.start).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const end = new Date(customDates.end).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      return `${start} - ${end}`;
    }
    return timeframe.charAt(0).toUpperCase() + timeframe.slice(1);
  };

  const getIncentiveTier = (): { name: string; color: string } => {
    if (displayTarget === null) return { name: "Bronze", color: "#CD7F32" };
    if (displayTarget >= 100) return { name: "Platinum", color: "#E5E4E2" };
    if (displayTarget >= 75) return { name: "Gold", color: "#FFD700" };
    if (displayTarget >= 50) return { name: "Silver", color: "#C0C0C0" };
    return { name: "Bronze", color: "#CD7F32" };
  };

  const tier = getIncentiveTier();
  const timeframeLabel = getTimeframeLabel();

  const getTierGradient = (tierName: string): string => {
    switch (tierName) {
      case "Platinum":
        return "linear-gradient(135deg, #E5E4E2 0%, #B0B0B0 50%, #E5E4E2 100%)";
      case "Gold":
        return "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)";
      case "Silver":
        return "linear-gradient(135deg, #C0C0C0 0%, #808080 50%, #C0C0C0 100%)";
      case "Bronze":
      default:
        return "linear-gradient(135deg, #CD7F32 0%, #8B4513 50%, #CD7F32 100%)";
    }
  };

  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Revenue Summary
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Monitor Revenue & AUM Metrics
            </span>
          </div>
        </div>

        <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(totalRevenue)}
              </h2>
              <p className="total-sale-text">Total Revenue</p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconOrange />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(totalAum)}
              </h2>
              <p className="total-sale-text">Total AUM</p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconGreen />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(revenue)}
              </h2>
              <p className="total-sale-text">{timeframeLabel} Revenue</p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIconViolet />
              <h2 className="numbers-sale text-gray-900">
                {formatCurrency(aum)}
              </h2>
              <p className="total-sale-text">{timeframeLabel} AUM</p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div className="box-total-sales h-full">
              <SalesIcon />
              <h2 className="numbers-sale text-gray-900">
                {displayTarget !== null ? `${displayTarget.toFixed(2)}%` : 'N/A'}
              </h2>
              <p className="total-sale-text">Target %</p>
              <span className="total-yes"></span>
            </div>
          </div>

          <div className="col-span-4">
            <div 
              style={{ 
                height: '100%', 
                minHeight: '100px', 
                borderRadius: '16px', 
                background: getTierGradient(tier.name), 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="36" r="24" fill="#00000020" stroke="#00000040" strokeWidth="2"/>
                <path d="M32 12L36 22H48L39 28L43 38L32 32L21 38L25 28L16 22H28L32 12Z" fill="#00000060" stroke="#00000080" strokeWidth="1.5" strokeLinejoin="round"/>
                <rect x="24" y="40" width="16" height="18" rx="2" fill="#00000030" stroke="#00000050" strokeWidth="1.5"/>
                <circle cx="32" cy="49" r="4" fill="#00000050"/>
              </svg>
              <h2 className="numbers-sale" style={{ color: '#1a1a1a', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
                {tier.name}
              </h2>
              <p className="total-sale-text" style={{ color: '#333', fontWeight: 600 }}>Incentive Tier</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueCards;
