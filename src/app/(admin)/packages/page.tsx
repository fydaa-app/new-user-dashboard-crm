"use client";

import { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/GlobalState";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiClient } from "@/services/api-client";
import { SalesIcon, PlusIcon } from "@/icons";

interface PackageService {
  id: number;
  title: string;
  subtitle: string;
  description: string;
}

interface PackageData {
  packageId: number;
  packageName: string;
  price: number;
  subscribers: number;
  revenue: number;
  services: PackageService[];
}

interface PackagesAnalyticsData {
  totalSubscribers: number;
  totalRevenue: number;
  packages: PackageData[];
}

async function fetchPackagesAnalytics(
  selectedOption: string = "yearly",
  selectedEmployee: string = "",
  selectedTeamMember: string = "",
  customDates: { start: string; end: string } = { start: "", end: "" },
  selectedType: string = "team",
  hierarchyViewMode: "team" | "individual" = "team"
): Promise<PackagesAnalyticsData> {
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

    const response = await apiClient.get<PackagesAnalyticsData>(`/referrals/packages-analytics?${queryParams}`);
    return response.data;
  } catch (err) {
    console.error("Error fetching packages analytics:", err);
    return {
      totalSubscribers: 0,
      totalRevenue: 0,
      packages: [],
    };
  }
}

export default function PackagesPage() {
  const {
    selectedOption,
    customDates,
    selectedEmployee,
    selectedTeamMember,
    hierarchyViewMode,
    selectedType,
  } = useGlobalContext();

  const [packagesData, setPackagesData] = useState<PackagesAnalyticsData>({
    totalSubscribers: 0,
    totalRevenue: 0,
    packages: [],
  });
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchPackagesAnalytics(
          selectedOption,
          selectedEmployee || "",
          selectedTeamMember || "",
          customDates,
          selectedType?.[0] || "team",
          hierarchyViewMode
        );
        setPackagesData(result);
      } catch (err) {
        console.error("Error fetching packages data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode]);

  const toggleService = (serviceKey: string) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceKey)) {
        newSet.delete(serviceKey);
      } else {
        newSet.add(serviceKey);
      }
      return newSet;
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Packages" />
      
      <div className="space-y-6">
        {/* Package Summary */}
        <div className="grid">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Packages Summary
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Monitor overall Package Metrics across users
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <div className="box-total-sales h-full">
                  <SalesIcon />
                  <h2 className="numbers-sale text-gray-900">
                    {isLoading ? "-" : packagesData.totalSubscribers.toLocaleString('en-IN')}
                  </h2>
                  <p className="total-sale-text">Total Subscribers</p>
                </div>
              </div>

              <div>
                <div className="box-total-sales h-full">
                  <SalesIcon />
                  <h2 className="numbers-sale text-gray-900">
                    {isLoading ? "-" : `₹${packagesData.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                  </h2>
                  <p className="total-sale-text">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Packages List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : packagesData.packages.length === 0 ? (
            <ComponentCard title="Packages">
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">No packages data available</p>
              </div>
            </ComponentCard>
          ) : (
            packagesData.packages.filter(pkg => pkg.revenue > 0).map((pkg) => (
              <ComponentCard key={pkg.packageId} title="Packages">
                <div className="space-y-4">
                  {/* Package Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {pkg.packageName}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      ₹{pkg.price?.toLocaleString('en-IN') || 0}/year
                    </p>
                  </div>

                  {/* Subscribers & Revenue Row */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscribers</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {pkg.subscribers.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{pkg.revenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Services List */}
                  {pkg.services && pkg.services.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Services Included</h4>
                      <div className="flex flex-col gap-2">
                        {pkg.services.map((service) => {
                          const serviceKey = `${pkg.packageId}-${service.id}`;
                          const isExpanded = expandedServices.has(serviceKey);
                          return (
                            <div
                              key={service.id}
                              className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                            >
                              <div 
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => toggleService(serviceKey)}
                              >
                                <PlusIcon className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {service.title || `Service ID: ${service.id}`}
                                </p>
                              </div>
                              {isExpanded && (
                                <div className="mt-2 pl-6">
                                  {service.subtitle && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{service.subtitle}</p>
                                  )}
                                  {service.description && (
                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                      {service.description}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </ComponentCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
