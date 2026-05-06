"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";

interface PackageData {
  packageName: string;
  userCount: number;
  totalAmount: number;
  userPercentage: number;
  amountPercentage: number;
}

interface TopPackagesResponse {
  employeeId: number;
  employeeName: string;
  timeframe: string;
  totalUsers: number;
  totalAmount: number;
  packageWiseData: PackageData[];
}

export default function TopPackages() {
  const [topPackages, setTopPackages] = useState<PackageData[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const { data: apiData, loading, error } = useFilteredFetch<TopPackagesResponse>(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");
      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/top-packages?`;

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

      const data: TopPackagesResponse = await response.json();
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
    if (apiData?.packageWiseData) {
      setTopPackages(apiData.packageWiseData);
      setTotalAmount(apiData.totalAmount);
    }
  }, [apiData]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between margin-bottom-20">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Packages
        </h3>
        {totalAmount > 0 && (
          <p className="text-sm text-gray-500 dark:text-white/70">
            Total: ₹{totalAmount.toLocaleString()}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error.message}</p>
      ) : topPackages.length === 0 ? (
        <p className="text-gray-500">No package data found</p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between top-product-rows">
            <div className="flex items-center top-product-col-6">
              <div className="items-center w-full rounded-full max-w-8">
                <p>#</p>
              </div>
              <div>
                <p className="font-semibold text-gray-500 text-theme-sm dark:text-white/90">
                  Package Name
                </p>              
              </div>
            </div>

            <div className="flex w-full max-w-[200px] items-center top-product-col-6">
              <div className="w-full text-gray-500">
                Revenue Share
              </div>
              <p className="font-medium text-gray-500 text-theme-sm dark:text-white/90 w-16 text-xs">
                Amount
              </p>
              <p className="font-medium text-gray-500 text-theme-sm dark:text-white/90 w-12 text-xs">
                Users
              </p>
            </div>
          </div>

          {topPackages.map((pkg, index) => (
            <div key={pkg.packageName} className="flex items-center justify-between top-product-rows">
              <div className="flex items-center top-product-col-6">
                <p className="w-6 text-center">{index + 1}</p>
                <p className="ml-4 font-semibold text-gray-500 text-theme-sm dark:text-white/90">
                  {pkg.packageName}
                </p>
              </div>

              <div className="flex w-full max-w-[200px] items-center top-product-col-6">   
                <div className="relative block h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-800">                    
                  <div 
                    className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white" 
                    style={{ width: `${Math.max(pkg.amountPercentage, 5)}%` }}
                  >                    
                  </div>
                </div>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 count-products ml-2 w-16 text-xs">
                  {pkg.userPercentage}%
                </p>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 count-products ml-2 w-12 text-xs">
                  {pkg.userCount}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
