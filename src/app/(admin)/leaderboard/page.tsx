"use client";
import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Leaderboard from "@/components/leaderboard/leaderboard";
import { useGlobalContext } from "@/context/GlobalState";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";

interface LeaderboardData {
  leaderboard: [];
  error: string | null;
}

export default function LeaderboardPage() {
  const { selectedEmployee } = useGlobalContext();
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
        const authToken = Cookies.get("authToken") || "";
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_LEADERBOARD_LIST_ENDPOINT}?criteria=${criteria}&employeeId=${selectedEmployee}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.status === 401) {
          Cookies.remove("authToken");
          window.location.href = "/signin";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();
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
  }, [criteria, selectedEmployee]);

  if (loading) {
    return <div>Loading...</div>;
  }

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