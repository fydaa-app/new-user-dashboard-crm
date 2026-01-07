"use client";
import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Leaderboard from "@/components/leaderboard/leaderboard";
import LeaderboardMf from "@/components/leaderboard/leaderboardMf";
import { useGlobalContext } from "@/context/GlobalState";

import { useSearchParams } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { LeaderboardEndpoints } from "@/config/api-endpoints";

interface LeaderboardEntry {
  employeeId: string;
  rank: number;
  name: string;
  revenue: number;
  userCount: number;
  totalInvestment: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  error: string | null;
}

export default function LeaderboardPage() {
  const { selectedEmployee, selectedTeamMember, appType } = useGlobalContext();
  const searchParams = useSearchParams();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    leaderboard: [],
    error: null
  });
  const [loading, setLoading] = useState(true);

  const criteria = (searchParams.get("criteria") as "revenue" | "users" | "investment") || "revenue";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const authToken = Cookies.get("authToken") || "";
        
        // Note: If you have a separate MF leaderboard endpoint for Fydaa, add it to LeaderboardEndpoints
        // Use selectedTeamMember if available (team mode), otherwise use selectedEmployee
        const employeeId = selectedTeamMember || selectedEmployee;
        const endpoint = `${LeaderboardEndpoints.LEADERBOARD_LIST}?criteria=${criteria}&employeeId=${employeeId}`;
        
        const response = await apiClient.get<{ leaderboard: LeaderboardEntry[] }>(endpoint);

        if (!response.ok || !response.data) {
          throw new Error("Failed to fetch");
        }

        const data = response.data;
        setLeaderboardData({
          leaderboard: Array.isArray(data.leaderboard) ? data.leaderboard : [],
          error: null
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setLeaderboardData({
          leaderboard: [],
          error: "Error fetching data"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [criteria, selectedEmployee, selectedTeamMember, appType]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="LeaderBoard" />
      <div className="space-y-6">
        <ComponentCard title="LeaderBoard">
          {appType === "Fydaa" ? (
            <LeaderboardMf
              leaderboardData={leaderboardData}
              activeCriteria={criteria}
            />
          ) : (
            <Leaderboard
              leaderboardData={leaderboardData}
              activeCriteria={criteria}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}