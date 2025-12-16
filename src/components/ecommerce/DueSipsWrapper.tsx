"use client";
import React, { useState, useEffect, useCallback } from "react";
import DueSips from "@/components/ecommerce/DueSips";
import { DueSipItem } from "@/components/tables/DueSipsTable";
import { useGlobalContext } from "@/context/GlobalState";
import Cookies from "js-cookie";

type DuePeriod = 'overdue' | 'today' | 'thisWeek' | 'thisMonth' | 'nextMonth';

const DueSipsWrapper = () => {
  const [dueSips, setDueSips] = useState<DueSipItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<DuePeriod>('today');

  const { selectedDesignation, selectedEmployee } = useGlobalContext();

  // Helper function to get start of calendar week (Monday)
  const getStartOfWeek = (date: Date): Date => {
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is start of week
    const startOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
    return startOfWeek;
  };

  // Helper function to get end of calendar week (Sunday)
  const getEndOfWeek = (date: Date): Date => {
    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  };

  // Helper function to get start of month
  const getStartOfMonth = (year: number, month: number): Date => {
    return new Date(year, month, 1, 0, 0, 0, 0);
  };

  // Helper function to get end of month (handles leap years automatically)
  const getEndOfMonth = (year: number, month: number): Date => {
    // Using month + 1 and day 0 automatically handles leap years and varying month lengths
    return new Date(year, month + 1, 0, 23, 59, 59, 999);
  };

  // Filter sips based on selected period (shows only items FROM that period, not UP TO)
  const filterSipsByDueDate = (sips: DueSipItem[], period: DuePeriod): DueSipItem[] => {
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfToday = new Date(todayOnly.getFullYear(), todayOnly.getMonth(), todayOnly.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(todayOnly.getFullYear(), todayOnly.getMonth(), todayOnly.getDate(), 23, 59, 59, 999);

    return sips.filter(sip => {
      if (!sip.nextInstallmentDate) return false;

      const dueDate = new Date(sip.nextInstallmentDate);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      switch (period) {
        case 'overdue':
          // Show only items due before today, but not older than last month
          const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
          const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
          const startOfLastMonth = getStartOfMonth(lastMonthYear, lastMonth);
          return dueDateOnly >= startOfLastMonth && dueDateOnly < startOfToday;


        case 'today':
          // Show only items due today
          return dueDateOnly >= startOfToday && dueDateOnly <= endOfToday;

        case 'thisWeek':
          // Show only items due this week (Monday to Sunday)
          const startOfThisWeek = getStartOfWeek(today);
          const endOfThisWeek = getEndOfWeek(today);
          return dueDateOnly >= startOfThisWeek && dueDateOnly <= endOfThisWeek;

        case 'thisMonth':
          // Show only items due this month
          const startOfThisMonth = getStartOfMonth(today.getFullYear(), today.getMonth());
          const endOfThisMonth = getEndOfMonth(today.getFullYear(), today.getMonth());
          return dueDateOnly >= startOfThisMonth && dueDateOnly <= endOfThisMonth;

        case 'nextMonth':
          // Show only items due next month
          const nextMonth = today.getMonth() + 1;
          const nextMonthYear = nextMonth > 11 ? today.getFullYear() + 1 : today.getFullYear();
          const adjustedNextMonth = nextMonth > 11 ? 0 : nextMonth;
          const startOfNextMonth = getStartOfMonth(nextMonthYear, adjustedNextMonth);
          const endOfNextMonth = getEndOfMonth(nextMonthYear, adjustedNextMonth);
          return dueDateOnly >= startOfNextMonth && dueDateOnly <= endOfNextMonth;

        default:
          return false;
      }
    });
  };

  const fetchDueSips = useCallback(async () => {
    const AUTH_TOKEN = Cookies.get("authToken");

    if (!AUTH_TOKEN) {
      console.error("Auth token not found in cookies");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Helper to fetch a single page
    const fetchPage = async (page: number, ignoreFilters: boolean = false) => {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/active-sip-list-mf?page=${page}&timeframe=yearly`;

      if (!ignoreFilters) {
        if (selectedDesignation) url += `&designationId=${selectedDesignation}`;
        if (selectedEmployee) url += `&employeeId=${selectedEmployee}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      return response;
    };

    try {
      let allSips: DueSipItem[] = [];
      let page = 1;
      let totalPages = 1;
      let shouldUseFilters = true;

      // 1. Initial attempt (Page 1)
      let response = await fetchPage(1, false);

      // 2. Handle 401 with filters -> Retry without filters
      if (response.status === 401 && (selectedDesignation || selectedEmployee)) {
        console.warn("401 error with filters - trying without filters");
        shouldUseFilters = false;
        response = await fetchPage(1, true); // Retry without filters which means ignoreFilters=true
      }

      if (response.status === 401) {
        setError("Authentication issue - please try again");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      let result = await response.json();
      if (Array.isArray(result.data)) {
        allSips = [...allSips, ...result.data];
        totalPages = result.pagination?.totalPages || 1;
      }

      // 3. Fetch remaining pages
      while (page < totalPages && page < 50) { // Limit to 50 pages for safety
        page++;
        try {
          // Fetch subsequent pages using the same filter strategy determined at start
          response = await fetchPage(page, !shouldUseFilters);

          if (!response.ok) {
            console.warn(`Failed to fetch page ${page}: ${response.status}`);
            break;
          }

          result = await response.json();
          if (Array.isArray(result.data)) {
            allSips = [...allSips, ...result.data];
          }
        } catch (e) {
          console.error(`Error fetching page ${page}`, e);
          break;
        }
      }

      // Filter to only show SIPs with due dates
      const sipsWithDueDates = allSips.filter((sip: DueSipItem) => sip.nextInstallmentDate);
      setDueSips(sipsWithDueDates);

    } catch (error) {
      console.error("Error fetching due SIPs:", error);
      setError("Error fetching due SIPs data");
      setDueSips([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDesignation, selectedEmployee]);

  useEffect(() => {
    fetchDueSips();
  }, [fetchDueSips]);

  // Get filtered SIPs based on selected period
  const filteredSips = filterSipsByDueDate(dueSips, selectedPeriod);

  return (
    <DueSips
      filteredSips={filteredSips}
      error={error}
      loading={loading}
      selectedPeriod={selectedPeriod}
      onPeriodChange={setSelectedPeriod}
    />
  );
};

export default DueSipsWrapper;