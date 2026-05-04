"use client";

import React, { useState } from "react";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { SingleDatePicker } from "@/components/ui/SingleDatePicker";

interface CustomDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
}

export const CustomDateModal: React.FC<CustomDateModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tillDate, setTillDate] = useState<Date | null>(null);
  const [lastActive, setLastActive] = useState<"range" | "tillDate" | null>(null);

  if (!isOpen) return null;

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    setLastActive("range");
  };

  const handleTillDateChange = (date: Date | null) => {
    setTillDate(date);
    setLastActive("tillDate");
  };

  const handleApply = () => {
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (lastActive === "range" && startDate && endDate) {
      onApply(formatDate(startDate), formatDate(endDate));
    } else if (lastActive === "tillDate" && tillDate) {
      const janFirst2021 = new Date(2021, 0, 1);
      onApply(formatDate(janFirst2021), formatDate(tillDate));
    }

    // Reset after applying
    setStartDate(null);
    setEndDate(null);
    setTillDate(null);
    setLastActive(null);
    onClose();
  };

  const handleCancel = () => {
    setStartDate(null);
    setEndDate(null);
    setTillDate(null);
    setLastActive(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Custom Date Options
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Range Picker Section */}
            <div className={`p-4 rounded-xl border-2 transition-colors ${lastActive === 'range' ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 'border-transparent'}`}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date Range
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
                className="w-full"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white dark:bg-gray-800 text-sm text-gray-500">OR</span>
              </div>
            </div>

            {/* Till Date Picker Section */}
            <div className={`p-4 rounded-xl border-2 transition-colors ${lastActive === 'tillDate' ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 'border-transparent'}`}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Till Date
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Fetches data up to your chosen date.
              </p>
              <SingleDatePicker
                date={tillDate}
                onDateChange={handleTillDateChange}
                placeholder="Choose end date"
                className="w-full"
              />
            </div>
          </div>

          {/* Footer with Buttons */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 
 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!lastActive || (lastActive === 'range' && (!startDate || !endDate)) || (lastActive === 'tillDate' && !tillDate)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 
 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply Selection
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
