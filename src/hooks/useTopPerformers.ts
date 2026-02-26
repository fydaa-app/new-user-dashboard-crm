import { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';

interface UseTopPerformersParams {
  timeframe?: string;
  customDates?: { start: string; end: string } | null;
  employeeId?: number | null;
  teamMemberId?: number | null;
  hierarchyViewMode?: "individual" | "team";
  selectedType?: "individual" | "team";
  limit?: number;
}

interface TopPerformer {
  userId: number;
  userName: string;
  netWorth: number;
  returnRate: number;
}

export function useTopPerformers({
  timeframe = "yearly",
  customDates = null,
  employeeId = null,
  teamMemberId = null,
  hierarchyViewMode = "team",
  selectedType = "team",
  limit = 10,
}: UseTopPerformersParams) {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopPerformers = async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getCookie('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Use teamMemberId as employeeId if selected
      const effectiveEmployeeId = teamMemberId || employeeId;

      const params = new URLSearchParams({
        page: "1",
        limit: limit.toString(),
        hideZeroNetWorth: "true",
        sortBy: "returnRate",
        sortOrder: "DESC",
        timeframe: timeframe,
      });

      if (customDates && timeframe === "custom") {
        params.set("customStartDate", customDates.start);
        params.set("customEndDate", customDates.end);
      }

      if (effectiveEmployeeId) {
        params.append("employeeId", effectiveEmployeeId.toString());
      }

      if (selectedType) {
        params.append("type", teamMemberId ? hierarchyViewMode : selectedType);
      }

      const response = await fetch(
        `${apiUrl}/referrals/user-list-mf?${params}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch top performers');
      }

      const data = await response.json();

      // Map to top performers format
      const performers: TopPerformer[] = (data.users || []).map((user: any) => ({
        userId: user.userId,
        userName: user.userName,
        netWorth: user.netWorth || 0,
        returnRate: user.returnRate || 0,
      }));

      setTopPerformers(performers);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching top performers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopPerformers();
  }, [timeframe, customDates, employeeId, teamMemberId, hierarchyViewMode, selectedType, limit]);

  return {
    topPerformers,
    loading,
    error,
    refetch: fetchTopPerformers,
  };
}
