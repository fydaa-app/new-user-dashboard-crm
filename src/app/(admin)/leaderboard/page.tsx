// app/transaction-tables/page.tsx
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Leaderboard from "@/components/leaderboard/leaderboard";

async function fetchLeaderboard(criteria: string) {

  try {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_LEADERBOARD_LIST_ENDPOINT}?criteria=${criteria}`,
        {
          headers: {
              Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
          }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch");
    }

    const data = await response.json();
    return { leaderboard: Array.isArray(data.leaderboard) ? data.leaderboard : [], error: null };
  } catch (err) {
      console.error("Error fetching data:", err);
      return { leaderboard: [], error: "Error fetching data" };
  }

}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: { criteria?: string };
}) {
  const criteria = searchParams?.criteria || 'revenue';
  const leaderboardData = await fetchLeaderboard(criteria);

  return (
    <div>
      <PageBreadcrumb pageTitle="LeaderBoard" />
      <div className="space-y-6">
        <ComponentCard title="User List">
          <Leaderboard
            leaderboardData={leaderboardData}
            activeCriteria={criteria}
          />
        </ComponentCard>
      </div>
    </div>
  );
}