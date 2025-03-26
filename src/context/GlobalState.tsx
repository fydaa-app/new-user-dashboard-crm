"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface GlobalContextProps {
  selectedOption: string;
  setSelectedOption: (value: string) => void;
  customDates: { start: string; end: string };
  setCustomDates: (dates: { start: string; end: string }) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedOption, setSelectedOptionState] = useState<string>(() => {
    // Safely retrieve from localStorage
    if (typeof window !== "undefined") {
      const storedOption = localStorage.getItem("selectedOption");
      return storedOption || "monthly";
    }
    return "monthly";
  });

  const setSelectedOption = useCallback(
    (value: string) => {
      // Ensure the new value is different before updating
      if (value !== selectedOption) {
        console.group("🔍 Selected Option Change");
        console.log("Current Option:", selectedOption);
        console.log("New Option:", value);

        // Set state
        setSelectedOptionState(value);

        // Persist to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedOption", value);
        }

        console.groupEnd();
      }
    },
    [selectedOption]
  );

  const [customDates, setCustomDates] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  // Ensure consistent initial state
  useEffect(() => {
    const storedOption = localStorage.getItem("selectedOption");
    if (storedOption) {
      setSelectedOptionState(storedOption);
    }
  }, []); // No dependency on 'selectedOption'

  return (
    <GlobalContext.Provider
      value={{
        selectedOption,
        setSelectedOption,
        customDates,
        setCustomDates,
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