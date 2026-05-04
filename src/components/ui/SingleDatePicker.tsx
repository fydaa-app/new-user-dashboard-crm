"use client";
import React, { useState, useEffect } from "react";
import { CalenderIcon } from "@/icons";

interface SingleDatePickerProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
  className?: string;
  placeholder?: string;
}

export const SingleDatePicker: React.FC<SingleDatePickerProps> = ({
  date,
  onDateChange,
  className = "",
  placeholder = "Select date"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(date);
  const [viewMode, setViewMode] = useState<'days' | 'years'>('days');
  const [popDirection, setPopDirection] = useState<'down' | 'up'>('down');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const MIN_DATE = new Date(2021, 0, 1);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setPopDirection(spaceBelow < 400 ? 'up' : 'down');
    }
  }, [isOpen]);

  useEffect(() => {
    setTempDate(date);
  }, [date]);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateSelect = (selectedDate: Date) => {
    if (selectedDate < MIN_DATE) return;
    setTempDate(selectedDate);
  };

  const applySelection = () => {
    onDateChange(tempDate);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setTempDate(null);
    onDateChange(null);
    setIsOpen(false);
  };

  const generateCalendarDays = (year: number, month: number): Date[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startCalendarDate = new Date(firstDay);
    startCalendarDate.setDate(startCalendarDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const currentDate = new Date(startCalendarDate);
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days.slice(0, 42);
  };

  const [currentMonth, setCurrentMonth] = useState({
    month: date ? date.getMonth() : new Date().getMonth(),
    year: date ? date.getFullYear() : new Date().getFullYear()
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

  const yearsList = generateYears(currentMonth.year);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) {
        if (prev.year <= 2021) return prev;
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
        <span className={date ? '' : 'text-gray-400 dark:text-gray-500'}>
          {date ? formatDate(date) : placeholder}
        </span>
        <CalenderIcon className="h-6 w-6 text-gray-400" />
      </button>

      {isOpen && (
        <div className={`absolute left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[320px] 
          ${popDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={viewMode === 'days' ? goToPreviousMonth : () => setCurrentMonth(prev => ({ ...prev, year: Math.max(2021, prev.year - 12) }))}
              disabled={viewMode === 'days' && currentMonth.month === 0 && currentMonth.year <= 2021}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
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
                {viewMode === 'days' ? currentMonth.year : `${Math.max(2021, yearsList[0])} - ${yearsList[yearsList.length - 1]}`}
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

          {viewMode === 'days' ? (
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-1">
                  {day}
                </div>
              ))}
              {calendarDays.map((calDate, idx) => {
                const isCurrentMonth = calDate.getMonth() === currentMonth.month;
                const isSelected = tempDate && calDate.toDateString() === tempDate.toDateString();
                const isToday = calDate.toDateString() === new Date().toDateString();
                const isBeforeMin = calDate < MIN_DATE;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleDateSelect(calDate)}
                    disabled={!isCurrentMonth || isBeforeMin}
                    className={`
                      w-8 h-8 text-xs rounded-full flex items-center justify-center transition-colors
                      ${!isCurrentMonth || isBeforeMin ? 'text-gray-300 dark:text-gray-600 cursor-default' : ''}
                      ${isCurrentMonth && isSelected ? 'bg-brand-600 text-white' : ''}
                      ${isCurrentMonth && !isSelected && !isBeforeMin ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' : ''}
                      ${isToday ? 'ring-2 ring-brand-500' : ''}
                    `}
                  >
                    {calDate.getDate()}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {yearsList.map((y) => (
                <button
                  key={y}
                  disabled={y < 2021}
                  onClick={() => {
                    setCurrentMonth(prev => ({ ...prev, year: y }));
                    setViewMode('days');
                  }}
                  className={`
                    py-2 text-sm rounded-lg transition-colors
                    ${y === currentMonth.year ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                    ${y < 2021 ? 'opacity-30 cursor-not-allowed text-gray-400' : ''}
                  `}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

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
                disabled={!tempDate}
                className="px-3 py-1 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
