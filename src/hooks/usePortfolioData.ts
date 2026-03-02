// import { useState, useEffect } from 'react';
// import { getCookie } from 'cookies-next';

// interface UsePortfolioDataParams {
//   page: number;
//   limit: number;
//   searchQuery?: string;
//   hideZeroNetWorth?: boolean;
//   timeframe?: string;
//   customDates?: { start: string; end: string } | null;
//   hierarchyViewMode?: string;
//   employeeId?: number | null;
//   teamMemberId?: number | null;
//   selectedType?: string;
// }

// interface User {
//   userId: number;
//   userName: string;
//   planName: string;
//   netWorth: number;
//   returnRate: number;
//   totalPoints: number;
//   assetAllocation: {
//     IndianStock: number;
//     FixedIncomeBonds: number;
//     Gold: number;
//     GlobalStock: number;
//     RealEstate: number;
//   };
//   dueSips: any[];
//   isRepair: boolean;
// }

// interface AssetAllocationData {
//   IndianStock: {
//     investedValue: number;
//     currentValue: number;
//     percentage: number;
//   };
//   GlobalStock: {
//     investedValue: number;
//     currentValue: number;
//     percentage: number;
//   };
//   FixedIncomeBonds: {
//     investedValue: number;
//     currentValue: number;
//     percentage: number;
//   };
//   RealEstate: {
//     investedValue: number;
//     currentValue: number;
//     percentage: number;
//   };
//   Gold: {
//     investedValue: number;
//     currentValue: number;
//     percentage: number;
//   };
// }

// export function usePortfolioData({
//   page,
//   limit,
//   searchQuery = '',


//   hideZeroNetWorth = true,
//   timeframe = "yearly",
//   customDates = null,
//   hierarchyViewMode = "team",
//   employeeId = null,
//   teamMemberId = null,
//   selectedType = "team",
// }: UsePortfolioDataParams) {
//   const [users, setUsers] = useState<User[]>([]);
//   const [totalNetWorth, setTotalNetWorth] = useState(0);
//   const [totalReturnRate, setTotalReturnRate] = useState(0);
//   const [totalPortfolios, setTotalPortfolios] = useState(0);
//   const [totalRepairUsers, setTotalRepairUsers] = useState(0);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [assetAllocation, setAssetAllocation] = useState<AssetAllocationData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const authToken = getCookie('authToken');
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL;

//       // Use teamMemberId as employeeId if selected (backend doesn't accept teamMemberId param)
//       const effectiveEmployeeId = teamMemberId || employeeId;

//       // Fetch user list data
//       const userListParams = new URLSearchParams({
//         page: page.toString(),
//         limit: limit.toString(),
//         hideZeroNetWorth: hideZeroNetWorth.toString(),
//         timeframe: timeframe,
//       });

//       if (searchQuery) {
//         userListParams.append('search', searchQuery);
//       }

// if (customDates && timeframe === "custom") {
//   userListParams.set("customStartDate", customDates.start);
//   userListParams.set("customEndDate", customDates.end);
// }


//       if (effectiveEmployeeId) {
//         userListParams.append("employeeId", effectiveEmployeeId.toString());
//       }

//       if (selectedType) {
//         const typeValue = Array.isArray(selectedType) ? selectedType : selectedType;
//         userListParams.append("type", teamMemberId ? hierarchyViewMode : typeValue);
//       }

//       const userListResponse = await fetch(
//         `${apiUrl}/referrals/user-list-mf?${userListParams}`,
//         {
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (!userListResponse.ok) {
//         throw new Error('Failed to fetch user list');
//       }

//       const userData = await userListResponse.json();

//       setUsers(userData.users || []);
//       setTotalNetWorth(userData.totalNetWorth || 0);
//       setTotalReturnRate(userData.totalReturnRate || 0);
//       setTotalPortfolios(userData.totalPortfolios || 0);
//       setTotalRepairUsers(userData.totalRepairUsers || 0);
//       setTotalUsers(userData.totalUsers || 0);

//       // Fetch asset allocation data
//       const assetAllocationParams = new URLSearchParams({
//         timeframe: timeframe,
//       });

// if (customDates && timeframe === "custom") {
//   assetAllocationParams.set("customStartDate", customDates.start);
//   assetAllocationParams.set("customEndDate", customDates.end);
// }


//       if (effectiveEmployeeId) {
//         assetAllocationParams.append("employeeId", effectiveEmployeeId.toString());
//       }

//       if (selectedType) {
//         assetAllocationParams.append("type", teamMemberId ? hierarchyViewMode : selectedType);
//       }

//       const assetAllocationResponse = await fetch(
//         `${apiUrl}/referrals/asset-allocation-mf?${assetAllocationParams}`,
//         {
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (assetAllocationResponse.ok) {
//         const assetData = await assetAllocationResponse.json();
//         setAssetAllocation(assetData.assetAllocation || null);
//       }

//     } catch (err: any) {
//       setError(err.message || 'An error occurred');
//       console.error('Error fetching portfolio data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [page, limit, searchQuery, hideZeroNetWorth, timeframe, employeeId, teamMemberId, customDates, hierarchyViewMode, selectedType]);

//   return {
//     users,
//     totalNetWorth,
//     totalReturnRate,
//     totalPortfolios,
//     totalRepairUsers,
//     totalUsers,
//     assetAllocation,
//     loading,
//     error,
//     refetch: fetchData,
//   };
// }

