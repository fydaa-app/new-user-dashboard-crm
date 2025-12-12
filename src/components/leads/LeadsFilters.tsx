"use client";

import React from "react";
import { LeadFilters } from "@/services/leadService";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";

interface LeadsFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  onSortChange?: (sortBy: string, sortOrder: "ASC" | "DESC") => void;
  userOptions?: { value: string; label: string }[];
  isLoading?: boolean;
  onViewModeChange?: (mode: 'all' | 'assigned') => void;
  viewMode?: 'all' | 'assigned';
  onResetAppHeader?: () => void;
}

export default function LeadsFilters({ 
  filters, 
  onFiltersChange, 
  onViewModeChange,
  viewMode = 'assigned',
  onResetAppHeader
}: LeadsFiltersProps) {
  const handleFilterChange = (key: keyof LeadFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    // Reset page to 1 when filters change
    newFilters.page = 1;
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white dark:bg-dark rounded-lg border border-stroke dark:border-strokedark p-4 mb-6">
      {/* Search Bar with Status Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* View Mode Buttons */}
        <div className="relative w-48">
          <Select 
            options={[
              { value: "assigned", label: "Assigned to Me" },
              { value: "all", label: "Show All" }
            ]}
            placeholder="View Mode"
            onChange={(option) => {
              onResetAppHeader?.();
              onViewModeChange?.(option?.value as 'all' | 'assigned');
            }}
            value={viewMode}
            className="dark:bg-dark-900"
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <ChevronDownIcon/>
          </span>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 relative search-box">
          <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
            <svg
              className="fill-gray-500 dark:fill-gray-400"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4702 18.2377 17.1773L15.4176 14.357C16.5344 13.003 17.2053 11.2674 17.2053 9.37363C17.2053 5.04817 13.6989 1.54199 9.37508 1.54199Z"
                fill=""
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-48">
          <Select 
            options={[
              { value: "new", label: "New" },
              { value: "in-progress", label: "In Progress" },
              { value: "converted", label: "Converted" },
              { value: "lost", label: "Lost" }
            ]}
            placeholder="All Status"
            onChange={(option) => handleFilterChange("status", option?.value || undefined)}
            value={filters.status || null}
            className="dark:bg-dark-900"
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <ChevronDownIcon/>
          </span>
        </div>
      </div>
    </div>
  );
}