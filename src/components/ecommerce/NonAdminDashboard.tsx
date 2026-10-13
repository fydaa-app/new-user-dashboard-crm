"use client";

import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import { pickModelMetric } from "@/context/investmentModel";
import { SalesIcon, OrderIcon, DiscIcon, SalesIconOrange, SalesIconViolet, NewCustomerRedIcon, SalesIconGreen, OrderIconGreen, OrderIconPurple } from "@/icons";
import { useRouter } from "next/navigation";
import InvestmentTrendsChart from "./InvestmentTrendsChart";
import SalesByPackageChart from "./SalesByPackageChart";
import TopGoalsMf from "./TopGoalsMf";
import RecentOrdersMf from "./RecentOrdersMf";
import SalesByGoalChart from "./SalesByGoalChart";
import TopPackagesMf from "./TopPackagesMf";


interface CardData {
  type: string;
  totalRevenue?: number;
  totalRevenueRia?: number;
  totalRevenueArn?: number;
  totalNoOfTransactions?: number;
  totalNoOfTransactionsRia?: number;
  totalNoOfTransactionsArn?: number;
  noOfPayments?: number;
  noOfPaymentsRia?: number;
  noOfPaymentsArn?: number;
  activeUsers?: number;
  activeUsersRia?: number;
  activeUsersArn?: number;
  inactiveUsers?: number;
  inactiveUsersRia?: number;
  inactiveUsersArn?: number;
  totalUsers?: number;
  totalUsersRia?: number;
  totalUsersArn?: number;
  newInvestors?: number;
  newInvestorsRia?: number;
  newInvestorsArn?: number;
  assetsUnderManagement?: number;
  assetsUnderManagementRia?: number;
  assetsUnderManagementArn?: number;
  netInflow?: number;
  netInflowRia?: number;
  netInflowArn?: number;
  redemptions?: number;
  redemptionsRia?: number;
  redemptionsArn?: number;
  redemptionRate?: number;
  redemptionRateRia?: number;
  redemptionRateArn?: number;
  averageTicketSize?: number;
  averageTicketSizeRia?: number;
  averageTicketSizeArn?: number;
  invested?: number;
  investedRia?: number;
  investedArn?: number;
  returns?: number;
  returnsRia?: number;
  returnsArn?: number;
}

interface SipCardData {
  type: string;
  totalSips?: number;
  totalactivesip?: number;
  totalactivesipRia?: number;
  totalactivesipArn?: number;
  totalinactivesip?: number;
  totalinactivesipRia?: number;
  totalinactivesipArn?: number;
  totalcompletedsip?: number;
  totalcompletedsipRia?: number;
  totalcompletedsipArn?: number;
  totalinprogresssip?: number;
  totalinprogresssipRia?: number;
  totalinprogresssipArn?: number;
  totalpartiallyexitsip?: number;
  totalpartiallyexitsipRia?: number;
  totalpartiallyexitsipArn?: number;
  totalinvestedsip?: number;
  totalinvestedsipRia?: number;
  totalinvestedsipArn?: number;
  behindgoalscount?: number;
  behindgoalscountRia?: number;
  behindgoalscountArn?: number;
  pausedSips?: number;
  totalcancelledsip?: number;
  totalcancelledsipRia?: number;
  totalcancelledsipArn?: number;
}

