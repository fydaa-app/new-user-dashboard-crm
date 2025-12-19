"use client";

import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export default function DatePicker({
  value = '',
  onChange,
  placeholder = 'Select date',
  className = '',
  label,
  disabled = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(
    value ? new Date(value) : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      // Ensure the date is valid
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(date);
      } else {
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const formatDisplayDate = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return placeholder;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Set time to start of day and convert to ISO string for backend compatibility
    const dateAtStartOfDay = new Date(date);
    dateAtStartOfDay.setHours(0, 0, 0, 0);
    const isoString = dateAtStartOfDay.toISOString(); // Full ISO string: YYYY-MM-DDTHH:mm:ss.sssZ
    onChange(isoString);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ensure consistent time
    handleDateSelect(today);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange('');
    setIsOpen(false);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // First day of the week for the first day of month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const isPast = date < today;
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isPast
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-black dark:text-white mb-2">
          {label}
        </label>
      )}
      
      {/* Date Input Display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <span className={selectedDate ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {formatDisplayDate(selectedDate)}
        </span>
        <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg w-80 dark:border-white/[0.05] dark:bg-white/[0.03]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="font-semibold text-black dark:text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day.date)}
                  className={`
                    text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                    ${day.isCurrentMonth ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600'}
                    ${day.isToday ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold' : ''}
                    ${day.isSelected ? 'bg-primary text-white hover:bg-primary/90' : ''}
                    ${!day.isCurrentMonth ? 'opacity-50' : ''}
                  `}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={handleToday}
                className="flex-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}