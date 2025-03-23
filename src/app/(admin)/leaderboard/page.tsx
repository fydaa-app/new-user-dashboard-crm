import React from "react";
import { cookies } from "next/headers";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Leaderboard from "@/components/leaderboard/leaderboard";

async function fetchLeaderboard(criteria: string) {
  try {
    // Await cookies to access its methods
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value || "";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_LEADERBOARD_LIST_ENDPOINT}?criteria=${criteria}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
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
  searchParams = {},
}: {
  searchParams?: { criteria?: string };
}) {
  const criteria = searchParams.criteria || "revenue";
  const leaderboardData = await fetchLeaderboard(criteria);

  return (
    <div>
      <PageBreadcrumb pageTitle="LeaderBoard" />
      <div className="space-y-6">
        <ComponentCard title="LeaderBoard">
          <Leaderboard
            leaderboardData={leaderboardData}
            activeCriteria={criteria}
          />
        </ComponentCard>
      </div>
    </div>
  );
}