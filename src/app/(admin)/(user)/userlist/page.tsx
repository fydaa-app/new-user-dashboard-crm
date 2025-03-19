// app/transaction-tables/page.tsx
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserListTable from "@/components/tables/UserListTable";
import { cookies } from "next/headers";

interface User {
  userName: string;
  mobileNumber: string;
  planName: string;
  managerName: string;
  onboardingDate: string;
  netWorth: string;
}

interface APIResponse {
  success: boolean;
  users: User[];
}

async function fetchUsers(): Promise<{ users: User[]; error: string | null }> {
    try {
        const cookieStore = await cookies(); // Await the cookies() function
        const AUTH_TOKEN = cookieStore.get("authToken")?.value || "";
        
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_USER_LIST_ENDPOINT}`,
            {
            headers: {
                Authorization: `Bearer ${AUTH_TOKEN}`,
            }
            }
        );
  
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      console.log(await response.json());
      const data: APIResponse = await response.json();
      return { users: Array.isArray(data.users) ? data.users : [], error: null };
    } catch (err) {
      console.error("Error fetching data:", err);
      return { users: [], error: "Error fetching data" };
    }
  }

export default async function UserTablesPage() {
    const { users, error } = await fetchUsers();
  
    return (
      <div>
        <PageBreadcrumb pageTitle="User" />
        <div className="space-y-6">
          <ComponentCard title="User List">          
            <UserListTable users={users} error={error} />          
          </ComponentCard>
        </div>
      </div>
    );
  }