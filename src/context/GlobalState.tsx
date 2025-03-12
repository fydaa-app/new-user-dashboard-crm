"use client"; 
import React, { createContext, useContext, useState } from "react";

interface GlobalContextProps {
  selectedOption: string;
  setSelectedOption: (value: string) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedOption, setSelectedOption] = useState<string>("");

  return (
    <GlobalContext.Provider value={{ selectedOption, setSelectedOption }}>
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
