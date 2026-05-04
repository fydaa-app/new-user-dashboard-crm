"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useGlobalContext } from "@/context/GlobalState";
import { useFydaaOnlyPage } from "@/hooks/useFydaaOnlyPage";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PortfolioManagementCards from "@/components/ecommerce/PortfolioManagementCards";
import TopUsersTable from "@/components/tables/TopUsersTable";
import PortfolioHealthMonitorTable from "@/components/tables/PortfolioHealthMonitorTable";
import AssetAllocationCard from "@/components/ecommerce/AssetAllocationCard";
import { apiClient } from "@/services/api-client";

interface User {
  userId: number;
  userName: string;
  planName: string;
  netWorth: number;
  returnRate: number;
  totalPoints: number;
  assetAllocation: {
    IndianStock: number;
    FixedIncomeBonds: number;
    Gold: number;
    GlobalStock: number;
    RealEstate: number;
  };
  dueSips: { sipName: string; dueDate: string }[];
  isRepair: boolean;
}

interface AssetAllocationData {
  IndianStock: { investedValue: number; currentValue: number; percentage: number };
  GlobalStock: { investedValue: number; currentValue: number; percentage: number };
  FixedIncomeBonds: { investedValue: number; currentValue: number; percentage: number };
  RealEstate: { investedValue: number; currentValue: number; percentage: number };
  Gold: { investedValue: number; currentValue: number; percentage: number };
}

// interface FetchResult {
//   users: User[];
//   totalNetWorth: number;
//   totalReturnRate: number;
//   totalPortfolios: number;
//   totalRepairUsers: number;
//   totalUsers: number;
//   assetAllocation: AssetAllocationData | null;
//   error: string | null;
// }
interface TopPerformerResponse {
  siNo: number;
  userId: number;
  userName: string;
  netWorth: number;
  returnRate: number;
}

interface PortfolioCardsData {
  totalUsers: number;
  totalNetWorth: number;
  totalReturnRate: number;
  totalPortfolios: number;
  totalRepairUsers: number;
  totalDueUsers: number;
  totalOverdueUsers: number;
  totalInvestedValue: number;
  totalUnrealizedReturn: number;
  totalRealizedReturn: number;
}

async function fetchPortfolioCards(
  selectedOption: string = "yearly",
  selectedEmployee: string = "",
  selectedTeamMember: string = "",
  customDates: { start: string; end: string } = { start: "", end: "" },
  selectedType: string = "team",
  hierarchyViewMode: "team" | "individual" = "team"
): Promise<PortfolioCardsData> {
  try {
    const employeeId = selectedTeamMember || selectedEmployee;
    
    let queryParams = `hideZeroNetWorth=true`;

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

    const cardsUrl = `/referrals/portfolio-cards-mf?${queryParams}`;
    
    const cardsResponse = await apiClient.get<PortfolioCardsData>(cardsUrl);

    if (!cardsResponse.ok) {
      throw new Error("Failed to fetch portfolio cards");
    }

    return cardsResponse.data;
  } catch (err) {
    console.error("Error fetching portfolio cards:", err);
    return {
      totalUsers: 0,
      totalNetWorth: 0,
      totalReturnRate: 0,
      totalPortfolios: 0,
      totalRepairUsers: 0,
      totalDueUsers: 0,
      totalOverdueUsers: 0,
      totalInvestedValue: 0,
      totalUnrealizedReturn: 0,
      totalRealizedReturn: 0,
    };
  }
}

async function fetchAssetAllocation(
  selectedOption: string = "yearly",
  selectedEmployee: string = "",
  selectedTeamMember: string = "",
  customDates: { start: string; end: string } = { start: "", end: "" },
  selectedType: string = "team",
  hierarchyViewMode: "team" | "individual" = "team"
): Promise<AssetAllocationData | null> {
  try {
    const employeeId = selectedTeamMember || selectedEmployee;
    
    let assetAllocParams = "";
    
    if (selectedOption === 'custom') {
      assetAllocParams += `&timeframe=custom&customStartDate=${customDates.start}&customEndDate=${customDates.end}`;
    } else {
      assetAllocParams += `&timeframe=${selectedOption || "yearly"}`;
    }
    
    if (employeeId) {
      assetAllocParams += `&employeeId=${employeeId}`;
    }
    if (selectedType) {
      assetAllocParams += `&type=${selectedTeamMember ? hierarchyViewMode : selectedType}`;
    }

    const assetResponse = await apiClient.get<{ assetAllocation: AssetAllocationData }>(`/referrals/asset-allocation-mf?${assetAllocParams}`);
    
    if (assetResponse.ok && assetResponse.data) {
      return assetResponse.data.assetAllocation || null;
    }
    
    return null;
  } catch (err) {
    console.error("Error fetching asset allocation:", err);
    return null;
  }
}

