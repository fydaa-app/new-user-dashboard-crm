// src/app/(admin)/payouts/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoleNameMap } from "@/context/RoleNameContext";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Payouts from "@/components/payout/Payouts";

export default function PayoutsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerIdParam = searchParams.get("partnerId");
  const { user, isLoading } = useAuth();
  const { roleNameMap } = useRoleNameMap();

  const userRoleLevel = user?.role ? parseInt(user.role, 10) : NaN;
  const isPartner = !isNaN(userRoleLevel) && roleNameMap[userRoleLevel]?.toLowerCase() === "partner";
  const canAccess = user?.role === '0' || isPartner;

  useEffect(() => {
    if (!isLoading && !canAccess) {
      router.replace("/");
    }
  }, [isLoading, canAccess, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!canAccess) {
    return null;
  }
  
  return (
    <div>
      <PageBreadcrumb pageTitle= "Payouts" />
      <div className="space-y-6">
        <ComponentCard title={
          partnerIdParam 
            ? `Transactions - Partner #${partnerIdParam}` 
            : (isPartner ? "Payouts" : "Payouts - List")
        }>
          <Payouts />
        </ComponentCard>
      </div>
    </div>
  );
}
