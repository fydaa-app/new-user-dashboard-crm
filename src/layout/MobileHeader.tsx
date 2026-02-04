"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "@/context/SidebarContext";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";

const MobileHeader: React.FC = () => {
  const { toggleMobileSidebar, toggleMobileFilters, isMobileFiltersOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-[99999] flex w-full max-w-full bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900 lg:hidden overflow-x-hidden lg:overflow-visible">
      <div className="flex items-center justify-between w-full max-w-full px-3 py-3 sm:px-4 overflow-x-hidden lg:overflow-visible">
        {/* Left: Sidebar toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            aria-label="Toggle sidebar"
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <Link href="/">
            <Image
              width={32}
              height={32}
              src="/images/logo/icon.png"
              alt="Logo"
            />
          </Link>
        </div>

        {/* Right: Filters, theme toggle, user */}
        <div className="flex items-center gap-2 2xsm:gap-3 overflow-visible">
          {/* Filters trigger (toggles mobile filters sidebar) - moved to right */}
          <div className="flex items-center gap-2 relative">
            {/* Sliding "Filters" text - slides from left */}
            <span
              className={`absolute right-full mr-2 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-all duration-300 ease-out ${
                isMobileFiltersOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8 pointer-events-none"
              }`}
            >
              Filters
            </span>
            
            <button
              type="button"
              aria-label={isMobileFiltersOpen ? "Close filters" : "Open filters"}
              className={`flex items-center justify-center w-10 h-10 border rounded-lg transition-colors ${
                isMobileFiltersOpen
                  ? "text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400"
                  : "text-gray-500 border-gray-200 dark:border-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={toggleMobileFilters}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M7 12h10M10 18h4"
                />
              </svg>
            </button>
          </div>

          <ThemeToggleButton />

          <UserDropdown hideName={true} />
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;


