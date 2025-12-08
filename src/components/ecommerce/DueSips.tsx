import React from "react";
import DueSipsTable, { DueSipItem } from "@/components/tables/DueSipsTable";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";

type DuePeriod = 'today' | 'thisWeek' | 'nextWeek' | 'thisMonth' | 'nextMonth';

interface DueSipsProps {
  filteredSips: DueSipItem[];
  error: string | null;
  loading: boolean;
  selectedPeriod: DuePeriod;
  onPeriodChange: (period: DuePeriod) => void;
}

export default function DueSips({ 
  filteredSips, 
  error, 
  loading, 
  selectedPeriod, 
  onPeriodChange 
}: DueSipsProps) {
  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'nextWeek', label: 'Next Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'nextMonth', label: 'Next Month' },
  ];

  const getDescriptionText = (period: DuePeriod): string => {
    switch (period) {
      case 'today':
        return 'SIPs due up to today';
      case 'thisWeek':
        return 'SIPs due up to end of this week';
      case 'nextWeek':
        return 'SIPs due up to end of next week';
      case 'thisMonth':
        return 'SIPs due up to end of this month';
      case 'nextMonth':
        return 'SIPs due up to end of next month';
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
      <div className="flex items-center justify-between select-none pt-[1.25rem] pb-[0.625rem] px-6 overflow-visible">
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Due SIPs
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getDescriptionText(selectedPeriod)}
          </span>
        </div>
        <div className="relative w-48 z-50">
          <Select 
            options={periodOptions}
            placeholder="Select Period"
            onChange={handlePeriodChange}
            value={selectedPeriod || null}
            className="dark:bg-dark-900"
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <ChevronDownIcon/>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-0 overflow-hidden rounded-b-xl">
        <DueSipsTable 
          sips={filteredSips} 
          error={error} 
          loading={loading}
        />
      </div>
    </div>
  );
}