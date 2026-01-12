"use client";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import MobileHeader from "@/layout/MobileHeader";
import MobileFiltersSidebar from "@/layout/MobileFiltersSidebar";
import Backdrop from "@/layout/Backdrop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // Dynamic width calculation for desktop to account for sidebar (including 1px border)
  const mainContentWidth = isMobileOpen
    ? "w-full"
    : isExpanded || isHovered
    ? "lg:w-[calc(100vw-291px)] lg:max-w-[calc(100vw-291px)]"
    : "lg:w-[calc(100vw-91px)] lg:max-w-[calc(100vw-91px)]";

  return (
    <ProtectedRoute>
      <div className="w-full overflow-x-hidden">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        
        {/* Mobile Filters Sidebar - moved outside main to avoid overflow constraints */}
        <MobileFiltersSidebar />
        
        {/* Main Content Area */}
        <main className={`transition-all duration-300 ${mainContentMargin} ${mainContentWidth} overflow-x-hidden`}>
          {/* Mobile Header */}
          <div className="block lg:hidden w-full">
            <MobileHeader />
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block w-full">
            <AppHeader />
          </div>
          
          {/* Page Content */}
          <div className="p-3 sm:p-4 md:p-6 dark:bg-gray-900 w-full overflow-x-hidden overflow-y-visible">
            <div className="w-full overflow-visible">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}