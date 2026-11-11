"use client";

import React, { useState, useEffect } from "react";
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
import DashboardSkeleton from "@/components/common/DashboardSkeleton";
import DashboardLoadError from "@/components/common/DashboardLoadError";


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
  grossInvestments?: number;
  grossInvestmentsRia?: number;
  grossInvestmentsArn?: number;
  returns?: number;
  returnsRia?: number;
  returnsArn?: number;
  externalAum?: number;
  externalAumRia?: number;
  externalAumArn?: number;
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
  
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<Error | null>(null);
  const [cardsRetry, setCardsRetry] = useState(0);
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [holdingsError, setHoldingsError] = useState<Error | null>(null);
  const [holdingsRetry, setHoldingsRetry] = useState(0);
  const [tillDateLoading, setTillDateLoading] = useState(true);
  const [tillDateError, setTillDateError] = useState<Error | null>(null);
  const [tillDateRetry, setTillDateRetry] = useState(0);
  const [sipLoading, setSipLoading] = useState(true);
  const [sipError, setSipError] = useState<Error | null>(null);
  const [sipRetry, setSipRetry] = useState(0);

  const [newInvestors, setNewInvestors] = useState<number>(0);
  const [newInvestorsRia, setNewInvestorsRia] = useState<number>(0);
  const [newInvestorsArn, setNewInvestorsArn] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalRevenueRia, setTotalRevenueRia] = useState<number>(0);
  const [totalRevenueArn, setTotalRevenueArn] = useState<number>(0);
  // Holdings-based AUM (transaction cohort / MfEverydayAum) — shown in Growth Overview
  const [holdingsAum, setHoldingsAum] = useState<number>(0);
  const [holdingsAumRia, setHoldingsAumRia] = useState<number>(0);
  const [holdingsAumArn, setHoldingsAumArn] = useState<number>(0);
  const [holdingsGrossInvestments, setHoldingsGrossInvestments] = useState<number>(0);
  const [holdingsGrossInvestmentsRia, setHoldingsGrossInvestmentsRia] = useState<number>(0);
  const [holdingsGrossInvestmentsArn, setHoldingsGrossInvestmentsArn] = useState<number>(0);
  const [holdingsNetInflow, setHoldingsNetInflow] = useState<number>(0);
  const [holdingsNetInflowRia, setHoldingsNetInflowRia] = useState<number>(0);
  const [holdingsNetInflowArn, setHoldingsNetInflowArn] = useState<number>(0);
  const [holdingsRedemptions, setHoldingsRedemptions] = useState<number>(0);
  const [holdingsRedemptionsRia, setHoldingsRedemptionsRia] = useState<number>(0);
  const [holdingsRedemptionsArn, setHoldingsRedemptionsArn] = useState<number>(0);
  const [holdingsReturns, setHoldingsReturns] = useState<number>(0);
  const [holdingsReturnsRia, setHoldingsReturnsRia] = useState<number>(0);
  const [holdingsReturnsArn, setHoldingsReturnsArn] = useState<number>(0);
  // External Holdings
  const [externalAum, setExternalAum] = useState<number>(0);
  const [externalAumRia, setExternalAumRia] = useState<number>(0);
  const [externalAumArn, setExternalAumArn] = useState<number>(0);
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






  // Fetch cards data (revenue + new investors)
  useEffect(() => {
    const controller = new AbortController();
    setCardsLoading(true);
    setCardsError(null);
    setTotalRevenue(0);
    setTotalRevenueRia(0);
    setTotalRevenueArn(0);
    setNewInvestors(0);
    setNewInvestorsRia(0);
    setNewInvestorsArn(0);

    const fetchCardsData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        setCardsError(new Error("Auth token not found"));
        setCardsLoading(false);
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
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch cards data");
        }

        const data: CardData[] = await response.json();

        const newInvestorsData = data.find((item) => item.type === "New Investors");
        const revenueData = data.find((item) => item.type === "Total Revenue");

        setTotalRevenue(revenueData?.totalRevenue ?? 0);
        setTotalRevenueRia(revenueData?.totalRevenueRia ?? 0);
        setTotalRevenueArn(revenueData?.totalRevenueArn ?? 0);
        setNewInvestors(newInvestorsData?.newInvestors ?? 0);
        setNewInvestorsRia(newInvestorsData?.newInvestorsRia ?? 0);
        setNewInvestorsArn(newInvestorsData?.newInvestorsArn ?? 0);
        setCardsError(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setCardsError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        if (!controller.signal.aborted) {
          setCardsLoading(false);
        }
      }
    };

    fetchCardsData();

    return () => controller.abort();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, cardsRetry]);

  // Holdings-based AUM cards (CRM → transaction aum/cohort)
  useEffect(() => {
    const controller = new AbortController();
    setHoldingsLoading(true);
    setHoldingsError(null);
    setHoldingsAum(0);
    setHoldingsAumRia(0);
    setHoldingsAumArn(0);
    setHoldingsGrossInvestments(0);
    setHoldingsGrossInvestmentsRia(0);
    setHoldingsGrossInvestmentsArn(0);
    setHoldingsNetInflow(0);
    setHoldingsNetInflowRia(0);
    setHoldingsNetInflowArn(0);
    setHoldingsRedemptions(0);
    setHoldingsRedemptionsRia(0);
    setHoldingsRedemptionsArn(0);
    setHoldingsReturns(0);
    setHoldingsReturnsRia(0);
    setHoldingsReturnsArn(0);
    setExternalAum(0);
    setExternalAumRia(0);
    setExternalAumArn(0);

    const fetchHoldingsCardsData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        setHoldingsError(new Error("Auth token not found"));
        setHoldingsLoading(false);
        return;
      }

      try {
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
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch holdings cards data");
        }

        const data: CardData[] = await response.json();

        const aumData = data.find((item) => item.type === "Assets under Management");
        setHoldingsAum(aumData?.assetsUnderManagement ?? 0);
        setHoldingsAumRia(aumData?.assetsUnderManagementRia ?? 0);
        setHoldingsAumArn(aumData?.assetsUnderManagementArn ?? 0);

        const grossData = data.find((item) => item.type === "Gross Investments");
        setHoldingsGrossInvestments(grossData?.grossInvestments ?? 0);
        setHoldingsGrossInvestmentsRia(grossData?.grossInvestmentsRia ?? 0);
        setHoldingsGrossInvestmentsArn(grossData?.grossInvestmentsArn ?? 0);

        const netInflowData = data.find((item) => item.type === "Net Inflow");
        setHoldingsNetInflow(netInflowData?.netInflow ?? 0);
        setHoldingsNetInflowRia(netInflowData?.netInflowRia ?? 0);
        setHoldingsNetInflowArn(netInflowData?.netInflowArn ?? 0);

        const redemptionsData = data.find((item) => item.type === "Redemptions");
        setHoldingsRedemptions(redemptionsData?.redemptions ?? 0);
        setHoldingsRedemptionsRia(redemptionsData?.redemptionsRia ?? 0);
        setHoldingsRedemptionsArn(redemptionsData?.redemptionsArn ?? 0);

        const returnsData = data.find((item) => item.type === "Returns (%)");
        setHoldingsReturns(returnsData?.returns ?? 0);
        setHoldingsReturnsRia(returnsData?.returnsRia ?? 0);
        setHoldingsReturnsArn(returnsData?.returnsArn ?? 0);

        const externalData = data.find((item) => item.type === "External Holdings");
        setExternalAum(externalData?.externalAum ?? 0);
        setExternalAumRia(externalData?.externalAumRia ?? 0);
        setExternalAumArn(externalData?.externalAumArn ?? 0);
        setHoldingsError(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setHoldingsError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        if (!controller.signal.aborted) {
          setHoldingsLoading(false);
        }
      }
    };

    fetchHoldingsCardsData();

    return () => controller.abort();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, holdingsRetry]);

  // Fetch till-date data for Client & SIP Metrics - Not affected by date filter
  useEffect(() => {
    const controller = new AbortController();
    setTillDateLoading(true);
    setTillDateError(null);
    setTotalUsersTillDate(0);
    setTotalUsersTillDateRia(0);
    setTotalUsersTillDateArn(0);
    setActiveSipsTillDate(0);
    setActiveSipsTillDateRia(0);
    setActiveSipsTillDateArn(0);
    setAvgTicketSizeTillDate(0);
    setAvgTicketSizeTillDateRia(0);
    setAvgTicketSizeTillDateArn(0);
    setRedemptionRateTillDate(0);
    setRedemptionRateTillDateRia(0);
    setRedemptionRateTillDateArn(0);

    const fetchTillDateMetrics = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        setTillDateError(new Error("Auth token not found"));
        setTillDateLoading(false);
        return;
      }

      try {
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
          return;
        }

        if (!cardsResponse.ok) {
          throw new Error("Failed to fetch till-date cards data");
        }

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
          return;
        }

        if (!sipResponse.ok) {
          throw new Error("Failed to fetch till-date SIP data");
        }

        const sipData: SipCardData[] = await sipResponse.json();
        
        const activeSipsData = sipData.find((item) => item.type === "Total Invested Sips");
        setActiveSipsTillDate(activeSipsData?.totalinvestedsip ?? 0);
        setActiveSipsTillDateRia(activeSipsData?.totalinvestedsipRia ?? 0);
        setActiveSipsTillDateArn(activeSipsData?.totalinvestedsipArn ?? 0);
        setTillDateError(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setTillDateError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        if (!controller.signal.aborted) {
          setTillDateLoading(false);
        }
      }
    };

    fetchTillDateMetrics();

    return () => controller.abort();
  }, [selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, tillDateRetry]);


  // Fetch SIP data for Active SIPs
  useEffect(() => {
    const controller = new AbortController();
    setSipLoading(true);
    setSipError(null);
    setNewSipsCount(0);
    setNewSipsCountRia(0);
    setNewSipsCountArn(0);
    setCancelledSipsCount(0);
    setCancelledSipsCountRia(0);
    setCancelledSipsCountArn(0);
    setFailedSipsCount(0);
    setFailedSipsCountRia(0);
    setFailedSipsCountArn(0);

    const fetchSipData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        setSipError(new Error("Auth token not found"));
        setSipLoading(false);
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
        setSipError(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setSipError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        if (!controller.signal.aborted) {
          setSipLoading(false);
        }
      }
    };

    fetchSipData();

    return () => controller.abort();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, sipRetry]);

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
  const displayNewInvestors = metric(newInvestors, newInvestorsRia, newInvestorsArn);
  const displayNewSips = metric(newSipsCount, newSipsCountRia, newSipsCountArn);
  const displayCancelledSips = metric(cancelledSipsCount, cancelledSipsCountRia, cancelledSipsCountArn);
  const displayFailedSips = metric(failedSipsCount, failedSipsCountRia, failedSipsCountArn);
  const displayUsers = metric(totalUsersTillDate, totalUsersTillDateRia, totalUsersTillDateArn);
  const displayActiveSips = metric(activeSipsTillDate, activeSipsTillDateRia, activeSipsTillDateArn);
  const displayAvgTicket = metric(avgTicketSizeTillDate, avgTicketSizeTillDateRia, avgTicketSizeTillDateArn, "rate");
  const displayRedemptionRate = metric(redemptionRateTillDate, redemptionRateTillDateRia, redemptionRateTillDateArn, "rate");
  const displayHoldingsAum = metric(holdingsAum, holdingsAumRia, holdingsAumArn);
  const displayHoldingsGrossInvestments = metric(
    holdingsGrossInvestments,
    holdingsGrossInvestmentsRia,
    holdingsGrossInvestmentsArn,
  );
  const displayHoldingsReturns = metric(holdingsReturns, holdingsReturnsRia, holdingsReturnsArn, "rate");
  const displayHoldingsNetInflow = metric(holdingsNetInflow, holdingsNetInflowRia, holdingsNetInflowArn);
  const displayHoldingsRedemptions = metric(holdingsRedemptions, holdingsRedemptionsRia, holdingsRedemptionsArn);
  const displayExternalAum = metric(externalAum, externalAumRia, externalAumArn);

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

  const growthLoading = cardsLoading || holdingsLoading;
  const growthError = cardsError || holdingsError;
  const sipActivityLoading = cardsLoading || sipLoading;
  const sipActivityError = cardsError || sipError;

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 w-full max-w-full">
      {/* Growth Overview: Revenue + holdings AUM / Gross / Net / Redeem */}
      <div className="col-span-12">
        {growthLoading ? (
          <DashboardSkeleton variant="cards" count={6} />
        ) : growthError ? (
          <DashboardLoadError
            message={growthError.message || "Failed to load growth overview"}
            onRetry={() => {
              if (cardsError) setCardsRetry((c) => c + 1);
              if (holdingsError) setHoldingsRetry((c) => c + 1);
            }}
          />
        ) : (
        <div className="grid">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Growth Overview
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Revenue, closing AUM, gross investments, net inflow, and redemptions for the selected period
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

              {/* Total AUM (holdings) */}
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIconOrange />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(displayHoldingsAum)}</h2>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="total-sale-text" style={{ margin: 0 }}>Total AUM</p>
                    <p className="text-xs font-medium" style={{ color: "#000000", margin: 0, lineHeight: "24px" }}>
                      <span style={{ color: "#000000" }}>Returns: </span>
                      <span className={displayHoldingsReturns >= 0 ? "text-green-600" : "text-red-600"}>
                        {displayHoldingsReturns?.toFixed(2)}%
                      </span>
                    </p>
                  </div>
                  {renderMetricBreakdown(
                    holdingsAumArn,
                    holdingsAumRia,
                    formatCurrency
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>

              {/* Gross Investments (holdings) */}
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIconGreen />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(displayHoldingsGrossInvestments)}</h2>
                  <p className="total-sale-text">Gross Investments</p>
                  {renderMetricBreakdown(
                    holdingsGrossInvestmentsArn,
                    holdingsGrossInvestmentsRia,
                    formatCurrency
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>

              {/* Net Inflow (holdings) */}
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIconViolet />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(displayHoldingsNetInflow)}</h2>
                  <p className="total-sale-text">Net Inflow</p>
                  {renderMetricBreakdown(
                    holdingsNetInflowArn,
                    holdingsNetInflowRia,
                    formatCurrency
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>

              {/* Redemptions (holdings) */}
              <div className="col-span-4">
                <div className="box-total-sales h-full">
                  <SalesIcon />
                  <h2 className="numbers-sale text-gray-900">{formatCurrency(displayHoldingsRedemptions)}</h2>
                  <p className="total-sale-text">Redemptions</p>
                  {renderMetricBreakdown(
                    holdingsRedemptionsArn,
                    holdingsRedemptionsRia,
                    formatCurrency
                  )}
                  <span className="total-yes"></span>
                </div>
              </div>

              {/* External Holdings (holdings) */}
              {displayExternalAum > 0 && (
                <div className="col-span-4">
                  <div className="box-total-sales h-full">
                    <SalesIconOrange />
                    <h2 className="numbers-sale text-gray-900">{formatCurrency(displayExternalAum)}</h2>
                    <p className="total-sale-text">External Holdings</p>
                    {renderMetricBreakdown(
                      externalAumArn,
                      externalAumRia,
                      formatCurrency
                    )}
                    <span className="total-yes"></span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
        )}
      </div>

      {/* Row 2: SIP Activity */}
      <div className="col-span-12">
        {sipActivityLoading ? (
          <DashboardSkeleton variant="cards" count={4} />
        ) : sipActivityError ? (
          <DashboardLoadError
            message={sipActivityError.message || "Failed to load SIP activity"}
            onRetry={() => {
              if (cardsError) setCardsRetry((c) => c + 1);
              if (sipError) setSipRetry((c) => c + 1);
            }}
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
        )}
      </div>

      {/* Row 3: Existing Clients, Active SIPs, Avg Ticket Size, Redemption Rate */}
      <div className="col-span-12">
        {tillDateLoading ? (
          <DashboardSkeleton variant="cards" count={4} />
        ) : tillDateError ? (
          <DashboardLoadError
            message={tillDateError.message || "Failed to load client & SIP performance"}
            onRetry={() => setTillDateRetry((c) => c + 1)}
          />
        ) : (
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
