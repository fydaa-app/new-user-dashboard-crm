"use client";

import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Payouts from "@/components/payout/Payouts";

export default function SettingPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Settings" />
            <div className="space-y-6">
                <ComponentCard title="Settings">
                   <Payouts></Payouts>
                </ComponentCard>
            </div>
        </div>
    );
}