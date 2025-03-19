// app/transaction-tables/page.tsx
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Leaderboard from "@/components/leaderboard/leaderboard";

export default async function LeaderboardPage() { 
  return (
    <div>
      <PageBreadcrumb pageTitle="LeaderBoard" />
      <div className="space-y-6">
        <ComponentCard title="User List">          
          <Leaderboard/>          
        </ComponentCard>
      </div>
    </div>
  );
}
