"use client";
import React, { useState, useEffect, useCallback } from "react";
import DueSips from "@/components/ecommerce/DueSips";
import { DueSipItem } from "@/components/tables/DueSipsTable";
import { useGlobalContext } from "@/context/GlobalState";
import Cookies from "js-cookie";

type DuePeriod = 'today' | 'thisWeek' | 'nextWeek' | 'thisMonth' | 'nextMonth';

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

  // Helper function to get start of next calendar week
  const getStartOfNextWeek = (date: Date): Date => {
    const currentWeekEnd = getEndOfWeek(date);
    const nextWeekStart = new Date(currentWeekEnd);
    nextWeekStart.setDate(currentWeekEnd.getDate() + 1);
    nextWeekStart.setHours(0, 0, 0, 0);
    return nextWeekStart;
  };

  // Helper function to get end of next calendar week
  const getEndOfNextWeek = (date: Date): Date => {
    const nextWeekStart = getStartOfNextWeek(date);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    nextWeekEnd.setHours(23, 59, 59, 999);
    return nextWeekEnd;
  };

  // Helper function to get end of month (handles leap years automatically)
  const getEndOfMonth = (year: number, month: number): Date => {
    // Using month + 1 and day 0 automatically handles leap years and varying month lengths
    return new Date(year, month + 1, 0, 23, 59, 59, 999);
  };

  // Filter sips based on selected period (CUMULATIVE - shows everything up to that period)
  const filterSipsByDueDate = (sips: DueSipItem[], period: DuePeriod): DueSipItem[] => {
    const today = new Date();
    
    return sips.filter(sip => {
      if (!sip.nextInstallmentDate) return false;
      
      const dueDate = new Date(sip.nextInstallmentDate);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      
      switch (period) {
        case 'today':
          // Show everything due up to and including today
          const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
          return dueDateOnly <= endOfToday;
        
        case 'thisWeek':
          // Show everything due up to end of this calendar week (Sunday)
          const endOfThisWeek = getEndOfWeek(today);
          return dueDateOnly <= endOfThisWeek;
        
        case 'nextWeek':
          // Show everything due up to end of next calendar week
          const endOfNextWeek = getEndOfNextWeek(today);
          return dueDateOnly <= endOfNextWeek;
        
        case 'thisMonth':
          // Show everything due up to end of this calendar month (handles leap years)
          const endOfThisMonth = getEndOfMonth(today.getFullYear(), today.getMonth());
          return dueDateOnly <= endOfThisMonth;
        
        case 'nextMonth':
          // Show everything due up to end of next calendar month (handles leap years)
          const nextMonth = today.getMonth() + 1;
          const nextMonthYear = nextMonth > 11 ? today.getFullYear() + 1 : today.getFullYear();
          const adjustedNextMonth = nextMonth > 11 ? 0 : nextMonth;
          const endOfNextMonth = getEndOfMonth(nextMonthYear, adjustedNextMonth);
          return dueDateOnly <= endOfNextMonth;
        
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

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/active-sip-list-mf?page=1&timeframe=yearly`;

      // Add designation filter if selected
      if (selectedDesignation) {
        url += `&designationId=${selectedDesignation}`;
      }

      // Add employee filter if selected
      if (selectedEmployee) {
        url += `&employeeId=${selectedEmployee}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        }
      });

      if (response.status === 401) {
        if (selectedEmployee || selectedDesignation) {
          console.warn("401 error with filters - trying without filters");
          // Retry without filters to get real data
          const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/referrals/active-sip-list-mf?page=1&timeframe=yearly`;
          
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              Authorization: `Bearer ${AUTH_TOKEN}`,
            }
          });
          
          if (fallbackResponse.ok) {
            const fallbackResult = await fallbackResponse.json();
            console.log('✅ Got real SIP list data without filters');
            const allSips = Array.isArray(fallbackResult.data) ? fallbackResult.data : [];
            
            // Filter to only show SIPs with due dates
            const sipsWithDueDates = allSips.filter((sip: DueSipItem) => sip.nextInstallmentDate);
            setDueSips(sipsWithDueDates);
          } else {
            setError("Unable to fetch due SIPs data");
          }
        } else {
          setError("Authentication issue - please try again");
        }
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const allSips = Array.isArray(result.data) ? result.data : [];
      
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