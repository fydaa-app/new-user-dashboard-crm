"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { AdminEndpoints } from "@/config/api-endpoints";

interface RoleNameContextValue {
  roleNameMap: { [key: number]: string };
  isLoading: boolean;
}

const RoleNameContext = createContext<RoleNameContextValue | undefined>(undefined);

export function RoleNameProvider({ children }: { children: React.ReactNode }) {
  const [roleNameMap, setRoleNameMap] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoleNameMap = async () => {
      try {
        const response = await apiClient.get<{ success: boolean; data: { [key: number]: string } }>(
          AdminEndpoints.ROLE_NAME_MAP
        );
        if (response.ok && response.data.success) {
          setRoleNameMap(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch role name map:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleNameMap();
  }, []);

  return (
    <RoleNameContext.Provider value={{ roleNameMap, isLoading }}>
      {children}
    </RoleNameContext.Provider>
  );
}

export function useRoleNameMap() {
  const context = useContext(RoleNameContext);
  if (context === undefined) {
    throw new Error("useRoleNameMap must be used within a RoleNameProvider");
  }
  return context;
}