async function fetchPortfolioList(
  page: number,
  selectedOption: string = "yearly",
  selectedEmployee: string = "",
  selectedTeamMember: string = "",
  customDates: { start: string; end: string } = { start: "", end: "" },
  searchQuery: string = "",
  selectedType: string = "team",
  hierarchyViewMode: "team" | "individual" = "team",
  sortBy: string = "netWorth",
  sortOrder: string = "desc"
): Promise<{ users: User[]; error: string | null; totalUsers?: number }> {
  try {
    const employeeId = selectedTeamMember || selectedEmployee;
    
    let queryParams = `page=${page}&limit=10&hideZeroNetWorth=true&sortBy=${sortBy}&sortOrder=${sortOrder.toUpperCase()}`;

    if (selectedOption === 'custom') {
      queryParams += `&timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
    } else {
      queryParams += `&timeframe=${selectedOption || "yearly"}`;
    }

    if (searchQuery) {
      queryParams += `&search=${encodeURIComponent(searchQuery)}`;
    }

    if (employeeId) {
      queryParams += `&employeeId=${employeeId}`;
    }

    if (selectedType) {
      queryParams += `&type=${selectedTeamMember ? hierarchyViewMode : selectedType}`;
    }

    const portfolioUrl = `/referrals/portfolio-list-mf?${queryParams}`;
    console.log('Fetching portfolio with URL:', portfolioUrl);
    
    const portfolioResponse = await apiClient.get<{
      users: User[];
      page: number;
      limit: number;
      totalUsers: number;
    }>(portfolioUrl);

    if (!portfolioResponse.ok) {
      throw new Error("Failed to fetch portfolio list");
    }

    const portfolioData = portfolioResponse.data;

    return {
      users: portfolioData.users || [],
      error: null,
      totalUsers: portfolioData.totalUsers,
    };
  } catch (err) {
    console.error("Error fetching portfolio list:", err);
    return {
      users: [],
      error: "Error fetching data",
    };
  }
}

async function fetchTopPerformers(
  selectedOption: string = "yearly",
  selectedEmployee: string = "",
  selectedTeamMember: string = "",
  customDates: { start: string; end: string } = { start: "", end: "" },
  selectedType: string = "team",
  hierarchyViewMode: "team" | "individual" = "team"
): Promise<{ users: User[]; error: string | null }> {
  try {
    const employeeId = selectedTeamMember || selectedEmployee;
    
    let queryParams = `hideZeroNetWorth=true`;
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
    const url = `/referrals/top-performers?${queryParams}`;
    const response = await apiClient.get<TopPerformerResponse[]>(url);
    if (!response.ok) {
      throw new Error("Failed to fetch top performers");
    }
    // Map backend response to User format expected by TopUsersTable
    const users = (response.data || []).map((item: TopPerformerResponse) => ({
      userId: item.userId,
      userName: item.userName,
      planName: "Mutual Fund",
      netWorth: item.netWorth,
      returnRate: item.returnRate,
      totalPoints: 0,
      assetAllocation: {
        IndianStock: 0,
        FixedIncomeBonds: 0,
        Gold: 0,
        GlobalStock: 0,
        RealEstate: 0
      },
      dueSips: [],
      isRepair: false
    }));
    return {
      users: users,
      error: null,
    };
  } catch (err) {
    console.error("Error fetching top performers:", err);
    return {
      users: [],
      error: "Error fetching data",
    };
  }
}

export default function PortfolioPage() {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState("");
  const [sortBy, setSortBy] = useState("netWorth");
  const [sortOrder, setSortOrder] = useState("desc");

  const [users, setUsers] = useState<User[]>([]);
  const [totalNetWorth, setTotalNetWorth] = useState(0);
  const [totalReturnRate, setTotalReturnRate] = useState(0);
  const [totalPortfolios, setTotalPortfolios] = useState(0);
  const [totalRepairUsers, setTotalRepairUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocationData | null>(null);
  const [topPerformers, setTopPerformers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  //const [error, setError] = useState<string | null>(null);

  const previousFiltersRef = useRef({
    selectedOption,
    selectedEmployee,
    selectedTeamMember,
    customDates,
    selectedType,
  });

  const fetchCardsData = useCallback(async () => {
    if (!appType || appType !== "Fydaa") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const effectiveSelectedType = selectedType && selectedType.length > 0 ? selectedType[0] : "team";

      const [cardsResult, assetAllocationResult, topResult] = await Promise.all([
        fetchPortfolioCards(
          selectedOption,
          selectedEmployee,
          selectedTeamMember,
          customDates,
          effectiveSelectedType,
          hierarchyViewMode
        ),
        fetchAssetAllocation(
          selectedOption,
          selectedEmployee,
          selectedTeamMember,
          customDates,
          effectiveSelectedType,
          hierarchyViewMode
        ),
        fetchTopPerformers(
          selectedOption,
          selectedEmployee,
          selectedTeamMember,
          customDates,
          effectiveSelectedType,
          hierarchyViewMode
        )
      ]);

      setTotalNetWorth(cardsResult.totalNetWorth);
      setTotalReturnRate(cardsResult.totalReturnRate);
      setTotalPortfolios(cardsResult.totalPortfolios);
      setTotalRepairUsers(cardsResult.totalRepairUsers);
      setTotalUsers(cardsResult.totalUsers);
      setAssetAllocation(assetAllocationResult);
      setTopPerformers(topResult.users);
    } catch (err) {
      console.error("Error fetching cards data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [appType, selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode]);

  const fetchListData = useCallback(async () => {
    console.log('fetchListData called, sortBy:', sortBy, 'sortOrder:', sortOrder, 'page:', page);
    if (!appType || appType !== "Fydaa") {
      setIsLoadingTable(false);
      return;
    }

    setIsLoadingTable(true);
    try {
      const effectiveSelectedType = selectedType && selectedType.length > 0 ? selectedType[0] : "team";

      const listResult = await fetchPortfolioList(
        page,
        selectedOption,
        selectedEmployee,
        selectedTeamMember,
        customDates,
        searchSubmitted,
        effectiveSelectedType,
        hierarchyViewMode,
        sortBy,
        sortOrder
      );

      setUsers(listResult.users);
      if (listResult.totalUsers !== undefined) {
        setTotalUsers(listResult.totalUsers);
      }
      //setError(listResult.error);
    } catch (err) {
      console.error("Error fetching list data:", err);
      //setError("Failed to load data");
    } finally {
      setIsLoadingTable(false);
    }
  }, [appType, page, selectedOption, customDates, searchSubmitted, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, sortBy, sortOrder]);

  // Fetch cards data when filters change (not on page change or search)
  useEffect(() => {
    fetchCardsData();
  }, [appType, selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode]);

  // Initial fetch on mount and when filters/page/search changes
  useEffect(() => {
    fetchListData();
}, [page, selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, searchSubmitted, sortBy, sortOrder]);
  // Reset to page 1 when filters change
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

  const handleSearch = () => {
    setPage(1);
    setSearchSubmitted(searchQuery);
  };

  const handleSort = (field: string) => {
    console.log('handleSort called with field:', field, 'current sortBy:', sortBy, 'sortOrder:', sortOrder);
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };


  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Portfolio" />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Portfolio Management
        </h1>
      </div>

      {/* Portfolio Summary Cards */}
      <PortfolioManagementCards
        totalNetWorth={totalNetWorth}
        totalReturnRate={totalReturnRate}
        totalPortfolios={totalPortfolios}
        totalRepairUsers={totalRepairUsers}
        loading={isLoading}
      />

      {/* Asset Allocation & Top Performers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComponentCard title="Asset Allocation">
          <AssetAllocationCard
            assetAllocation={assetAllocation}
            loading={isLoading}
          />
        </ComponentCard>

        <ComponentCard title="Top Performers">
          <TopUsersTable
            users={topPerformers}
            loading={isLoading}
          />
        </ComponentCard>
      </div>

      {/* Portfolio Health Monitor */}
      <ComponentCard title="Portfolio Health Monitor">
        {isLoadingTable ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <PortfolioHealthMonitorTable
            users={users}
            totalUsers={totalUsers}
            page={page}
            setPage={handlePageChange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            loading={isLoadingTable}
            onSearch={handleSearch}
            onSort={handleSort}
          />
        )}
      </ComponentCard>
    </div>
  );
}
