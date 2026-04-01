"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  // Selected option with localStorage persistence
  const [selectedOption, setSelectedOptionState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedOption") || "monthly";
    }
    return "monthly";
  });

  // Custom dates with localStorage persistence
  const [customDates, setCustomDatesState] = useState<{ start: string; end: string }>(() => {
    if (typeof window !== "undefined") {
      const storedDates = localStorage.getItem("customDates");
      try {
        return storedDates ? JSON.parse(storedDates) : { start: "", end: "" };
      } catch {
        return { start: "", end: "" };
      }
    }
    return { start: "", end: "" };
  });

  // Designation and employee states
  const [selectedDesignation, setSelectedDesignationState] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedDesignation");      
      return stored ? stored : undefined;
    }
    return undefined;
  });

  const [selectedEmployee, setSelectedEmployeeState] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedEmployee");
      return stored ? stored : undefined;
    }
    return undefined;
  });

  const [selectedTeamMember, setSelectedTeamMemberState] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedTeamMember");
      return stored ? stored : undefined;
    }
    return undefined;
  });

  const [selectedType, setSelectedTypeState] = useState<string[] | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedType");
      try {
        return stored ? JSON.parse(stored) : undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  });
  
  // App type with localStorage persistence
  const [appType, setAppTypeState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("appType") || "Fydaa";
    }
    return "Fydaa";
  });

  const [hierarchyViewMode, setHierarchyViewModeState] = useState<"team" | "individual">("team");

  // Auto-sync hierarchyViewMode based on selectedType
  useEffect(() => {
    const typeValue = Array.isArray(selectedType) ? selectedType[0] : selectedType;
    if (typeValue === "team") {
      setHierarchyViewModeState("team");
    } else if (typeValue === "individual" || typeValue === "member") {
      setHierarchyViewModeState("individual");
    }
  }, [selectedType]);

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
      const newDates = { 
        start: dates.start || prev.start, 
        end: dates.end || prev.end 
      };
      
      // Silently accept updates, only validate before using the dates
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

  const setHierarchyViewMode = useCallback((value: "team" | "individual") => {
    setHierarchyViewModeState(value);
  }, []);

  // Sync initial state
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "selectedOption") {
        setSelectedOptionState(e.newValue || "monthly");
      }
      if (e.key === "customDates") {
        try {
          const newDates = e.newValue ? JSON.parse(e.newValue) : { start: "", end: "" };
          setCustomDatesState(newDates);
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
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
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