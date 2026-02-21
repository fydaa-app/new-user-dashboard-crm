"use client";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import MobileHeader from "@/layout/MobileHeader";
import MobileFiltersSidebar from "@/layout/MobileFiltersSidebar";
import Backdrop from "@/layout/Backdrop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import React, { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [headerHeight, setHeaderHeight] = useState(80);

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

  // Dynamically measure header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      const mobileHeaderEl = document.getElementById('mobile-header');
      const desktopHeaderEl = document.getElementById('desktop-header');
      
      const isLargeScreen = window.innerWidth >= 1024;
      const activeHeader = isLargeScreen ? desktopHeaderEl : mobileHeaderEl;
      
      if (activeHeader) {
        const height = activeHeader.offsetHeight;
        setHeaderHeight(height);
      }
    };

    // Initial measurement
    updateHeaderHeight();
    
    // Update on resize
    window.addEventListener('resize', updateHeaderHeight);
    
    // Update after a short delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(updateHeaderHeight, 100);
    
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      clearTimeout(timeoutId);
    };
  }, [isExpanded, isHovered]);

  return (
    <ProtectedRoute>
      <div className="w-full overflow-x-hidden">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        
        {/* Mobile Filters Sidebar - moved outside main to avoid overflow constraints */}
        <MobileFiltersSidebar />
        
        {/* Main Content Area */}
        <main className={`transition-all duration-300 ${mainContentMargin} ${mainContentWidth} 
overflow-x-hidden`}>
          {/* Mobile Header */}
          <div id="mobile-header" className="block lg:hidden w-full fixed top-0 left-0 right-0 z-50 bg-white 
dark:bg-boxdark">
            <MobileHeader />
          </div>

          {/* Desktop Header */}
          <div id="desktop-header" className="hidden lg:block w-full fixed top-0 z-50 bg-white dark:bg-boxdark" 
style={{ width: 'inherit' }}>
            <AppHeader />
          </div>

          {/* Page Content with dynamic top padding */}
          <div 
            className="p-3 sm:p-4 md:p-6 dark:bg-gray-900 w-full overflow-x-hidden overflow-y-visible"
            style={{ paddingTop: `${headerHeight + 12}px` }} // 12px for sm:p-3, 16px for sm:p-4, 24px for md:p-6
          >
            <div className="w-full overflow-visible">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}