// src/app/(admin)/payouts/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Payouts from "@/components/common/Payouts";

export default function PayoutsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const canAccess = user?.role === '0' || user?.role === '5';

  useEffect(() => {
    if (!isLoading && !canAccess) {
      router.replace("/"); // Redirect to dashboard if not authorized
    }
  }, [isLoading, canAccess, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render anything if user can't access (prevents flash)
  if (!canAccess) {
    return null;
  }
  return (
    <div>
      <PageBreadcrumb pageTitle="Payouts" />
      <div className="space-y-6">
        <ComponentCard title="Payouts">
          <Payouts />
        </ComponentCard>
      </div>
    </div>
  );
}