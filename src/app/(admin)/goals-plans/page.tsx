"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useGlobalContext } from "@/context/GlobalState";
import { useFydaaOnlyPage } from "@/hooks/useFydaaOnlyPage";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import GoalsByCategoryCard from "@/components/ecommerce/GoalsByCategoryCard";
import BehindGoalsList, { BehindGoalsData } from "@/components/ecommerce/BehindGoalsList";
import { apiClient } from "@/services/api-client";

interface GoalCardsData {
  totalActiveGoals: number;
  completedGoals: number;
  onTrackGoals: number;
  behindGoals: number;
}

interface GoalCategory {
  categoryName: string;
  goals: {
    goalId: number;
    goalName: string;
    totalGoalAmount: number;
    totalInvestedAmount: number;
    goalPercentage: number;
    investedPercentage: number;
  }[];
  totalGoalAmount: number;
  totalInvestedAmount: number;
  goalCount: number;
}

interface GoalsByCategoryData {
  categories: GoalCategory[];
  summary: {
    totalGoals: number;
    totalGoalAmount: number;
    totalInvestedAmount: number;
  };
}

// interface BehindGoalItem {
//   sipId: number;
//   username: string;
//   sipName: string;
//   goalName: string;
//   goalPercentage: number;
//   investedAmount: number;
//   expectedAmount: number;
//   goalAmount: number;
// }

// interface BehindGoalsData {
//   data: BehindGoalItem[];
//   pagination: {
//     currentPage: number;
//     totalPages: number;
//     totalItems: number;
//     itemsPerPage: number;
//   };
// }

