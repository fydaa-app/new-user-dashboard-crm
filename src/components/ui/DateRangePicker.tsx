"use client";

import React, { useState, useEffect } from "react";
import { CalenderIcon } from "@/icons";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);
  const [viewMode, setViewMode] = useState<'days' | 'years'>('days');
  const [popDirection, setPopDirection] = useState<'down' | 'up'>('down');
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setPopDirection(spaceBelow < 400 ? 'up' : 'down');
    }
  }, [isOpen]);

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDisplayText = (): string => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      return `${formatDate(startDate)} - Select end date`;
    } else if (endDate) {
      return `Select start date - ${formatDate(endDate)}`;
    }
    return "Select date range";
  };

  const handleDateSelect = (date: Date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(date);
      setTempEndDate(null);
    } else {
      // Complete selection
      if (date >= tempStartDate) {
        setTempEndDate(date);
      } else {
        // If end date is before start date, swap them
        setTempEndDate(tempStartDate);
        setTempStartDate(date);
      }
    }
  };

  const applySelection = () => {
    onDateChange(tempStartDate, tempEndDate);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onDateChange(null, null);
    setIsOpen(false);
  };

  const isDateInRange = (date: Date): boolean => {
    if (!tempStartDate || !tempEndDate) return false;
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isDateSelected = (date: Date): boolean => {
    if (tempStartDate && date.getTime() === tempStartDate.getTime()) return true;
    if (tempEndDate && date.getTime() === tempEndDate.getTime()) return true;
    return false;
  };

  const generateCalendarDays = (year: number, month: number): Date[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days.slice(0, 42);
  };

  const [currentMonth, setCurrentMonth] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarDays = generateCalendarDays(currentMonth.year, currentMonth.month);

  const generateYears = (year: number): number[] => {
    const startYear = year - 5;
    const years = [];
    for (let i = 0; i < 12; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const years = generateYears(currentMonth.year);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
      >
        <span className={startDate && endDate ? '' : 'text-gray-400 dark:text-gray-500'}>
          {getDisplayText()}
        </span>
        <CalenderIcon className="h-6 w-6 text-gray-400" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className={`absolute left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[320px]
          ${popDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={viewMode === 'days' ? goToPreviousMonth : () => setCurrentMonth(prev => ({ ...prev, year: prev.year - 12 }))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-1">
              {viewMode === 'days' && (
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {monthNames[currentMonth.month]}
                </span>
              )}
              <button
                onClick={() => setViewMode(viewMode === 'days' ? 'years' : 'days')}
                className="text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-0.5 rounded transition-colors"
              >
                {viewMode === 'days' ? currentMonth.year : `${years[0]} - ${years[years.length - 1]}`}
              </button>
            </div>

            <button
              onClick={viewMode === 'days' ? goToNextMonth : () => setCurrentMonth(prev => ({ ...prev, year: prev.year + 12 }))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          {viewMode === 'days' ? (
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-1">
                  {day}
                </div>
              ))}
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentMonth.month;
                const isInRange = isDateInRange(date);
                const isSelected = isDateSelected(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={!isCurrentMonth}
                    className={`
                      w-8 h-8 text-xs rounded-full flex items-center justify-center transition-colors
                      ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600 cursor-default' : ''}
                      ${isCurrentMonth && isInRange ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-200' : ''}
                      ${isCurrentMonth && isSelected ? 'bg-brand-600 text-white' : ''}
                      ${isCurrentMonth && !isInRange && !isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' : ''}
                      ${isToday ? 'ring-2 ring-brand-500' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setCurrentMonth(prev => ({ ...prev, year }));
                    setViewMode('days');
                  }}
                  className={`
                    py-2 text-sm rounded-lg transition-colors
                    ${year === currentMonth.year ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                  `}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearSelection}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={applySelection}
                disabled={!tempStartDate || !tempEndDate}
                className="px-3 py-1 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
