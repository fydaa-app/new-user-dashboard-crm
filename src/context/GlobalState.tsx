"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCookie } from "cookies-next";
import {
  INVESTMENT_MODEL_STORAGE_KEY,
  InvestmentModelFilter,
} from "@/context/investmentModel";

interface GlobalContextProps {
  selectedOption: string;
  setSelectedOption: (value: string) => void;
  customDates: { start: string; end: string };
  setCustomDates: (dates: { start: string; end: string }) => void;
  validateDates: (start: string, end: string) => boolean;
  selectedDesignation: string | undefined;
  setSelectedDesignation: (value: string | undefined) => void;
  selectedEmployee: string | undefined;
  setSelectedEmployee: (value: string | undefined) => void;
  selectedTeamMember: string | undefined;
  setSelectedTeamMember: (value: string | undefined) => void;
  selectedType: string[] | undefined;
  setSelectedType: (value: string[] | undefined) => void;
  hierarchyViewMode: "team" | "individual";
  setHierarchyViewMode: (value: "team" | "individual") => void;
  appType: string;
  setAppType: (value: string) => void;
  userAppTypeLock: string | null;
  setUserAppTypeLock: (value: string | null) => void;
  investmentModelFilter: InvestmentModelFilter;
  setInvestmentModelFilter: (value: InvestmentModelFilter) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

const HEADER_FILTER_DEFAULTS = {
  selectedOption: "till_date",
  customDates: { start: "", end: "" } as { start: string; end: string },
  selectedType: ["team"] as string[],
  appType: "Fydaa",
  investmentModelFilter: "ALL" as InvestmentModelFilter,
};

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  // AppHeader filters always start at defaults on full page refresh (do not hydrate from localStorage).
  const [selectedOption, setSelectedOptionState] = useState<string>(HEADER_FILTER_DEFAULTS.selectedOption);
  const [customDates, setCustomDatesState] = useState<{ start: string; end: string }>(HEADER_FILTER_DEFAULTS.customDates);
  const [selectedDesignation, setSelectedDesignationState] = useState<string | undefined>(undefined);
  const [selectedEmployee, setSelectedEmployeeState] = useState<string | undefined>(undefined);
  const [selectedTeamMember, setSelectedTeamMemberState] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedTypeState] = useState<string[] | undefined>(HEADER_FILTER_DEFAULTS.selectedType);
  const [appType, setAppTypeState] = useState<string>(HEADER_FILTER_DEFAULTS.appType);
  const [hierarchyViewMode, setHierarchyViewModeState] = useState<"team" | "individual">("team");

  // App type lock with localStorage persistence (not an AppHeader filter — keep cached)
  const [userAppTypeLock, setUserAppTypeLockState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userAppTypeLock");
    }
    return null;
  });

  const [investmentModelFilter, setInvestmentModelFilterState] = useState<InvestmentModelFilter>(
    HEADER_FILTER_DEFAULTS.investmentModelFilter,
  );

  // Overwrite stale header-filter cache on every full page load
  useEffect(() => {
    localStorage.setItem("selectedOption", HEADER_FILTER_DEFAULTS.selectedOption);
    localStorage.setItem("customDates", JSON.stringify(HEADER_FILTER_DEFAULTS.customDates));
    localStorage.setItem("selectedType", JSON.stringify(HEADER_FILTER_DEFAULTS.selectedType));
    localStorage.removeItem("selectedDesignation");
    localStorage.removeItem("selectedEmployee");
    localStorage.removeItem("selectedTeamMember");
    localStorage.setItem(INVESTMENT_MODEL_STORAGE_KEY, HEADER_FILTER_DEFAULTS.investmentModelFilter);
    // Respect lock for appType if present; otherwise force Fydaa default
    const lock = localStorage.getItem("userAppTypeLock");
    if (lock === "Fydaa" || lock === "Savestment") {
      localStorage.setItem("appType", lock);
      setAppTypeState(lock);
    } else {
      localStorage.setItem("appType", HEADER_FILTER_DEFAULTS.appType);
    }
  }, []);

  // Auto-sync hierarchyViewMode based on selectedType
  useEffect(() => {
    const typeValue = Array.isArray(selectedType) ? selectedType[0] : selectedType;
    if (typeValue === "team") {
      setHierarchyViewModeState("team");
    } else if (typeValue === "individual" || typeValue === "member") {
      setHierarchyViewModeState("individual");
    }
  }, [selectedType]);

  // Fetch fresh lock status from backend on mount and periodically
  useEffect(() => {
    let mounted = true;
    
    const fetchFreshLockStatus = async () => {
      try {
        // Check if we have a token/user session
        const token = getCookie("authToken") as string | undefined;
        const userInfo = localStorage.getItem("userInfo");
        if (!token || !userInfo) {
          return;
        }
        
        const userData = JSON.parse(userInfo);
        const employeeId = userData.id;
        
        if (!employeeId) {
          return;
        }
        
        // Call backend to get fresh lock status
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_URL + "/referrals/lock-status/" + employeeId,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!response.ok) {
          console.log('[DEBUG GlobalState] Lock status fetch failed:', response.status);
          return;
        }
        
        const data = await response.json();
        const freshLock = data.appLock;
        console.log('[DEBUG GlobalState] Lock status API response:', { freshLock, data });
        
        // Get current cached lock
        const cachedLock = localStorage.getItem("userAppTypeLock");
        
        // If lock changed (or freshly set), update state and manage cache
        if (freshLock !== cachedLock) {
          console.log('[DEBUG GlobalState] LOCK CHANGED: old=', cachedLock, 'new=', freshLock, 'mounted=', mounted);
          
          if (mounted) {
            setUserAppTypeLockState(freshLock);
          }
          
          if (freshLock !== null) {
            // Lock is ACTIVE (Fydaa or Savestment)
            // Persist the lock
            localStorage.setItem("userAppTypeLock", freshLock);
            
            // Clear conflicting filters so they don't override the lock
            localStorage.removeItem("selectedType");
            localStorage.removeItem("selectedOption");
            localStorage.removeItem("selectedDesignation");
            localStorage.removeItem("selectedEmployee");
            localStorage.removeItem("selectedTeamMember");
            localStorage.removeItem("customDates");
            
            // Force appType to match the lock
            localStorage.setItem("appType", freshLock);
          } else {
            // Lock is REMOVED (NULL) - restore user's free choice
            localStorage.removeItem("userAppTypeLock");
            
            // Restore preferred type if it was saved
            const preferred = localStorage.getItem("userPreferredAppType");
            if (preferred) {
              localStorage.setItem("appType", preferred);
            }
          }
        } else {
          console.log('[DEBUG GlobalState] Lock unchanged: still', freshLock);
        }
      } catch (error) {
        // Silently fail - use cached values
        console.debug("Could not fetch fresh lock status:", error);
      }
    };
    
    // Fetch immediately on mount
    fetchFreshLockStatus();
    
    // Fetch when window regains focus (multi-tab sync)
    const handleFocus = () => fetchFreshLockStatus();
    window.addEventListener("focus", handleFocus);
    
    // Poll every 30 seconds for background updates
    const interval = setInterval(fetchFreshLockStatus, 30000);
    
    return () => {
      mounted = false;
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  const setSelectedOption = useCallback((value: string) => {
    setSelectedOptionState(prev => {
      if (value !== prev) {
        localStorage.setItem("selectedOption", value);
        return value;
      }
      return prev;
    });
  }, []);

  const validateDates = useCallback((start: string, end: string): boolean => {
    if (!start || !end) return false;
    return new Date(start) <= new Date(end);
  }, []);
  

  // Below : rejecting date updates before both dates are properly set (Revert to this commented block if the below code-fix causes Issues.)

  // const setCustomDates = useCallback((dates: { start: string; end: string }) => {
  //   if (!validateDates(dates.start, dates.end)) {
  //     console.error("Invalid date range: Start date must be before end date");
  //     return;
  //   }

  //   setCustomDatesState(prev => {
  //     const newDates = { 
  //       start: dates.start || prev.start, 
  //       end: dates.end || prev.end 
  //     };
      
  //     localStorage.setItem("customDates", JSON.stringify(newDates));
  //     return newDates;
  //   });

  //   setSelectedOption("custom");
  // }, [validateDates, setSelectedOption]);

    const setCustomDates = useCallback((dates: { start: string; end: string }) => {
    setCustomDatesState(prev => {
      const newStart = dates.start || prev.start;
      const newEnd = dates.end || prev.end;

      // Only update if values have actually changed
      if (newStart === prev.start && newEnd === prev.end) {
        return prev;
      }

      const newDates = { 
        start: newStart, 
        end: newEnd 
      };
      
      localStorage.setItem("customDates", JSON.stringify(newDates));
      return newDates;
    });

    // Only log error and switch mode if both dates are present AND invalid
    if (dates.start && dates.end) {
      if (validateDates(dates.start, dates.end)) {
        setSelectedOption("custom");
      } else {
        console.error("Invalid date range: Start date must be before end date");
      }
    }
  }, [validateDates, setSelectedOption]);


  const setSelectedDesignation = useCallback((value: string | undefined) => {
    setSelectedDesignationState(prev => {
      if (value !== prev) {
        if (value !== undefined) {
          localStorage.setItem("selectedDesignation", value);
        } else {
          localStorage.removeItem("selectedDesignation");
        }
        return value;
      }
      return prev;
    });
    setSelectedEmployee(undefined);
    setSelectedTeamMember(undefined);
  }, []);

  const setSelectedEmployee = useCallback((value: string | undefined) => {
    setSelectedEmployeeState(prev => {
      if (value !== prev) {
        if (value !== undefined) {
          localStorage.setItem("selectedEmployee", value);
        } else {
          localStorage.removeItem("selectedEmployee");
        }
        return value;
      }
      return prev;
    });
  }, []);

  const setSelectedTeamMember = useCallback((value: string | undefined) => {
    setSelectedTeamMemberState(prev => {
      if (value !== prev) {
        if (value !== undefined) {
          localStorage.setItem("selectedTeamMember", value);
        } else {
          localStorage.removeItem("selectedTeamMember");
        }
        return value;
      }
      return prev;
    });
  }, []);

  const setSelectedType = useCallback((value: string[] | undefined) => {
    setSelectedTypeState(prev => {
      if (value !== prev) {
        if (value !== undefined) {
          localStorage.setItem("selectedType", JSON.stringify(value));
        } else {
          localStorage.removeItem("selectedType");
        }
        return value;
      }
      return prev;
    });
  }, []);

  const setAppType = useCallback((value: string) => {
    setAppTypeState(prev => {
      if (value !== prev) {
        localStorage.setItem("appType", value);
        return value;
      }
      return prev;
    });
  }, []);

  const setInvestmentModelFilter = useCallback((value: InvestmentModelFilter) => {
    setInvestmentModelFilterState(prev => {
      if (value !== prev) {
        localStorage.setItem(INVESTMENT_MODEL_STORAGE_KEY, value);
        return value;
      }
      return prev;
    });
  }, []);

  const setUserAppTypeLock = useCallback((value: string | null) => {
    setUserAppTypeLockState(prev => {
      if (value !== prev) {
        if (value !== null) {
          // Lock is being SET (Fydaa or Savestment)
          // Backup current appType as user's preference (in case lock is removed later)
          if (appType && appType !== value) {
            localStorage.setItem("userPreferredAppType", appType);
          }
          localStorage.setItem("userAppTypeLock", value);
          
          // Force appType to match the lock
          setAppTypeState(value);
          localStorage.setItem("appType", value);
          
          // Clear conflicting runtime filters back to refresh defaults
          setSelectedTypeState(HEADER_FILTER_DEFAULTS.selectedType);
          setSelectedOptionState(HEADER_FILTER_DEFAULTS.selectedOption);
          setSelectedDesignationState(undefined);
          setSelectedEmployeeState(undefined);
          setSelectedTeamMemberState(undefined);
          setCustomDatesState(HEADER_FILTER_DEFAULTS.customDates);
          
          // Also clear localStorage versions / write defaults
          localStorage.setItem("selectedType", JSON.stringify(HEADER_FILTER_DEFAULTS.selectedType));
          localStorage.setItem("selectedOption", HEADER_FILTER_DEFAULTS.selectedOption);
          localStorage.removeItem("selectedDesignation");
          localStorage.removeItem("selectedEmployee");
          localStorage.removeItem("selectedTeamMember");
          localStorage.setItem("customDates", JSON.stringify(HEADER_FILTER_DEFAULTS.customDates));
          
        } else {
          // Lock is being REMOVED (set to null)
          localStorage.removeItem("userAppTypeLock");
          
          // Restore user's preferred type
          const preferred = localStorage.getItem("userPreferredAppType") || "Fydaa";
          setAppTypeState(preferred);
          localStorage.setItem("appType", preferred);
        }
        return value;
      }
      return prev;
    });
  }, [appType, setAppTypeState, setSelectedTypeState, setSelectedOptionState, setSelectedDesignationState, setSelectedEmployeeState, setSelectedTeamMemberState, setCustomDatesState]);

  const setHierarchyViewMode = useCallback((value: "team" | "individual") => {
    setHierarchyViewModeState(value);
  }, []);

  // Sync initial state
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "selectedOption") {
        setSelectedOptionState(e.newValue || HEADER_FILTER_DEFAULTS.selectedOption);
      }
      if (e.key === "customDates") {
        try {
          const newDates = e.newValue ? JSON.parse(e.newValue) : { start: "", end: "" };
          setCustomDatesState(prev => {
            // Only update if values differ
            if (prev.start === newDates.start && prev.end === newDates.end) {
              return prev;
            }
            return newDates;
          });
        } catch {
          setCustomDatesState({ start: "", end: "" });
        }
      }
      if (e.key === "selectedDesignation") {
        setSelectedDesignationState(e.newValue || undefined);
      }
      if (e.key === "selectedEmployee") {
        setSelectedEmployeeState(e.newValue || undefined);
      }
      if (e.key === "selectedTeamMember") {
        setSelectedTeamMemberState(e.newValue || undefined);
      }
      if (e.key === "appType") {
        setAppTypeState(e.newValue || "Fydaa");
      }
      if (e.key === "userAppTypeLock") {
        setUserAppTypeLockState(e.newValue);
      }
      if (e.key === INVESTMENT_MODEL_STORAGE_KEY) {
        const next = e.newValue;
        setInvestmentModelFilterState(
          next === "RIA" || next === "ARN" || next === "ALL" ? next : "ALL",
        );
      }
    };

    const handleAuthSync = () => {
      const newAppType = localStorage.getItem("appType");
      const newLock = localStorage.getItem("userAppTypeLock");
      
      if (newAppType) {
        setAppTypeState(newAppType);
      }
      setUserAppTypeLockState(newLock);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-storage-sync", handleAuthSync);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-storage-sync", handleAuthSync);
    };
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        selectedOption,
        setSelectedOption,
        customDates,
        setCustomDates,
        validateDates,
        selectedDesignation,
        setSelectedDesignation,
        selectedEmployee,
        setSelectedEmployee,
        selectedTeamMember,
        setSelectedTeamMember,
        selectedType,
        setSelectedType,
        hierarchyViewMode,
        setHierarchyViewMode,
        appType,
        setAppType,
        userAppTypeLock,
        setUserAppTypeLock,
        investmentModelFilter,
        setInvestmentModelFilter,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};