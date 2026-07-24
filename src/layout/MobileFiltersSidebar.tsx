"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import { useGlobalContext } from "@/context/GlobalState";
import { useRoleNameMap } from "@/context/RoleNameContext";
import { useSidebar } from "@/context/SidebarContext";
import { apiClient } from "@/services/api-client";
import { AdminEndpoints } from "@/config/api-endpoints";

interface DesignationItem {
  level: number;
  hierarchyName: string;
}

interface EmployeeItem {
  id: number;
  name: string;
  role?: number;
}

interface HierarchyLevel {
  hierarchyName: string;
  level: number;
}

const typeOptions = [
  { value: "team", label: "Team" },
  { value: "member", label: "Member" },
  { value: "individual", label: "Individual" },
];

const MobileFiltersSidebar: React.FC = () => {
  const {
    selectedDesignation,
    setSelectedDesignation,
    selectedEmployee,
    setSelectedEmployee,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedTeamMember,
    setSelectedTeamMember,
    selectedType,
    setSelectedType,
    selectedOption,
    setSelectedOption,
    customDates,
    setCustomDates,
    validateDates,
    appType,
    setAppType,
    userAppTypeLock,
  } = useGlobalContext();

  const { isMobileFiltersOpen, toggleMobileFilters } = useSidebar();

  const { roleNameMap } = useRoleNameMap();

  // Local state for dropdown data (same as desktop header)
  const [designations, setDesignations] = useState<{ value: string; label: string }[]>([]);
  const [rawEmployees, setRawEmployees] = useState<EmployeeItem[]>([]);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const employees = useMemo(() => {
    return rawEmployees
      .map((item) => ({
        value: item.id.toString(),
        label: item.name,
        secondaryLabel: item.role !== undefined ? (roleNameMap[item.role] || "Unknown") : undefined
      }))
      .sort((a, b) => {
        const roleCompare = (a.secondaryLabel || "").localeCompare(b.secondaryLabel || "");
        if (roleCompare !== 0) return roleCompare;
        return a.label.localeCompare(b.label);
      });
  }, [rawEmployees, roleNameMap]);

  const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>([]);
  const [teamSelections, setTeamSelections] = useState<{ [key: number]: string }>({});
  const [teamEmployees, setTeamEmployees] = useState<{ [key: number]: { value: string; label: string; secondaryLabel?: string }[] }>(
    {}
  );
  const [loadingLevels, setLoadingLevels] = useState<{ [key: number]: boolean }>({});

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isTeamType = Array.isArray(selectedType)
    ? selectedType.includes("team") || selectedType.includes("member")
    : selectedType === "team" || selectedType === "member";

  // Fetch designations on mount
  useEffect(() => {
    const controller = new AbortController();

    const fetchDesignations = async () => {
      setIsLoadingDesignations(true);
      try {
        const response = await apiClient.get<{ success: boolean; data: DesignationItem[] }>(
          AdminEndpoints.DESIGNATION_LIST,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;

        if (response.ok && response.data.success) {
          const designationOptions = response.data.data.map((item: DesignationItem) => ({
            value: item.level.toString(),
            label: item.hierarchyName,
          }));
          setDesignations(designationOptions);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch designations (mobile):", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDesignations(false);
        }
      }
    };

    fetchDesignations();

    return () => controller.abort();
  }, []);

  // Fetch employees when designation changes
  useEffect(() => {
    const controller = new AbortController();

    if (selectedDesignation) {
      const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        setSelectedEmployee(""); // Reset employee selection
        try {
          const endpoint = `${AdminEndpoints.ROLE_WISE_EMPLOYEE_LIST}?role=${selectedDesignation}`;
          const response = await apiClient.get<{ success: boolean; data: EmployeeItem[] }>(
            endpoint,
            { signal: controller.signal }
          );

          if (controller.signal.aborted) return;

          if (response.ok && response.data.success) {
            setRawEmployees(response.data.data);
          }
        } catch (error) {
          if (controller.signal.aborted) return;
          console.error("Failed to fetch employees (mobile):", error);
          setRawEmployees([]);
        } finally {
          if (!controller.signal.aborted) {
            setIsLoadingEmployees(false);
          }
        }
      };

      fetchEmployees();
    } else {
      setRawEmployees([]);
      setSelectedEmployee("");
    }

    return () => controller.abort();
  }, [selectedDesignation, setSelectedEmployee]);

  // Fetch hierarchy levels when employee and team type are selected
  useEffect(() => {
    const controller = new AbortController();

    if (selectedEmployee && isTeamType) {
      const fetchHierarchyLevels = async () => {
        try {
          const response = await apiClient.get<{ success: boolean; data: HierarchyLevel[] }>(
            `/referrals/get-employees-designation/${selectedEmployee}`,
            { signal: controller.signal }
          );

          if (controller.signal.aborted) return;

          if (response.ok && response.data.success) {
            const sortedLevels = response.data.data.sort((a, b) => a.level - b.level);
            setHierarchyLevels(sortedLevels);
            
            // Only clear selections when first loading team type
            const currentType = Array.isArray(selectedType) ? selectedType[0] : selectedType;
            if (currentType === "team") {
              setTeamSelections({});
              setTeamEmployees({});
              setLoadingLevels({});
            }

            if (sortedLevels.length > 0) {
              fetchTeamEmployeesForLevel(sortedLevels[0].level, selectedEmployee);
            }
          }
        } catch (error) {
          if (controller.signal.aborted) return;
          console.error("Failed to fetch hierarchy levels (mobile):", error);
          setHierarchyLevels([]);
        }
      };

      fetchHierarchyLevels();
    } else if (!selectedEmployee && isTeamType) {
      // Clear stale hierarchy UI when the root employee is cleared (e.g. designation change).
      setHierarchyLevels([]);
      setTeamSelections({});
      setTeamEmployees({});
      setLoadingLevels({});
    }
  }, [selectedEmployee, isTeamType]);

  // Self-cancelling controllers for per-level team employee fetches
  const teamEmployeeControllersRef = useRef<{ [key: number]: AbortController }>({});

  // Fetch employees for a specific hierarchy level
  const fetchTeamEmployeesForLevel = useCallback(
    async (level: number, employeeId: string) => {
      if (teamEmployeeControllersRef.current[level]) {
        teamEmployeeControllersRef.current[level].abort();
      }
      const controller = new AbortController();
      teamEmployeeControllersRef.current[level] = controller;

      setLoadingLevels((prev) => ({ ...prev, [level]: true }));

      try {
        const response = await apiClient.get<{ success: boolean; data: EmployeeItem[] }>(
          `/referrals/get-manager-wise-employes/${employeeId}`,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;

        if (response.ok && response.data.success) {
          const employeeOptions = response.data.data
            .map((item: EmployeeItem) => ({
              value: item.id.toString(),
              label: item.name,
              secondaryLabel: item.role !== undefined ? (roleNameMap[item.role] || "Unknown") : undefined
            }))
            .sort((a, b) => {
              const roleCompare = (a.secondaryLabel || "").localeCompare(b.secondaryLabel || "");
              if (roleCompare !== 0) return roleCompare;
              return a.label.localeCompare(b.label);
            });

          setTeamEmployees((prev) => ({
            ...prev,
            [level]: employeeOptions,
          }));
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(`Failed to fetch employees for level ${level} (mobile):`, error);
        setTeamEmployees((prev) => ({
          ...prev,
          [level]: [],
        }));
      } finally {
        if (!controller.signal.aborted) {
          setLoadingLevels((prev) => ({ ...prev, [level]: false }));
        }
        if (teamEmployeeControllersRef.current[level] === controller) {
          delete teamEmployeeControllersRef.current[level];
        }
      }
    },
    [roleNameMap]
  );

  const handleDesignationChange = useCallback(
    (option: { value: string; label: string } | null) => {
      const newValue = option?.value || "";
      setSelectedDesignation(newValue);
      if (newValue === "") {
        setSelectedEmployee("");
      }
    },
    [setSelectedDesignation, setSelectedEmployee]
  );

  const handleEmployeeChange = useCallback(
    (option: { value: string; label: string } | null) => {
      const employeeId = option?.value || "";

      // Reset only child hierarchy selections when re-selecting the main employee.
      // Keep hierarchyLevels/teamEmployees so the hierarchy dropdown remains visible.
      setTeamSelections({});
      setSelectedEmployee(employeeId);
      setSelectedTeamMember(employeeId || undefined);
    },
    [setSelectedEmployee, setSelectedTeamMember]
  );

  const handleTypeChange = useCallback(
    (option: { value: string; label: string } | null) => {
      if (option) {
        setSelectedType([option.value]);
        if (option.value === "individual") {
          setSelectedEmployee("");
          setSelectedTeamMember(undefined);
          setTeamSelections({});
          setTeamEmployees({});
          setHierarchyLevels([]);
        }
      }
    },
    [setSelectedType, setSelectedTeamMember, setSelectedEmployee]
  );

  const handleAppTypeChange = useCallback(
    (option: { value: string; label: string } | null) => {
      if (option) {
        setAppType(option.value);
      }
    },
    [setAppType]
  );

  // Handle team employee selection at a specific level
  const handleTeamEmployeeChange = useCallback(
    (level: number, option: { value: string; label: string } | null) => {
      const newValue = option?.value || "";

      setTeamSelections((prev) => {
        const updated = { ...prev, [level]: newValue };

        hierarchyLevels.forEach((hl) => {
          if (hl.level > level) {
            delete updated[hl.level];
          }
        });

        return updated;
      });

      setTeamEmployees((prev) => {
        const updated = { ...prev };
        hierarchyLevels.forEach((hl) => {
          if (hl.level > level) {
            delete updated[hl.level];
          }
        });
        return updated;
      });

      setLoadingLevels((prev) => {
        const updated = { ...prev };
        hierarchyLevels.forEach((hl) => {
          if (hl.level > level) {
            delete updated[hl.level];
          }
        });
        return updated;
      });

      if (newValue) {
        setSelectedTeamMember(newValue);
      } else {
        setSelectedTeamMember(undefined);
      }

      const currentIndex = hierarchyLevels.findIndex((hl) => hl.level === level);
      const isLastLevel = currentIndex === hierarchyLevels.length - 1;

      if (newValue && !isLastLevel) {
        if (currentIndex !== -1 && currentIndex < hierarchyLevels.length - 1) {
          const nextLevel = hierarchyLevels[currentIndex + 1];
          fetchTeamEmployeesForLevel(nextLevel.level, newValue);
        }
      }
    },
    [hierarchyLevels, fetchTeamEmployeesForLevel, setSelectedTeamMember]
  );

  // Update local date state when sidebar opens and customDates are available
  useEffect(() => {
    if (isMobileFiltersOpen) {
      setStartDate(customDates.start);
      setEndDate(customDates.end);
    }
  }, [isMobileFiltersOpen, customDates]);

  return (
    <>
      {/* Sidebar panel - rendered at root level to avoid parent constraints */}
      {isMobileFiltersOpen && (
        <div 
          className="fixed mt-16 inset-x-0 bottom-0 z-49 lg:hidden top-0" 
          style={{ 
            overflow: 'hidden'
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={toggleMobileFilters}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }}
          />

          {/* Panel - positioned from right edge, constrained to viewport */}
          <div 
            className="absolute right-0 top-0 bottom-0 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 px-4 pb-4 flex flex-col gap-4 overflow-y-auto"
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '80%',
              maxWidth: '384px',
              minWidth: 0,
            }}
          >
            <div className="flex items-center justify-between mb-2 pt-2">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Filters
              </h2>
              <button
                type="button"
                onClick={toggleMobileFilters}
                aria-label="Close filters"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4 pr-1">
              {/* Date Range - first filter */}
              <div className="relative">
                <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                  Date Range
                </label>
                <Select
                  options={[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                    { value: "till_date", label: "Till Date" },
                    { value: "custom", label: "Custom Date" },
                  ]}
                  placeholder="Select Option"
                  onChange={(option) => {
                    if (!option) return;
                    setSelectedOption(option.value);
                    if (option.value !== "custom") {
                      setCustomDates({ start: "", end: "" });
                    }
                  }}
                  value={selectedOption || null}
                  menuAlign="left"
                  className="dark:bg-dark-900"
                  key={`mobile-dateoption-${selectedOption}`}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-[2.35rem] dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>

              {/* Custom Date Range (only when custom selected) */}
              {selectedOption === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-2 py-2 text-sm border rounded-md border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-2 py-2 text-sm border rounded-md border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="col-span-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
                    onClick={() => {
                      if (validateDates(startDate, endDate)) {
                        setCustomDates({ start: startDate, end: endDate });
                        toggleMobileFilters();
                      } else {
                        alert("Invalid date range: Start date must be before end date");
                      }
                    }}
                  >
                    Apply Date Range
                  </button>
                </div>
              )}

              {/* App Type */}
              {!userAppTypeLock && (
                <div className="relative">
                  <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    App Type
                  </label>
                  <Select
                    options={[
                      { value: "Fydaa", label: "Fydaa" },
                      { value: "Savestment", label: "Savestment" },
                    ]}
                    placeholder="Select App Type"
                    onChange={handleAppTypeChange}
                    value={appType || null}
                    menuAlign="left"
                    className="dark:bg-dark-900"
                    key={`mobile-apptype-${appType}`}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-[2.35rem] dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              )}

              {/* Type */}
              <div className="relative">
                <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                  Type
                </label>
                <Select
                  options={typeOptions}
                  placeholder="Select Type"
                  onChange={handleTypeChange}
                  value={Array.isArray(selectedType) ? (selectedType[0] || null) : selectedType || "team"}
                  menuAlign="left"
                  className="dark:bg-dark-900"
                  key={`mobile-type-${Array.isArray(selectedType) ? selectedType[0] : selectedType}`}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-[2.35rem] dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>

              {/* Designation */}
              {isTeamType && (
                <div className="relative">
                  <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    Designation
                  </label>
                  <Select
                    options={designations}
                    placeholder={isLoadingDesignations ? "Loading..." : "Select Designation"}
                    onChange={handleDesignationChange}
                    value={selectedDesignation || null}
                    className="dark:bg-dark-900"
                    menuAlign="left"
                    isDisabled={isLoadingDesignations}
                    key={`mobile-designation-${selectedDesignation}`}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-[2.35rem] dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              )}

              {/* Employee */}
              {isTeamType && (
                <div className="relative">
                  <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    Employee
                  </label>
                  <Select
                    options={employees}
                    placeholder={
                      !selectedDesignation
                        ? "Select designation first"
                        : isLoadingEmployees
                        ? "Loading..."
                        : "Select Employee"
                    }
                    onChange={handleEmployeeChange}
                    value={selectedEmployee || null}
                    menuAlign="left"
                    className="dark:bg-dark-900"
                    isDisabled={!selectedDesignation || isLoadingEmployees}
                    key={`mobile-employee-${selectedEmployee}-${selectedDesignation}`}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-[2.35rem] dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              )}

              {/* Dynamic Team Hierarchy Dropdowns */}
              {isTeamType &&
                hierarchyLevels.map((hierarchy, index) => {
                  const previousLevel = index > 0 ? hierarchyLevels[index - 1].level : null;
                  const shouldShow =
                    index === 0 || (previousLevel !== null && teamSelections[previousLevel]);

                  if (!shouldShow) return null;

                  const hasEmployees =
                    teamEmployees[hierarchy.level] && teamEmployees[hierarchy.level].length > 0;
                  const isLoading = loadingLevels[hierarchy.level];

                  return (
                    <div key={`mobile-hierarchy-${hierarchy.level}`} className="relative">
                      <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                        Employee
                      </label>
                      <Select
                        options={teamEmployees[hierarchy.level] || []}
                        placeholder={
                          isLoading
                            ? "Loading..."
                            : !hasEmployees && index > 0
                            ? "No Employee"
                            : "Select Employee"
                        }
                        onChange={(option) => handleTeamEmployeeChange(hierarchy.level, option)}
                        value={teamSelections[hierarchy.level] || null}
                        className="dark:bg-dark-900"
                        menuAlign="left"
                        isDisabled={isLoading || (!hasEmployees && index > 0)}
                        key={`mobile-team-${hierarchy.level}-${teamSelections[hierarchy.level]}`}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileFiltersSidebar;


