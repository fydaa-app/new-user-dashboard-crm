"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import { useGlobalContext } from "../context/GlobalState";
import { useRoleNameMap } from "@/context/RoleNameContext";
import { useModal } from "@/hooks/useModal";
import { CustomDateModal } from "@/components/ui/modal/CustomDateModal";
import Cookies from 'js-cookie';
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

const AppHeader: React.FC = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const { userAppTypeLock } = useGlobalContext();
  const { roleNameMap } = useRoleNameMap();
  const isAppTypeLocked = !!userAppTypeLock;
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [designations, setDesignations] = useState<{value: string, label: string}[]>([]);
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
  
  // Team hierarchy states
  const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>([]);
  const [teamSelections, setTeamSelections] = useState<{[key: number]: string}>({});
  const [teamEmployees, setTeamEmployees] = useState<{[key: number]: {value: string, label: string, secondaryLabel?: string}[]}>({});
  const [loadingLevels, setLoadingLevels] = useState<{[key: number]: boolean}>({});

  const { 
    isMobileOpen, 
    toggleSidebar, 
    toggleMobileSidebar 
  } = useSidebar();

  const { 
    selectedOption, 
    setSelectedOption,
    setCustomDates, 
    selectedDesignation,
    setSelectedDesignation,
    selectedEmployee,
    setSelectedEmployee,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedTeamMember,
    setSelectedTeamMember,
    selectedType,
    setSelectedType,
    appType,
    setAppType
  } = useGlobalContext();
  const displayAppType = userAppTypeLock || appType;
  console.log('[DEBUG AppHeader] userAppTypeLock:', userAppTypeLock, 'appType:', appType, 'displayAppType:', displayAppType, 'isLocked:', !!userAppTypeLock);

  // Get user role from token
  const token = Cookies.get('authToken');
  let userRole = '';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role || payload.roleId || '';
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }
  const userRoleLevel = userRole ? parseInt(userRole, 10) : NaN;
  const isPartner = !isNaN(userRoleLevel) && roleNameMap[userRoleLevel]?.toLowerCase() === 'partner';

  // Check if type is team or member (both show hierarchy dropdowns)
  const isTeamType = Array.isArray(selectedType) 
    ? selectedType.includes("team") || selectedType.includes("member")
    : selectedType === "team" || selectedType === "member";

  // Fetch designations on component mount
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
            label: item.hierarchyName
          }));
          setDesignations(designationOptions);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch designations:", error);
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
          console.error("Failed to fetch employees:", error);
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
          console.log('[DEBUG] ═══════════════════════════════════════════════════════════');
          console.log('[DEBUG] useEffect TRIGGERED - selectedEmployee:', selectedEmployee, 'isTeamType:', isTeamType);
          console.log('[DEBUG] Fetching hierarchy levels for employee:', selectedEmployee);
          const response = await apiClient.get<{ success: boolean; data: HierarchyLevel[] }>(
            `/referrals/get-employees-designation/${selectedEmployee}`,
            { signal: controller.signal }
          );

          if (controller.signal.aborted) return;

          console.log('[DEBUG] get-employees-designation response:', response.data);

            if (response.ok && response.data.success) {
            const sortedLevels = response.data.data.sort((a, b) => a.level - b.level);
            console.log('[DEBUG] Sorted hierarchy levels:', sortedLevels);
            
            console.log('[DEBUG] Setting hierarchyLevels to:', sortedLevels);
            setHierarchyLevels(sortedLevels);
            
            // Only clear selections when first loading team type (not when switching team <-> member)
            const currentType = Array.isArray(selectedType) ? selectedType[0] : selectedType;
            if (currentType === "team") {
              console.log('[DEBUG] Clearing teamSelections, teamEmployees, loadingLevels');
              setTeamSelections({});
              setTeamEmployees({});
              setLoadingLevels({});
            }
            
            if (sortedLevels.length > 0) {
              console.log('[DEBUG] About to fetch employees for first level:', sortedLevels[0].level);
              fetchTeamEmployeesForLevel(sortedLevels[0].level, selectedEmployee);
            }
          }
        } catch (error) {
          if (controller.signal.aborted) return;
          console.error("[DEBUG] Failed to fetch hierarchy levels:", error);
          setHierarchyLevels([]);
        }
      };

       fetchHierarchyLevels();
     } else if (!selectedEmployee && isTeamType) {
      // Clear hierarchy states when employee is cleared (e.g., designation changed to empty)
      //console.log('[DEBUG] selectedEmployee cleared, resetting hierarchy states');
      setTeamSelections({});
      setTeamEmployees({});
      setLoadingLevels({});
      setHierarchyLevels([]);
    }
     // Don't clear in else block - let handleTypeChange handle individual clearing
   }, [selectedEmployee, isTeamType]);

  // Self-cancelling controllers for per-level team employee fetches
  const teamEmployeeControllersRef = useRef<{ [key: number]: AbortController }>({});

  // Fetch employees for a specific hierarchy level
  const fetchTeamEmployeesForLevel = useCallback(async (level: number, employeeId: string) => {
    if (teamEmployeeControllersRef.current[level]) {
      teamEmployeeControllersRef.current[level].abort();
    }
    const controller = new AbortController();
    teamEmployeeControllersRef.current[level] = controller;
    
    setLoadingLevels(prev => ({ ...prev, [level]: true }));
    
    try {
      console.log(`[DEBUG] fetchTeamEmployeesForLevel - level: ${level}, employeeId: ${employeeId}`);
      const response = await apiClient.get<{ success: boolean; data: EmployeeItem[] }>(
        `/referrals/get-manager-wise-employes/${employeeId}`,
        { signal: controller.signal }
      );

      if (controller.signal.aborted) return;

      console.log(`[DEBUG] get-manager-wise-employes/${employeeId} response:`, response.data);

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
        
        console.log(`[DEBUG] Employee options for level ${level}:`, employeeOptions);
        setTeamEmployees(prev => ({
          ...prev,
          [level]: employeeOptions
        }));
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error(`Failed to fetch employees for level ${level}:`, error);
      setTeamEmployees(prev => ({
        ...prev,
        [level]: []
      }));
    } finally {
      if (!controller.signal.aborted) {
        setLoadingLevels(prev => ({ ...prev, [level]: false }));
      }
      if (teamEmployeeControllersRef.current[level] === controller) {
        delete teamEmployeeControllersRef.current[level];
      }
    }
  }, [roleNameMap]);

  const hierarchyLevelAbortRef = useRef<AbortController | null>(null);

  // Fetch hierarchy levels for a specific employee (used when selecting from hierarchy dropdowns)
  const fetchHierarchyLevelsForEmployee = useCallback(async (employeeId: string) => {
    if (hierarchyLevelAbortRef.current) {
      hierarchyLevelAbortRef.current.abort();
    }
    const controller = new AbortController();
    hierarchyLevelAbortRef.current = controller;
    
    try {
      console.log(`[DEBUG] fetchHierarchyLevelsForEmployee - employeeId: ${employeeId}`);
      const response = await apiClient.get<{ success: boolean; data: HierarchyLevel[] }>(
        `/referrals/get-employees-designation/${employeeId}`,
        { signal: controller.signal }
      );

      if (controller.signal.aborted) return [];

      console.log(`[DEBUG] get-employees-designation/${employeeId} response:`, response.data);

      if (response.ok && response.data.success) {
        const sortedLevels = response.data.data.sort((a, b) => a.level - b.level);
        console.log(`[DEBUG] New hierarchy levels for employee ${employeeId}:`, sortedLevels);
        return sortedLevels;
      }
    } catch (error) {
      if (controller.signal.aborted) return [];
      console.error("Failed to fetch hierarchy levels:", error);
    }
    return [];
  }, []);

  // Handle team employee selection at a specific level
  const handleTeamEmployeeChange = useCallback((level: number, option: { value: string; label: string } | null) => {
    const newValue = option?.value || "";
    console.log(`[DEBUG] ═══════════════════════════════════════════════════════════`);
    console.log(`[DEBUG] handleTeamEmployeeChange START - level: ${level}, selected value: '${newValue}'`);
    console.log(`[DEBUG] Current hierarchyLevels BEFORE:`, hierarchyLevels);
    console.log(`[DEBUG] Current teamSelections BEFORE:`, teamSelections);
    console.log(`[DEBUG] Current teamEmployees BEFORE:`, teamEmployees);
    
    // Update teamSelections
    console.log(`[DEBUG] STEP 1: About to update teamSelections`);
    setTeamSelections(prev => {
      const updated = { ...prev, [level]: newValue };
      console.log(`[DEBUG] STEP 1: teamSelections set to:`, updated);
      return updated;
    });

    // Clear subsequent levels from teamSelections
    console.log(`[DEBUG] STEP 2: About to clear subsequent levels from teamSelections`);
    setTeamSelections(prev => {
      const updated = { ...prev };
      hierarchyLevels.forEach((hl) => {
        if (hl.level > level) {
          console.log(`[DEBUG] STEP 2: Deleting level ${hl.level} from teamSelections`);
          delete updated[hl.level];
        }
      });
      console.log(`[DEBUG] STEP 2: teamSelections AFTER CLEAR:`, updated);
      return updated;
    });

    // Clear subsequent level data from teamEmployees
    console.log(`[DEBUG] STEP 3: About to clear teamEmployees for levels > ${level}`);
    setTeamEmployees(prev => {
      const updated = { ...prev };
      hierarchyLevels.forEach((hl) => {
        if (hl.level > level) {
          console.log(`[DEBUG] STEP 3: Deleting level ${hl.level} from teamEmployees`);
          delete updated[hl.level];
        }
      });
      console.log(`[DEBUG] STEP 3: teamEmployees AFTER CLEAR:`, updated);
      return updated;
    });

    console.log(`[DEBUG] STEP 4: About to clear loadingLevels`);
    setLoadingLevels(prev => {
      const updated = { ...prev };
      hierarchyLevels.forEach((hl) => {
        if (hl.level > level) {
          console.log(`[DEBUG] STEP 4: Deleting level ${hl.level} from loadingLevels`);
          delete updated[hl.level];
        }
      });
      return updated;
    });

    // Update selectedTeamMember to trigger dashboard updates
    if (newValue) {
      console.log(`[DEBUG] Setting selectedTeamMember to: ${newValue}`);
      setSelectedTeamMember(newValue);
    } else {
      console.log(`[DEBUG] Clearing selectedTeamMember`);
      setSelectedTeamMember(undefined);
    }

    // Check if this is the last level in hierarchy
    const currentIndex = hierarchyLevels.findIndex(hl => hl.level === level);
    const isLastLevel = currentIndex === hierarchyLevels.length - 1;
    console.log(`[DEBUG] currentIndex: ${currentIndex}, isLastLevel: ${isLastLevel}`);

    // Fetch next level employees if selection exists and not last level
    if (newValue && !isLastLevel) {
      if (currentIndex !== -1 && currentIndex < hierarchyLevels.length - 1) {
        const nextLevel = hierarchyLevels[currentIndex + 1];
        console.log(`[DEBUG] ═══════════════════════════════════════════════════════════`);
        console.log(`[DEBUG] FETCHING NEXT LEVEL - nextLevel: ${nextLevel.level}, employeeId: ${newValue}`);
        
        // First: Fetch employees for next level
        fetchTeamEmployeesForLevel(nextLevel.level, newValue);
        
        // Second: Fetch fresh hierarchy levels for the newly selected employee
        fetchHierarchyLevelsForEmployee(newValue).then((newLevels) => {
          console.log(`[DEBUG] fetchHierarchyLevelsForEmployee returned:`, newLevels);
          if (newLevels.length > 0) {
            console.log(`[DEBUG] ═══════════════════════════════════════════════════════════`);
            console.log(`[DEBUG] ABOUT TO UPDATE hierarchyLevels`);
            console.log(`[DEBUG] OLD hierarchyLevels:`, hierarchyLevels);
            console.log(`[DEBUG] NEW hierarchyLevels (from API):`, newLevels);
            
            // Keep ALL original levels AND add new levels from API
            // But filter out duplicates by level to avoid React key errors
            const combinedLevels = [
              ...hierarchyLevels,
              ...newLevels.filter(newLevel => 
                !hierarchyLevels.some(existing => existing.level === newLevel.level)
              )
            ];
            
            console.log(`[DEBUG] COMBINED hierarchyLevels (keeping ALL, no duplicates):`, combinedLevels);
            setHierarchyLevels(combinedLevels);
            
            // Keep current selection plus any existing selections
            setTeamSelections(prev => {
              const updated = { ...prev, [level]: newValue };
              console.log(`[DEBUG] Updated teamSelections:`, updated);
              return updated;
            });
            
            // Keep existing employees, only clear loadingLevels
            setLoadingLevels({});
            
            // Fetch employees only for levels that don't already have data
            newLevels.forEach((newLevel) => {
              const existingEmployees = teamEmployees[newLevel.level];
              if (!existingEmployees || existingEmployees.length === 0) {
                console.log(`[DEBUG] FETCHING employees for new level: ${newLevel.level}, employeeId: ${newValue}`);
                fetchTeamEmployeesForLevel(newLevel.level, newValue);
              } else {
                console.log(`[DEBUG] SKIP FETCHING - employees already exist for level: ${newLevel.level}`);
              }
            });
          } else {
            console.log(`[DEBUG] No new hierarchy levels returned (newLevels is empty)`);
          }
        });
      }
    } else {
      console.log(`[DEBUG] SKIPPING API CALLS - newValue: '${newValue}', isLastLevel: ${isLastLevel}`);
    }
    
    console.log(`[DEBUG] handleTeamEmployeeChange END`);
    console.log(`[DEBUG] ═══════════════════════════════════════════════════════════`);
  }, [hierarchyLevels, fetchTeamEmployeesForLevel, fetchHierarchyLevelsForEmployee, setSelectedTeamMember]);

  const handleToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const options = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "till_date", label: "Till Date" },
    { value: "custom", label: "Custom Date" },
  ];

  const appTypeOptions = [
    { value: "Fydaa", label: "Fydaa" },
    { value: "Savestment", label: "Savestment" },
  ];

  const typeOptions = [
    { value: "team", label: "Team" },
    { value: "member", label: "Member" },
    { value: "individual", label: "Individual" }
  ];

  const handleSelectChange = useCallback((option: { value: string; label: string } | null) => {     
    if (option) {
      setSelectedOption(option.value);
      if (option.value === "custom") {
        openModal();
      } else {
        setCustomDates({ start: "", end: "" });
      }
    }    
  }, [setSelectedOption, setCustomDates, openModal]);

  const handleDesignationChange = useCallback((option: { value: string; label: string } | null) => {
    const newValue = option?.value || "";
    setSelectedDesignation(newValue);
    if (newValue === "") {
      setSelectedEmployee("");
    }
  }, [setSelectedDesignation, setSelectedEmployee]);

  const handleEmployeeChange = useCallback((option: { value: string; label: string } | null) => {
    const employeeId = option?.value || "";

    // Selecting from the main employee dropdown means we are returning to
    // that employee as the active root. Clear any lower hierarchy selection
    // explicitly, because selectedEmployee may already have the same value
    // (for example A -> child B -> A), in which case the selectedEmployee
    // useEffect would not run again to reset the hierarchy UI.
    Object.values(teamEmployeeControllersRef.current).forEach((controller) => {
      controller.abort();
    });
    teamEmployeeControllersRef.current = {};

    if (hierarchyLevelAbortRef.current) {
      hierarchyLevelAbortRef.current.abort();
      hierarchyLevelAbortRef.current = null;
    }

    setTeamSelections({});
    //setTeamEmployees({});
    setLoadingLevels({});
    //setHierarchyLevels([]);

    setSelectedEmployee(employeeId);
    setSelectedTeamMember(employeeId || undefined);
  }, [setSelectedEmployee, setSelectedTeamMember]);
    
  const handleTypeChange = useCallback((option: { value: string; label: string } | null) => {
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
  }, [setSelectedType, setSelectedTeamMember, setSelectedEmployee]);

  const handleAppTypeChange = useCallback((option: { value: string; label: string } | null) => {
    if (option) {
      setAppType(option.value);
    }
  }, [setAppType]);

  // const handleSaveDates = () => {
  //   if (validateDates(startDate, endDate)) {      
  //     setCustomDates({ start: startDate, end: endDate });
  //     closeModal();
  //   } else {
  //     alert("Invalid date range: Start date must be before end date");
  //   }
  // };
    const handleApplyCustomDates = (start: string, end: string) => {
    setCustomDates({ start, end });
    closeModal();
  };


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // useEffect(() => {
  //   if (isOpen) {
  //     setStartDate(customDates.start);
  //     setEndDate(customDates.end);
  //   }
  // }, [isOpen, customDates]);

  // Set default type to "team" if not already set
  useEffect(() => {
    const currentType = Array.isArray(selectedType) ? selectedType[0] : selectedType;
    if (!currentType) {
      setSelectedType(["team"]);
    }
  }, [selectedType, setSelectedType]);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-[99999] dark:border-gray-800 dark:bg-gray-900 lg:border-b overflow-visible">
      <div className="flex flex-col w-full lg:px-6">
        {/* Container for Row 1 and Row 2 - Always column layout */}
        <div className="flex flex-col w-full">
          {/* Row 1: Filters on left, Icons on right - Single horizontal line */}
          <div
            className={`flex items-center w-full px-5 py-4 lg:px-0 overflow-x-auto lg:overflow-visible ${
              isApplicationMenuOpen ? "flex" : "hidden"
            } lg:flex`}
          >
            {/* Left side: All filters except date - Single horizontal line, left-aligned */}
            <div className="flex flex-1 items-center gap-3 lg:gap-4 flex-nowrap overflow-x-auto lg:flex-wrap lg:overflow-visible min-w-0">
              {/* App Type Select */}
              {!isAppTypeLocked && (
                <div className="relative w-40 flex-shrink-0">
                  <Select 
                    options={appTypeOptions}
                    placeholder="Select App Type"
                    onChange={handleAppTypeChange}
                    value={appType || null}
                    menuAlign="left"
                    className="dark:bg-dark-900"
                    key={`apptype-${appType}`}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon/>
                  </span>
                </div>
              )}

              {/* Type Select - Second position, default to "team" */}
              <div className="relative w-40 flex-shrink-0">
                <Select 
                  options={typeOptions}
                  placeholder="Select Type"
                  onChange={handleTypeChange}
                  value={Array.isArray(selectedType) ? (selectedType[0] || null) : selectedType || "team"}
                  menuAlign="left"
                  className="dark:bg-dark-900"
                  key={`type-${Array.isArray(selectedType) ? selectedType[0] : selectedType}`}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon/>
                </span>
              </div>

              {/* Designation Select - Hidden for Partners and when type is Individual */}
              {!isPartner && isTeamType && (
                <div className="relative w-40 flex-shrink-0">
                  <Select 
                    options={designations}
                    placeholder={isLoadingDesignations ? "Loading..." : "Select Designation"}
                    onChange={handleDesignationChange}
                    value={selectedDesignation || null}
                    className="dark:bg-dark-900"
                    menuAlign="left"
                    isDisabled={isLoadingDesignations}
                    key={`designation-${selectedDesignation}`}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon/>
                  </span>
                </div>
              )}

              {/* Employee Select - Hidden for Partners and when type is Individual */}
              {!isPartner && isTeamType && (
                <div className="relative w-40 flex-shrink-0">
                  <Select 
                    options={employees}
                    placeholder={
                      !selectedDesignation ? "Select designation first" : 
                      isLoadingEmployees ? "Loading..." : "Select Employee"
                    }
                    onChange={handleEmployeeChange}
                    value={selectedEmployee || null}
                    menuAlign="left"
                    className="dark:bg-dark-900"
                    isDisabled={!selectedDesignation || isLoadingEmployees}
                    key={`employee-${selectedEmployee}-${selectedDesignation}`}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon/>
                  </span>
                </div>
              )}

              {/* Dynamic Team Hierarchy Dropdowns */}
              {isTeamType && hierarchyLevels.map((hierarchy, index) => {
                const previousLevel = index > 0 ? hierarchyLevels[index - 1].level : null;
                const shouldShow = index === 0 || (previousLevel !== null && teamSelections[previousLevel]);
                
                if (!shouldShow) {
                  return null;
                }

                const hasEmployees = teamEmployees[hierarchy.level] && teamEmployees[hierarchy.level].length > 0;
                const isLoading = loadingLevels[hierarchy.level];

                console.log(`[DEBUG RENDER] hasEmployees: ${hasEmployees}, isLoading: ${isLoading}, index: ${index}`);
                console.log(`[DEBUG RENDER] About to render dropdown for level ${hierarchy.level}`);

                return (
                  <div key={`hierarchy-${hierarchy.level}`} className="relative w-40 flex-shrink-0">
                    <Select 
                      options={teamEmployees[hierarchy.level] || []}
                      placeholder={
                        isLoading
                          ? "Loading..." 
                          : !hasEmployees && index > 0
                          ? `No Employee`
                          : "Select Employee"
                      }
                      onChange={(option) => handleTeamEmployeeChange(hierarchy.level, option)}
                      value={teamSelections[hierarchy.level] || null}
                      className="dark:bg-dark-900"
                      menuAlign="left"
                      isDisabled={isLoading || (!hasEmployees && index > 0)}
                      key={`team-${hierarchy.level}-${teamSelections[hierarchy.level]}`}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon/>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right side: Theme Toggle, Notification, User Dropdown */}
            <div className="flex items-center gap-2 2xsm:gap-3 ml-auto flex-shrink-0 overflow-visible">            
              <ThemeToggleButton />           
              <NotificationDropdown />
              <UserDropdown />
            </div>
          </div>

          {/* Row 2: Sidebar/Logo/Burger on left, Date filter on right */}
          <div className={`flex items-center justify-between w-full gap-2 px-3 py-3 sm:gap-4 lg:px-0 lg:py-4 overflow-x-auto lg:overflow-visible ${
              isApplicationMenuOpen ? "flex" : "hidden"
            } lg:flex`}
          >
            {/* Left side: Sidebar/Logo/Burger */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                className="flex items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-[99999] dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11 lg:border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={handleToggle}
                aria-label="Toggle Sidebar"
              >
                {isMobileOpen ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="12"
                    viewBox="0 0 16 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>

              <Link href="/" className="lg:hidden">
                <Image
                  width={154}
                  height={32}
                  className="dark:hidden"
                  src="/images/logo/logo2.png"
                  alt="Logo"
                />
                <Image
                  width={154}
                  height={32}
                  className="hidden dark:block"
                  src="/images/logo/logo.png"
                  alt="Logo"
                />
              </Link>

              <button
                onClick={toggleApplicationMenu}
                className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-[99999] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>

            {/* Right side: Date filter */}
            <div className="relative w-40 flex-shrink-0">
              <Select 
                options={options}
                placeholder="Select Option"
                onChange={handleSelectChange}
                menuAlign="left"
                value={selectedOption || null}
                className="dark:bg-dark-900"
                key={`dateoption-${selectedOption}`}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon/>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Date Modal */}
            {/* Custom Date Modal */}
      <CustomDateModal
        isOpen={isOpen}
        onClose={closeModal}
        onApply={handleApplyCustomDates}
      />

    </header>
  );
};

export default AppHeader;