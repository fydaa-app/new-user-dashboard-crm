"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "@/context/SidebarContext";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";

const MobileHeader: React.FC = () => {
  const { toggleMobileSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-99999 flex w-full bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
      <div className="flex items-center justify-between w-full px-3 py-3 sm:px-4">
        {/* Left: Sidebar toggle + Logo + Filters trigger */}
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
            <div className="flex items-center gap-2">
              <Image
                width={120}
                height={32}
                className="dark:hidden"
                src="/images/logo/logo2.png"
                alt="Logo"
              />
              <Image
                width={120}
                height={32}
                className="hidden dark:block"
                src="/images/logo/logo.png"
                alt="Logo"
              />
            </div>
          </Link>

          {/* Filters trigger (opens mobile filters sidebar) */}
          <button
            type="button"
            aria-label="Open filters"
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("open-mobile-filters"));
              }
            }}
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

        {/* Right: Theme toggle, notifications, user */}
        <div className="flex items-center gap-2 2xsm:gap-3">
          <ThemeToggleButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;