async function fetchGoalCards(
  selectedOption: string = "yearly",
  selectedEmployee: string = "",
  selectedTeamMember: string = "",
  customDates: { start: string; end: string } = { start: "", end: "" },
  selectedType: string = "team",
  hierarchyViewMode: "team" | "individual" = "team"
): Promise<GoalCardsData> {
  try {
    const employeeId = selectedTeamMember || selectedEmployee;
    
    let queryParams = "";

    if (selectedOption === 'custom') {
      queryParams += `&timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
    } else {
      queryParams += `&timeframe=${selectedOption || "yearly"}`;
    }

    if (employeeId) {
      queryParams += `&employeeId=${employeeId}`;
    }

    if (selectedType) {
      queryParams += `&type=${selectedTeamMember ? hierarchyViewMode : selectedType}`;
    }

    const cardsUrl = `/referrals/goal-cards?${queryParams}`;
    const cardsResponse = await apiClient.get<GoalCardsData>(cardsUrl);

    if (!cardsResponse.ok) {
      throw new Error("Failed to fetch goal cards");
    }

    return cardsResponse.data;
  } catch (err) {
    console.error("Error fetching goal cards:", err);
    return {
      totalActiveGoals: 0,
      completedGoals: 0,
      onTrackGoals: 0,
      behindGoals: 0,
    };
  }
}

async function fetchGoalsByCategory(
  selectedOption: string = "yearly",
  selectedEmployee: string = "",
  selectedTeamMember: string = "",
  customDates: { start: string; end: string } = { start: "", end: "" },
  selectedType: string = "team",
  hierarchyViewMode: "team" | "individual" = "team"
): Promise<GoalsByCategoryData | null> {
  try {
    const employeeId = selectedTeamMember || selectedEmployee;
    
    let queryParams = "";
    
    if (selectedOption === 'custom') {
      queryParams += `&timeframe=custom&customStartDate=${customDates.start}&customEndDate=${customDates.end}`;
    } else {
      queryParams += `&timeframe=${selectedOption || "yearly"}`;
    }
    
    if (employeeId) {
      queryParams += `&employeeId=${employeeId}`;
    }
    if (selectedType) {
      queryParams += `&type=${selectedTeamMember ? hierarchyViewMode : selectedType}`;
    }

    const response = await apiClient.get<GoalsByCategoryData>(`/referrals/goals-by-category?${queryParams}`);
    return response.data;
  } catch (err) {
    console.error("Error fetching goals by category:", err);
    return null;
  }
}

async function fetchBehindGoalsList(
  page: number = 1,
  limit: number = 10,
  selectedOption: string = "yearly",
  selectedEmployee: string = "",
  selectedTeamMember: string = "",
  customDates: { start: string; end: string } = { start: "", end: "" },
  selectedType: string = "team",
  hierarchyViewMode: "team" | "individual" = "team"
): Promise<BehindGoalsData> {
  try {
    const employeeId = selectedTeamMember || selectedEmployee;
    
    let queryParams = `page=${page}&limit=${limit}`;
    
    if (selectedOption === 'custom') {
      queryParams += `&timeframe=custom&customStartDate=${customDates.start}&customEndDate=${customDates.end}`;
    } else {
      queryParams += `&timeframe=${selectedOption || "yearly"}`;
    }
    
    if (employeeId) {
      queryParams += `&employeeId=${employeeId}`;
    }
    if (selectedType) {
      queryParams += `&type=${selectedTeamMember ? hierarchyViewMode : selectedType}`;
    }

    const response = await apiClient.get<BehindGoalsData>(`/referrals/behind-goals-list?${queryParams}`);
    return response.data;
  } catch (err) {
    console.error("Error fetching behind goals list:", err);
    return {
      data: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
      },
    };
  }
}

export default function GoalsPlansPage() {
  useFydaaOnlyPage();
  const {
    appType,
    selectedOption,
    customDates,
    selectedEmployee,
    selectedTeamMember,
    hierarchyViewMode,
    selectedType,
  } = useGlobalContext();

  const [page, setPage] = useState(1);

  const [goalCards, setGoalCards] = useState<GoalCardsData>({
    totalActiveGoals: 0,
    completedGoals: 0,
    onTrackGoals: 0,
    behindGoals: 0,
  });
  const [goalsByCategory, setGoalsByCategory] = useState<GoalsByCategoryData | null>(null);
  const [behindGoals, setBehindGoals] = useState<BehindGoalsData | null>(null);
  
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const previousFiltersRef = useRef({
    selectedOption,
    selectedEmployee,
    selectedTeamMember,
    customDates,
    selectedType,
  });

  const fetchAllData = useCallback(async () => {
    if (!appType || appType !== "Fydaa") {
      return;
    }

    setIsLoadingCards(true);
    setIsLoadingCategory(true);
    setIsLoadingList(true);

    try {
      const effectiveSelectedType = selectedType && selectedType.length > 0 ? selectedType[0] : "team";

      const [cardsResult, categoryResult, listResult] = await Promise.all([
        fetchGoalCards(
          selectedOption,
          selectedEmployee,
          selectedTeamMember,
          customDates,
          effectiveSelectedType,
          hierarchyViewMode
        ),
        fetchGoalsByCategory(
          selectedOption,
          selectedEmployee,
          selectedTeamMember,
          customDates,
          effectiveSelectedType,
          hierarchyViewMode
        ),
        fetchBehindGoalsList(
          page,
          10,
          selectedOption,
          selectedEmployee,
          selectedTeamMember,
          customDates,
          effectiveSelectedType,
          hierarchyViewMode
        ),
      ]);

      setGoalCards(cardsResult);
      setGoalsByCategory(categoryResult);
      setBehindGoals(listResult);
    } catch (err) {
      console.error("Error fetching goals data:", err);
    } finally {
      setIsLoadingCards(false);
      setIsLoadingCategory(false);
      setIsLoadingList(false);
    }
  }, [appType, selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, page]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const prev = previousFiltersRef.current;
    const hasChanged =
      prev.selectedOption !== selectedOption ||
      prev.selectedEmployee !== selectedEmployee ||
      prev.selectedTeamMember !== selectedTeamMember ||
      (prev.customDates?.start !== customDates?.start) ||
      (prev.customDates?.end !== customDates?.end) ||
      prev.selectedType !== selectedType;

    previousFiltersRef.current = {
      selectedOption,
      selectedEmployee,
      selectedTeamMember,
      customDates,
      selectedType,
    };

    if (hasChanged) {
      setPage(1);
    }
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };


  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Goals & Plans" />

      {/* Row 1: Goal Cards */}
      <div className="grid">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Goals Summary
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Monitor overall Goal Metrics across users
              </span>
            </div>
          </div>

          <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
            <div className="col-span-4">
              <div className="box-total-sales h-full">
                <svg className="h-6 w-6 mb-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="numbers-sale text-gray-900">
                  {isLoadingCards ? "-" : goalCards.totalActiveGoals}
                </h2>
                <p className="total-sale-text">Total Active Goals</p>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full">
                <svg className="h-6 w-6 mb-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="numbers-sale text-gray-900">
                  {isLoadingCards ? "-" : goalCards.completedGoals}
                </h2>
                <p className="total-sale-text">Completed Goals</p>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full">
                <svg className="h-6 w-6 mb-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h2 className="numbers-sale text-gray-900">
                  {isLoadingCards ? "-" : goalCards.onTrackGoals}
                </h2>
                <p className="total-sale-text">On Track Goals</p>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full">
                <svg className="h-6 w-6 mb-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <h2 className="numbers-sale text-gray-900">
                  {isLoadingCards ? "-" : goalCards.behindGoals}
                </h2>
                <p className="total-sale-text">Behind Goals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Goals by Category & Behind Goals List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComponentCard title="Goals by Category">
          <GoalsByCategoryCard
            data={goalsByCategory}
            loading={isLoadingCategory}
          />
        </ComponentCard>

        <ComponentCard title="Failed SIP List">
          <BehindGoalsList
            data={behindGoals}
            loading={isLoadingList}
            onPageChange={handlePageChange}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
