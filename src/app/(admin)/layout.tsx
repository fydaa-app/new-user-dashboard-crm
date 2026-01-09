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

  return (
    <ProtectedRoute>
      <div>
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        
        {/* Main Content Area */}
        <main className={`transition-all duration-300 ${mainContentMargin}`}>
          {/* Mobile Header */}
          <div className="block lg:hidden">
            <MobileHeader />
          </div>

          {/* Mobile Filters Sidebar (dedicated hierarchy/filter sidebar) */}
          <MobileFiltersSidebar />

          {/* Desktop Header */}
          <div className="hidden lg:block">
            <AppHeader />
          </div>
          
          {/* Page Content */}
          <div className="p-4 md:p-6 dark:bg-gray-900">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}