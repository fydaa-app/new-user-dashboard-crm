"use client";
import React from 'react';
import { SalesIcon, SalesIconOrange, SalesIconGreen, SalesIconViolet } from "@/icons";
interface PortfolioManagementCardsProps {
  totalNetWorth: number;
  totalReturnRate: number;
  totalPortfolios: number;
  totalRepairUsers: number;
  loading?: boolean;
}
const PortfolioManagementCards: React.FC<PortfolioManagementCardsProps> = ({
  totalNetWorth,
  totalReturnRate,
  totalPortfolios,
  totalRepairUsers,
  loading = false,
}) => {
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  if (loading) {
    return (
      <div className="grid">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-500 dark:text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }
  const cards = [
    {
      title: 'Total AUM',
      value: formatCurrency(totalNetWorth),
      icon: <SalesIcon />,
    },
    {
      title: 'Average Returns %',
      value: `${totalReturnRate.toFixed(2)}%`,
      icon: <SalesIconOrange />,
    },
    {
      title: 'Portfolios',
      value: totalPortfolios.toLocaleString('en-IN'),
      icon: <SalesIconGreen />,
    },
    {
      title: 'Rebalancing Due',
      value: totalRepairUsers.toLocaleString('en-IN'),
      icon: <SalesIconViolet />,
    },
  ];
  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Portfolio Summary
            </h3>
          </div>
        </div>
        <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
          {cards.map((card, index) => (
            <div key={index} className="col-span-4">
              <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                {card.icon}
                <h2 className="numbers-sale text-gray-900">
                  {card.value}
                </h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    {card.title}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PortfolioManagementCards;