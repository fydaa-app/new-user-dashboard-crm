"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

interface TopGoal {
  goalId: number;
  goalName: string;
  userCount: number;
  totalRevenue: number;
  percentage: number;
  amountPercentage: number;
}

interface TopGoalsResponse {
  employeeId: number;
  employeeName: string;
  timeframe: string;
  totalUsers: number;
  totalRevenue: number;
  goalInvestmentData: TopGoal[];
}

export default function TopGoalsMf() {
  const [topGoals, setTopGoals] = useState<TopGoal[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const { data: apiData, loading, error } = useFilteredFetch<TopGoalsResponse>(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");
      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/top-goals-mf?`;

      if (selectedOption === 'custom') {
        url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
      } else {
        url += `timeframe=${selectedOption || "monthly"}`;
      }

      const employeeId = selectedTeamMember || selectedEmployee;
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      if (selectedType && selectedType.length > 0) {
        url += `&type=${selectedTeamMember ? hierarchyViewMode : effectiveType}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        signal,
      });

      if (response.status === 401) {
        Cookies.remove('authToken');
        window.location.href = "/signin";
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: TopGoalsResponse = await response.json();
      return data;
    },
    [
      selectedOption,
      customDates,
      selectedEmployee,
      selectedTeamMember,
      selectedType,
      hierarchyViewMode,
      userAppTypeLock,
    ]
  );

  useEffect(() => {
    if (apiData) {
      setTopGoals(apiData.goalInvestmentData);
      setTotalAmount(apiData.totalRevenue);
      setTotalUsersCount(apiData.totalUsers);
    }
  }, [apiData]);

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between margin-bottom-20">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Goals
        </h3>
        {totalAmount > 0 && (
          <p className="text-sm text-gray-500 dark:text-white/70">
            Total: {formatCurrency(totalAmount)} | Users: {totalUsersCount}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error.message}</p>
      ) : topGoals.length === 0 ? (
        <p className="text-gray-500">No goal investment data found</p>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="space-y-5 min-w-[600px]">
            <div className="flex items-center justify-between top-product-rows">
            <div className="flex items-center top-product-col-6">
              <p className="w-6 text-center">#</p>
              <p className="ml-4 font-semibold text-gray-500 text-theme-sm dark:text-white/90">
                Goal Name
              </p>              
            </div>

            <div className="flex w-full max-w-[260px] items-center top-product-col-6">
              <div className="h-1 w-full flex items-center">
                <span className="text-gray-500 text-xs">Revenue Share</span>
              </div>
              <p className="font-medium text-gray-500 text-theme-sm dark:text-white/90 ml-2 w-20 text-xs">
                Revenue
              </p>
              <p className="font-medium text-gray-500 text-theme-sm dark:text-white/90 ml-2 w-12 text-xs">
                Users
              </p>
              <p className="font-medium text-gray-500 text-theme-sm dark:text-white/90 ml-2 w-16 text-xs">
                Percentage
              </p>
            </div>
          </div>

          {topGoals.map((goal, index) => (
            <div key={goal.goalId} className="flex items-center justify-between top-product-rows">
              <div className="flex items-center top-product-col-6">
                <p className="w-6 text-center">{index + 1}</p>
                <p className="ml-4 font-semibold text-gray-500 text-theme-sm dark:text-white/90">
                  {goal.goalName}
                </p>
              </div>

              <div className="flex w-full max-w-[260px] items-center top-product-col-6">   
                <div className="relative block h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-800">                    
                  <div 
                    className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white" 
                    style={{ width: `${Math.max(goal.amountPercentage, 5)}%` }}
                  >                    
                  </div>
                </div>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 count-products ml-2 w-20 text-xs">
                  {formatCurrency(goal.totalRevenue)}
                </p>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 count-products ml-2 w-12 text-xs">
                  {goal.userCount}
                </p>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 count-products ml-2 w-16 text-xs">
                  {goal.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
