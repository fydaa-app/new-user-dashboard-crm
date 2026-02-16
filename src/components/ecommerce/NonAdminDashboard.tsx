"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import { SalesIcon, OrderIcon, DiscIcon, NewCustomerIcon, SalesIconOrange, SalesIconGreen, SalesIconViolet } from "@/icons";
import InvestmentTrendsChart from "./InvestmentTrendsChart";
import SalesByPackageChart from "./SalesByPackageChart";
import TopGoalsMf from "./TopGoalsMf";
import RecentOrdersMf from "./RecentOrdersMf";
import TopServices from "./TopServices";

interface CardData {
  type: string;
  totalRevenue?: number;
  totalNoOfTransactions?: number;
  noOfPayments?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  totalUsers?: number;
  assetsUnderManagement?: number;
}

interface SipCardData {
  type: string;
  totalSips?: number;
  totalactivesip?: number;
  cancelledSips?: number;
  pausedSips?: number;
}

const NonAdminDashboard = () => {
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode } = useGlobalContext();
  
  const [loading, setLoading] = useState(true);
  const [aum, setAum] = useState<number>(0);
  const [existingClients, setExistingClients] = useState<number>(0);
  const [activeSips, setActiveSips] = useState<number>(0);

  // Fetch cards data for AUM and Existing Clients
  useEffect(() => {
    const fetchCardsData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        console.error("Auth token not found in cookies");
        setLoading(false);
        return;
      }

      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/cards-data-mf?`;
    
        if (selectedOption === 'custom') {
          url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `timeframe=${selectedOption || "monthly"}`;
        }
        
        const employeeId = selectedTeamMember || selectedEmployee;
        if (employeeId) {
          url += `&employeeId=${employeeId}`;
        }
        if (selectedType && selectedType.length > 0) {
          const typeValue = Array.isArray(selectedType) ? selectedType[0] : selectedType;
          url += `&type=${selectedTeamMember ? hierarchyViewMode : typeValue}`;
        }

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cards data");
        }

        const data: CardData[] = await response.json();

        // Extract AUM and Existing Clients
        const aumData = data.find((item) => item.type === "Assets under Management");
        const activeUsersData = data.find((item) => item.type === "Active Users");

        setAum(aumData?.assetsUnderManagement || 0);
        setExistingClients(activeUsersData?.activeUsers || 0);
      } catch (error) {
        console.error("Error fetching cards data:", error);
      }
    };

    fetchCardsData();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode]);

  // Fetch SIP data for Active SIPs
  useEffect(() => {
    const fetchSipData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        console.error("Auth token not found in cookies");
        setLoading(false);
        return;
      }

      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/sip-cards-data-mf?`;
    
        if (selectedOption === 'custom') {
          url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `timeframe=${selectedOption || "monthly"}`;
        }
        
        const employeeId = selectedTeamMember || selectedEmployee;
        if (employeeId) {
          url += `&employeeId=${employeeId}`;
        }
        if (selectedType && selectedType.length > 0) {
          const typeValue = Array.isArray(selectedType) ? selectedType[0] : selectedType;
          url += `&type=${selectedTeamMember ? hierarchyViewMode : typeValue}`;
        }

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch SIP data");
        }

        const data: SipCardData[] = await response.json();

        // Extract Active SIPs
        const activeSipsData = data.find((item) => item.type === "Total Active Sips");
        setActiveSips(activeSipsData?.totalactivesip || 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching SIP data:", error);
        setLoading(false);
      }
    };

    fetchSipData();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format number
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-IN").format(value);
  };

  if (loading) {
    return <p>Loading dashboard data...</p>;
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 w-full max-w-full">
      {/* Row 1: Total AUM, New Investors, Net Inflow, Redemptions */}
      <div className="col-span-12">
        <div className="grid">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Growth Overview
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Insights into asset growth and investor onboarding
                </span>
              </div>
            </div>

            <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIcon />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(aum)}</h2>
                  <p className="total-sale-text">Total AUM</p>
                  <span className="total-yes"></span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIconOrange />
                  <h2 className="numbers-sale text-gray-900">{formatNumber(1947)}</h2>
                  <p className="total-sale-text">New Investors</p>
                  <span className="total-yes"></span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIconGreen />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(1947)}</h2>
                  <p className="total-sale-text">Net Inflow</p>
                  <span className="total-yes"></span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIconViolet />
                  <h2 className="numbers-sale text-gray-900">{formatNumber(1947)}</h2>
                  <p className="total-sale-text">Redemptions</p>
                  <span className="total-yes"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Existing Clients, Active SIPs, Avg Ticket Size, Redemption Rate */}
      <div className="col-span-12">
        <div className="grid">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Client & SIP Metrics
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Monitoring SIP activity and redemption trends
                </span>
              </div>
            </div>

            <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIcon />
                  <h2 className="numbers-sale text-gray-900">{formatNumber(existingClients)}</h2>
                  <p className="total-sale-text">Existing Clients</p>
                  <span className="total-yes"></span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <OrderIcon />
                  <h2 className="numbers-sale text-gray-900">{formatNumber(activeSips)}</h2>
                  <p className="total-sale-text">Active SIPs</p>
                  <span className="total-yes"></span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <DiscIcon />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(1947)}</h2>
                  <p className="total-sale-text">Avg Ticket Size</p>
                  <span className="total-yes"></span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIconViolet />
                  <h2 className="numbers-sale text-gray-900">{1947}%</h2>
                  <p className="total-sale-text">Redemption Rate</p>
                  <span className="total-yes"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Investment Trends Chart & Sales by Package Chart */}
      <div className="col-span-12 xl:col-span-6">
        <InvestmentTrendsChart />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <SalesByPackageChart />
      </div>

      {/* Row 4: Sales by Goal, Recent Activity, Top Services */}
      <div className="col-span-12 xl:col-span-4">
        <div className="h-96 overflow-y-auto">
          <TopGoalsMf />
        </div>
      </div>
      <div className="col-span-12 xl:col-span-4">
        <div className="h-96 overflow-y-auto">
          <RecentOrdersMf />
        </div>
      </div>
      <div className="col-span-12 xl:col-span-4">
        <div className="h-96 overflow-y-auto">
          <TopServices />
        </div>
      </div>
    </div>
  );
};

export default NonAdminDashboard;