const NonAdminDashboard = () => {
  const router = useRouter();
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, appType, investmentModelFilter } = useGlobalContext();
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
  
  const [loading, setLoading] = useState(true);
  const activeRequestsRef = useRef(0);

  const startLoading = () => {
    activeRequestsRef.current++;
    setLoading(true);
  };

  const endLoading = () => {
    if (activeRequestsRef.current > 0) {
      activeRequestsRef.current--;
    }
    if (activeRequestsRef.current <= 0) {
      activeRequestsRef.current = 0;
      setLoading(false);
    }
  };
  const [aum, setAum] = useState<number>(0);
  const [aumRia, setAumRia] = useState<number>(0);
  const [aumArn, setAumArn] = useState<number>(0);
  const [netInflow, setNetInflow] = useState<number>(0);
  const [netInflowRia, setNetInflowRia] = useState<number>(0);
  const [netInflowArn, setNetInflowArn] = useState<number>(0);
  const [redemptions, setRedemptions] = useState<number>(0);
  const [redemptionsRia, setRedemptionsRia] = useState<number>(0);
  const [redemptionsArn, setRedemptionsArn] = useState<number>(0);
  const [newInvestors, setNewInvestors] = useState<number>(0);
  const [newInvestorsRia, setNewInvestorsRia] = useState<number>(0);
  const [newInvestorsArn, setNewInvestorsArn] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalRevenueRia, setTotalRevenueRia] = useState<number>(0);
  const [totalRevenueArn, setTotalRevenueArn] = useState<number>(0);
  const [invested, setInvested] = useState<number>(0);
  const [investedRia, setInvestedRia] = useState<number>(0);
  const [investedArn, setInvestedArn] = useState<number>(0);
  const [returns, setReturns] = useState<number>(0);
  const [returnsRia, setReturnsRia] = useState<number>(0);
  const [returnsArn, setReturnsArn] = useState<number>(0);
  // Till-date metrics (not affected by date filter)
  const [totalUsersTillDate, setTotalUsersTillDate] = useState<number>(0);
  const [totalUsersTillDateRia, setTotalUsersTillDateRia] = useState<number>(0);
  const [totalUsersTillDateArn, setTotalUsersTillDateArn] = useState<number>(0);
  const [activeSipsTillDate, setActiveSipsTillDate] = useState<number>(0);
  const [activeSipsTillDateRia, setActiveSipsTillDateRia] = useState<number>(0);
  const [activeSipsTillDateArn, setActiveSipsTillDateArn] = useState<number>(0);
  const [avgTicketSizeTillDate, setAvgTicketSizeTillDate] = useState<number>(0);
  const [avgTicketSizeTillDateRia, setAvgTicketSizeTillDateRia] = useState<number>(0);
  const [avgTicketSizeTillDateArn, setAvgTicketSizeTillDateArn] = useState<number>(0);
  const [redemptionRateTillDate, setRedemptionRateTillDate] = useState<number>(0);
  const [redemptionRateTillDateRia, setRedemptionRateTillDateRia] = useState<number>(0);
  const [redemptionRateTillDateArn, setRedemptionRateTillDateArn] = useState<number>(0);
  const [newSipsCount, setNewSipsCount] = useState<number>(0);
  const [newSipsCountRia, setNewSipsCountRia] = useState<number>(0);
  const [newSipsCountArn, setNewSipsCountArn] = useState<number>(0);
  const [cancelledSipsCount, setCancelledSipsCount] = useState<number>(0);
  const [cancelledSipsCountRia, setCancelledSipsCountRia] = useState<number>(0);
  const [cancelledSipsCountArn, setCancelledSipsCountArn] = useState<number>(0);
  const [failedSipsCount, setFailedSipsCount] = useState<number>(0);
  const [failedSipsCountRia, setFailedSipsCountRia] = useState<number>(0);
  const [failedSipsCountArn, setFailedSipsCountArn] = useState<number>(0);






  // Fetch cards data for AUM and Existing Clients
  useEffect(() => {
    const controller = new AbortController();
    startLoading();

    const fetchCardsData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        console.error("Auth token not found in cookies");
        endLoading();
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
          endLoading();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch cards data");
        }

        const data: CardData[] = await response.json();

        // Extract AUM and User data
        const aumData = data.find((item) => item.type === "Assets under Management");
        //const totalUsersData = data.find((item) => item.type === "Total Users");
        const newInvestorsData = data.find((item) => item.type === "New Investors");
        //const activeUsersData = data.find((item) => item.type === "Active Users");
        //const avgTicketSizeData = data.find((item) => item.type === "Average Ticket Size");
        const revenueData = data.find((item) => item.type === "Total Revenue");

        setTotalRevenue(revenueData?.totalRevenue ?? 0);
        setTotalRevenueRia(revenueData?.totalRevenueRia ?? 0);
        setTotalRevenueArn(revenueData?.totalRevenueArn ?? 0);
        setAum(aumData?.assetsUnderManagement ?? 0);
        setAumRia(aumData?.assetsUnderManagementRia ?? 0);
        setAumArn(aumData?.assetsUnderManagementArn ?? 0);
        setNewInvestors(newInvestorsData?.newInvestors ?? 0);
        setNewInvestorsRia(newInvestorsData?.newInvestorsRia ?? 0);
        setNewInvestorsArn(newInvestorsData?.newInvestorsArn ?? 0);

        const netInflowData = data.find((item) => item.type === "Net Inflow");
        setNetInflow(netInflowData?.netInflow ?? 0);
        setNetInflowRia(netInflowData?.netInflowRia ?? 0);
        setNetInflowArn(netInflowData?.netInflowArn ?? 0);

        const redemptionsData = data.find((item) => item.type === "Redemptions");
        setRedemptions(redemptionsData?.redemptions ?? 0);
        setRedemptionsRia(redemptionsData?.redemptionsRia ?? 0);
        setRedemptionsArn(redemptionsData?.redemptionsArn ?? 0);

        const investedData = data.find((item) => item.type === "Invested");
        setInvested(investedData?.invested ?? 0);
        setInvestedRia(investedData?.investedRia ?? 0);
        setInvestedArn(investedData?.investedArn ?? 0);

        const returnsData = data.find((item) => item.type === "Returns (%)");
        setReturns(returnsData?.returns ?? 0);
        setReturnsRia(returnsData?.returnsRia ?? 0);
        setReturnsArn(returnsData?.returnsArn ?? 0);
      } catch (error) {
        if (controller.signal.aborted) {
          endLoading();
          return;
        }
        console.error("Error fetching cards data:", error);
      } finally {
        endLoading();
      }
    };

    fetchCardsData();

    return () => controller.abort();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock]);


  // Fetch till-date data for Client & SIP Metrics (Row 2) - Not affected by date filter
  useEffect(() => {
    const controller = new AbortController();
    startLoading();

    const fetchTillDateMetrics = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        console.error("Auth token not found in cookies");
        endLoading();
        return;
      }

      try {
        // Cards API for till-date metrics
        let cardsUrl = `${process.env.NEXT_PUBLIC_API_URL}/referrals/cards-data-mf?timeframe=till_date`;
        
        const employeeId = selectedTeamMember || selectedEmployee;
        if (employeeId) {
          cardsUrl += `&employeeId=${employeeId}`;
        }
        if (selectedType && selectedType.length > 0) {
          cardsUrl += `&type=${selectedTeamMember ? hierarchyViewMode : effectiveType}`;
        }

        const cardsResponse = await fetch(cardsUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          endLoading();
          return;
        }

        if (cardsResponse.ok) {
          const cardsData: CardData[] = await cardsResponse.json();
          
          const totalUsersData = cardsData.find((item) => item.type === "Total Users");
          const avgTicketSizeData = cardsData.find((item) => item.type === "Average Ticket Size");
          const redemptionRateData = cardsData.find((item) => item.type === "Redemption Rate");
          
          setTotalUsersTillDate(totalUsersData?.totalUsers ?? 0);
          setTotalUsersTillDateRia(totalUsersData?.totalUsersRia ?? 0);
          setTotalUsersTillDateArn(totalUsersData?.totalUsersArn ?? 0);
          setAvgTicketSizeTillDate(avgTicketSizeData?.averageTicketSize ?? 0);
          setAvgTicketSizeTillDateRia(avgTicketSizeData?.averageTicketSizeRia ?? 0);
          setAvgTicketSizeTillDateArn(avgTicketSizeData?.averageTicketSizeArn ?? 0);
          setRedemptionRateTillDate(redemptionRateData?.redemptionRate ?? 0);
          setRedemptionRateTillDateRia(redemptionRateData?.redemptionRateRia ?? 0);
          setRedemptionRateTillDateArn(redemptionRateData?.redemptionRateArn ?? 0);
        }

        // SIP API for till-date metrics
        let sipUrl = `${process.env.NEXT_PUBLIC_API_URL}/referrals/sip-cards-data-mf?timeframe=till_date`;
        
        if (employeeId) {
          sipUrl += `&employeeId=${employeeId}`;
        }
        if (selectedType && selectedType.length > 0) {
          sipUrl += `&type=${selectedTeamMember ? hierarchyViewMode : effectiveType}`;
        }

        const sipResponse = await fetch(sipUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          endLoading();
          return;
        }

        if (sipResponse.ok) {
          const sipData: SipCardData[] = await sipResponse.json();
          
          const activeSipsData = sipData.find((item) => item.type === "Total Invested Sips");
          setActiveSipsTillDate(activeSipsData?.totalinvestedsip ?? 0);
          setActiveSipsTillDateRia(activeSipsData?.totalinvestedsipRia ?? 0);
          setActiveSipsTillDateArn(activeSipsData?.totalinvestedsipArn ?? 0);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          endLoading();
          return;
        }
        console.error("Error fetching till-date metrics:", error);
      } finally {
        endLoading();
      }
    };

    fetchTillDateMetrics();

    return () => controller.abort();
  }, [selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock]);


  // Fetch SIP data for Active SIPs
  useEffect(() => {
    const controller = new AbortController();
    startLoading();

    const fetchSipData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        console.error("Auth token not found in cookies");
        endLoading();
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
          endLoading();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch SIP data");
        }

        const data: SipCardData[] = await response.json();
        const activeSipsData = data.find((item) => item.type === "Total Active Sips");
        const cancelledSipsData = data.find((item) => item.type === "Cancelled Sips");
        const failedSipsData = data.find((item) => item.type === "Behind Goals");

        setNewSipsCount(activeSipsData?.totalactivesip ?? 0);
        setNewSipsCountRia(activeSipsData?.totalactivesipRia ?? 0);
        setNewSipsCountArn(activeSipsData?.totalactivesipArn ?? 0);
        setCancelledSipsCount(cancelledSipsData?.totalcancelledsip ?? 0);
        setCancelledSipsCountRia(cancelledSipsData?.totalcancelledsipRia ?? 0);
        setCancelledSipsCountArn(cancelledSipsData?.totalcancelledsipArn ?? 0);
        setFailedSipsCount(failedSipsData?.behindgoalscount ?? 0);
        setFailedSipsCountRia(failedSipsData?.behindgoalscountRia ?? 0);
        setFailedSipsCountArn(failedSipsData?.behindgoalscountArn ?? 0);
      } catch (error) {
        if (controller.signal.aborted) {
          endLoading();
          return;
        }
        console.error("Error fetching SIP data:", error);
      } finally {
        endLoading();
      }
    };

    fetchSipData();

    return () => controller.abort();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock]);

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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const metric = (
    combined: number,
    ria: number,
    arn: number,
    kind: "amount" | "rate" = "amount",
  ) => pickModelMetric(investmentModelFilter, combined, ria, arn, kind);

  const displayRevenue = metric(totalRevenue, totalRevenueRia, totalRevenueArn);
  const displayAum = metric(aum, aumRia, aumArn);
  const displayInvested = metric(invested, investedRia, investedArn);
  const displayReturns = metric(returns, returnsRia, returnsArn, "rate");
  const displayNetInflow = metric(netInflow, netInflowRia, netInflowArn);
  const displayRedemptions = metric(redemptions, redemptionsRia, redemptionsArn);
  const displayNewInvestors = metric(newInvestors, newInvestorsRia, newInvestorsArn);
  const displayNewSips = metric(newSipsCount, newSipsCountRia, newSipsCountArn);
  const displayCancelledSips = metric(cancelledSipsCount, cancelledSipsCountRia, cancelledSipsCountArn);
  const displayFailedSips = metric(failedSipsCount, failedSipsCountRia, failedSipsCountArn);
  const displayUsers = metric(totalUsersTillDate, totalUsersTillDateRia, totalUsersTillDateArn);
  const displayActiveSips = metric(activeSipsTillDate, activeSipsTillDateRia, activeSipsTillDateArn);
  const displayAvgTicket = metric(avgTicketSizeTillDate, avgTicketSizeTillDateRia, avgTicketSizeTillDateArn, "rate");
  const displayRedemptionRate = metric(redemptionRateTillDate, redemptionRateTillDateRia, redemptionRateTillDateArn, "rate");

  const renderMetricBreakdown = (
    arn: number,
    ria: number,
    formatValue: (value: number) => string
  ) => investmentModelFilter !== "ALL" ? null : (
    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-white/70 p-2 dark:bg-white/10">
      <div className="min-w-0 text-center">
        <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">ARN</p>
        <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{formatValue(arn)}</p>
      </div>
      <div className="min-w-0 text-center">
        <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">RIA</p>
        <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{formatValue(ria)}</p>
      </div>
    </div>
  );

  if (loading) {
    return <p>Loading dashboard data...</p>;
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 w-full max-w-full">
      {/* Row 1: Total Revenue, Total AUM, Net Inflow, Redemptions */}
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
              {/* Total Revenue */}
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIcon />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(displayRevenue)}</h2>
                  <p className="total-sale-text">Total Revenue</p>
                  {renderMetricBreakdown(
                    totalRevenueArn,
                    totalRevenueRia,
                    formatCurrency
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>
              
              {/* Total AUM */}
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIconOrange />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(displayAum)}</h2>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="total-sale-text" style={{ margin: 0 }}>Total AUM</p>
                    <p className="text-xs font-medium" style={{ color: "#000000", margin: 0, lineHeight: "24px" }}>
                      <span style={{ color: "#000000" }}>Invested: </span>
                      <span className="text-green-600">{formatCurrency(displayInvested)}</span>
                      {" | "}
                      <span style={{ color: "#000000" }}>Returns: </span>
                      <span className={displayReturns >= 0 ? "text-green-600" : "text-red-600"}>
                        {displayReturns?.toFixed(2)}%
                      </span>
                    </p>
                  </div>
                  {renderMetricBreakdown(
                    aumArn,
                    aumRia,
                    formatCurrency
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>

              {/* Net Inflow */}
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIconGreen />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(displayNetInflow)}</h2>
                  <p className="total-sale-text">Net Inflow</p>
                  {renderMetricBreakdown(
                    netInflowArn,
                    netInflowRia,
                    formatCurrency
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>
              
              {/* Redemptions */}
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  {/* <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(40,0) scale(-1,1)">
                      <circle cx="20" cy="20" r="20" fill="#FA5A7D"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M13 11C11.8954 11 11 11.8954 11 13V27C11 28.1046 11.8954 29 13 29H27C28.1046 29 28.1046 29 27V13C29 11.8954 28.1046 11 27 11H13ZM16 21C16 20.4477 15.5523 20 15 20C14.4477 20 14 20.4477 14 21V25C14 25.5523 14.4477 26 15 26C15.5523 26 16 25.5523 16 25V21ZM20 17C20.5523 17 21 17.4477 21 18V25C21 25.5523 20 26 19.4477 26C18.8954 26 18.4477 25.5523 18.4477 25V18C18.4477 17.4477 18.8954 17 19.4477 17H20ZM26 15C26 14.4477 25.5523 14 25 14C24.4477 14 24 14.4477 24 15V25C24 25.5523 24.4477 26 25 26C25.5523 26 26 25.5523 26 25V15Z" fill="white"/>
                    </g>
                  </svg> */}
                  <SalesIconViolet/>
                  <h2 className="numbers-sale text-gray-900">{formatNumber(displayRedemptions)}</h2>
                  <p className="total-sale-text">Redemptions</p>
                  {renderMetricBreakdown(
                    redemptionsArn,
                    redemptionsRia,
                    formatNumber
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Row 2: SIP Activity */}
      <div className="col-span-12">
        <div className="grid">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  SIP Activity
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Track investor onboarding and SIP lifecycle activity including new, cancelled, and failed SIPs.
                </span>
              </div>
            </div>

            <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <NewCustomerRedIcon />
                  <h2 className="numbers-sale text-gray-900">{formatNumber(displayNewInvestors)}</h2>
                  <p className="total-sale-text">New Investors</p>
                  {renderMetricBreakdown(
                    newInvestorsArn,
                    newInvestorsRia,
                    formatNumber
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>

              <div className="col-span-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/sip/activesip")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push("/sip/activesip");
                    }
                  }}
                  className="group box-total-sales h-full cursor-pointer transform-gpu transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md"
                >
                  <OrderIcon />
                  <h2 className="numbers-sale text-gray-900 transition-all duration-300 group-hover:font-bold">{formatNumber(displayNewSips)}</h2>
                  <p className="total-sale-text transition-all duration-300 group-hover:font-semibold">New SIPs</p>
                  {renderMetricBreakdown(
                    newSipsCountArn,
                    newSipsCountRia,
                    formatNumber
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>

              <div className="col-span-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/sip/cancelledsip")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push("/sip/cancelledsip");
                    }
                  }}
                  className="group box-total-sales h-full cursor-pointer transform-gpu transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md"
                >
                  <OrderIconGreen />
                  <h2 className="numbers-sale text-gray-900 transition-all duration-300 group-hover:font-bold">{formatNumber(displayCancelledSips)}</h2>
                  <p className="total-sale-text transition-all duration-300 group-hover:font-semibold">Cancelled SIPs</p>
                  {renderMetricBreakdown(
                    cancelledSipsCountArn,
                    cancelledSipsCountRia,
                    formatNumber
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>

              <div className="col-span-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/sip/behindgoalssip")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push("/sip/behindgoalssip");
                    }
                  }}
                  className="group box-total-sales h-full cursor-pointer transform-gpu transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md"
                >
                  <OrderIconPurple />
                  <h2 className="numbers-sale text-gray-900 transition-all duration-300 group-hover:font-bold">{formatNumber(displayFailedSips)}</h2>
                  <p className="total-sale-text transition-all duration-300 group-hover:font-semibold">Failed SIPs</p>
                  {renderMetricBreakdown(
                    failedSipsCountArn,
                    failedSipsCountRia,
                    formatNumber
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Existing Clients, Active SIPs, Avg Ticket Size, Redemption Rate */}
      <div className="col-span-12">
        <div className="grid">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Client & SIP Performance (All-Time Overview)
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Track overall client participation, active SIPs, investment size, and redemption trends. 
                </span>
              </div>
            </div>

            <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
              <div className="col-span-4 shrink-0 w-[260px] xl:w-auto xl:flex-1">
                <div className="box-total-sales h-full">
                  <SalesIcon />
                  <h2 className="numbers-sale text-gray-900">{formatNumber(displayUsers)}</h2>
                  <p className="total-sale-text">Existing Clients</p>
                  {renderMetricBreakdown(
                    totalUsersTillDateArn,
                    totalUsersTillDateRia,
                    formatNumber
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>

              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <OrderIcon />
                  <h2 className="numbers-sale text-gray-900">{formatNumber(displayActiveSips)}</h2>
                  <p className="total-sale-text">Active Invested SIPs</p>
                  {renderMetricBreakdown(
                    activeSipsTillDateArn,
                    activeSipsTillDateRia,
                    formatNumber
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <DiscIcon />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(displayAvgTicket)}</h2>
                  <p className="total-sale-text">Avg Ticket Size</p>
                  {renderMetricBreakdown(
                    avgTicketSizeTillDateArn,
                    avgTicketSizeTillDateRia,
                    formatCurrency
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIconViolet />
                  <h2 className="numbers-sale text-gray-900">{formatPercentage(displayRedemptionRate)}</h2>
                  <p className="total-sale-text">Redemption Rate</p>
                  {renderMetricBreakdown(
                    redemptionRateTillDateArn,
                    redemptionRateTillDateRia,
                    formatPercentage
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
