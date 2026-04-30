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
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const { selectedDesignation, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode,userAppTypeLock } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const fetchDueSips = useCallback(async () => {
    const AUTH_TOKEN = Cookies.get("authToken");

    if (!AUTH_TOKEN) {
      console.error("Auth token not found in cookies");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const mapPeriodToTimeframe = (period: DuePeriod) => {
      switch (period) {
        case "overdue":
          return "overdue";
        case "today":
          return "today";
        case "thisWeek":
          return "week";
        case "thisMonth":
          return "month";
        case "nextMonth":
          return "next_month";
        default:
          return "today";
      }
    };

    try {
      const timeframe = mapPeriodToTimeframe(selectedPeriod);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/due-sip-list-mf?page=${page}&limit=10&timeframe=${timeframe}`;

      if (selectedDesignation) url += `&designationId=${selectedDesignation}`;
      // Use selectedTeamMember if available (team mode), otherwise use selectedEmployee
      const employeeId = selectedTeamMember || selectedEmployee;
      if (employeeId) url += `&employeeId=${employeeId}`;
      if (selectedType && selectedType.length > 0) {
        url += `&type=${selectedTeamMember ? hierarchyViewMode : effectiveType}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });

      if (response.status === 401) {
        setError("Authentication issue - please try again");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (Array.isArray(result.data)) {
        setDueSips(result.data);
      } else {
        setDueSips([]);
      }

      setTotalPages(result.pagination?.totalPages || 1);
      setTotalItems(result.pagination?.totalItems || 0);

    } catch (error) {
      console.error("Error fetching due SIPs:", error);
      setError("Error fetching due SIPs data");
      setDueSips([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDesignation, selectedEmployee, selectedTeamMember, selectedPeriod, page, selectedType, hierarchyViewMode]);

  useEffect(() => {
    fetchDueSips();
  }, [fetchDueSips]);

  // Reset to first page when period or filters change
  useEffect(() => {
    setPage(1);
  }, [selectedPeriod, selectedDesignation, selectedEmployee, selectedTeamMember, selectedType]);

  return (
    <DueSips
      sips={dueSips}
      error={error}
      loading={loading}
      selectedPeriod={selectedPeriod}
      onPeriodChange={setSelectedPeriod}
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      onPageChange={setPage}
    />
  );
};

export default DueSipsWrapper;