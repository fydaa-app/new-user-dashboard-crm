"use client";
import React, { useState, useEffect } from "react";
import DueSips from "@/components/ecommerce/DueSips";
import { DueSipItem } from "@/components/tables/DueSipsTable";
import { useGlobalContext } from "@/context/GlobalState";
import { investmentModelQuery } from "@/context/investmentModel";
import Cookies from "js-cookie";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

type DuePeriod = 'overdue' | 'today' | 'thisWeek' | 'thisMonth' | 'nextMonth';

interface DueSipsApiResponse {
  data: DueSipItem[];
  pagination?: {
    totalPages: number;
    totalItems: number;
  };
}

const DueSipsWrapper = () => {
  const [dueSips, setDueSips] = useState<DueSipItem[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<DuePeriod>('today');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const { selectedDesignation, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock, investmentModelFilter } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  // Resets page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedPeriod, selectedDesignation, selectedEmployee, selectedTeamMember, selectedType]);

  const mapPeriodToTimeframe = (period: DuePeriod) => {
    switch (period) {
      case "overdue": return "overdue";
      case "today": return "today";
      case "thisWeek": return "week";
      case "thisMonth": return "month";
      case "nextMonth": return "next_month";
      default: return "today";
    }
  };

  const fetchDueSips = useFilteredFetch<DueSipsApiResponse>(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      const timeframe = mapPeriodToTimeframe(selectedPeriod);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/due-sip-list-mf?page=${page}&limit=10&timeframe=${timeframe}`;

      if (selectedDesignation) url += `&designationId=${selectedDesignation}`;
      const employeeId = selectedTeamMember || selectedEmployee;
      if (employeeId) url += `&employeeId=${employeeId}`;
      if (selectedType && selectedType.length > 0) {
        url += `&type=${selectedTeamMember ? hierarchyViewMode : effectiveType}`;
      }

      url += investmentModelQuery(investmentModelFilter);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        signal,
      });

      if (response.status === 401) {
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    },
    [
      selectedPeriod,
      page,
      selectedDesignation,
      selectedEmployee,
      selectedTeamMember,
      selectedType,
      hierarchyViewMode,
      userAppTypeLock,
      investmentModelFilter,
    ]
  );

  // Update dueSips, pagination from fetch result; clear while loading to avoid stale rows
  useEffect(() => {
    if (fetchDueSips.loading) {
      setDueSips([]);
      return;
    }
    if (fetchDueSips.data?.data) {
      setDueSips(fetchDueSips.data.data);
      if (fetchDueSips.data.pagination) {
        setTotalPages(fetchDueSips.data.pagination.totalPages || 1);
        setTotalItems(fetchDueSips.data.pagination.totalItems || 0);
      } else {
        setTotalPages(1);
        setTotalItems(fetchDueSips.data.data.length);
      }
    } else if (!fetchDueSips.error) {
      setDueSips([]);
      setTotalPages(1);
      setTotalItems(0);
    }
  }, [fetchDueSips.data, fetchDueSips.loading, fetchDueSips.error]);

  const handlePeriodChange = (period: DuePeriod) => {
    setSelectedPeriod(period);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <DueSips
      sips={dueSips}
      error={fetchDueSips.error?.message || null}
      loading={fetchDueSips.loading}
      onRetry={fetchDueSips.refetch}
      selectedPeriod={selectedPeriod}
      onPeriodChange={handlePeriodChange}
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      onPageChange={handlePageChange}
    />
  );
};

export default DueSipsWrapper;