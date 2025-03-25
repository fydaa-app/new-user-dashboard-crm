"use client"; 
import React, { createContext, useContext, useState } from "react";

interface GlobalContextProps {
  selectedOption: string;
  setSelectedOption: (value: string) => void;
  customDates: { start: string; end: string };
  setCustomDates: (dates: { start: string; end: string }) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [customDates, setCustomDates] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  return (
    <GlobalContext.Provider
      value={{ selectedOption, setSelectedOption, customDates, setCustomDates }}
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