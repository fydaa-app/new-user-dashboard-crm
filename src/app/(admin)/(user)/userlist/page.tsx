"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserListTable from "@/components/tables/UserListTable";

interface User {
  userName: string;
  mobileNumber: string;
  planName: string;
  managerName: string;
  onboardingDate: string;
  netWorth: string;
}

async function fetchUsers(page: number): Promise<{ users: User[]; error: string | null }> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_USER_LIST_ENDPOINT}?page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
                }
            }
        );
  
        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        const data = await response.json();
        return { users: Array.isArray(data.users) ? data.users : [], error: null };
    } catch (err) {
        console.error("Error fetching data:", err);
        return { users: [], error: "Error fetching data" };
    }
}

export default function UserTablesPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadUsers() {
            const { users, error } = await fetchUsers(page);
            setUsers(users);
            setError(error);
        }
        loadUsers();
    }, [page]); // Re-fetch users when the page changes

    return (
        <div>
            <PageBreadcrumb pageTitle="User" />
            <div className="space-y-6">
                <ComponentCard title="User List">
                    <UserListTable users={users} error={error} />
                    <div className="flex justify-between mt-4">
                        <button 
                            className="px-4 py-2 bg-gray-200 rounded"
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span>Page {page}</span>
                        <button 
                            className="px-4 py-2 bg-gray-200 rounded"
                            onClick={() => setPage(prev => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
