import React from "react";
import DueSipsTable, { DueSipItem } from "@/components/tables/DueSipsTable";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import Pagination from "@/components/tables/Pagination";

type DuePeriod = 'overdue' | 'today' | 'thisWeek' | 'thisMonth' | 'nextMonth';

interface DueSipsProps {
  sips: DueSipItem[];
  error: string | null;
  loading: boolean;
  selectedPeriod: DuePeriod;
  onPeriodChange: (period: DuePeriod) => void;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function DueSips({ 
  sips, 
  error, 
  loading, 
  selectedPeriod, 
  onPeriodChange,
  page,
  totalPages,
  totalItems,
  onPageChange,
}: DueSipsProps) {
  const periodOptions = [
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'nextMonth', label: 'Next Month' },
  ];

  const getDescriptionText = (period: DuePeriod): string => {
    switch (period) {
      case 'overdue':
        return 'SIPs overdue';
      case 'today':
        return 'SIPs due today';
      case 'thisWeek':
        return 'SIPs due this week';
      case 'thisMonth':
        return 'SIPs due this month';
      case 'nextMonth':
        return 'SIPs due next month';
      default:
        return 'SIPs due';
    }
  };

  const handlePeriodChange = (option: { value: string; label: string } | null) => {
    if (option) {
      onPeriodChange(option.value as DuePeriod);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Header with title and filter dropdown */}
      <div className="flex flex-col gap-4 pt-[1.25rem] pb-[0.625rem] px-6 overflow-visible md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col md:basis-1/3">
          <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Due SIPs
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getDescriptionText(selectedPeriod)}
          </span>
        </div>
        {totalItems > 0 && totalPages > 1 && (
          <div className="flex justify-center md:basis-1/3">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
        <div className="relative w-48 md:basis-1/3 md:flex md:justify-end">
          <Select 
            options={periodOptions}
            placeholder="Select Period"
            onChange={handlePeriodChange}
            value={selectedPeriod || null}
            className="dark:bg-dark-900"
            menuZIndex={50}
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <ChevronDownIcon/>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-0 overflow-hidden rounded-b-xl">
        <DueSipsTable 
          sips={sips} 
          error={error} 
          loading={loading}
        />
      </div>
    </div>
  );
}