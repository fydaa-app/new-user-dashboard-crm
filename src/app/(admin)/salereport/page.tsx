"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SaleReportTable from "@/components/tables/SaleReport";
import { useGlobalContext } from "@/context/GlobalState";

interface SaleList {
    userId: string;
    userName: string;
    planName: string;
    amount: number;
    paymentType: string;
    date: string;
    time: string;
    managerName:string;
}

async function fetchPayments(page: number,selectedOption:string): Promise<{ payments: SaleList[]; error: string | null }> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_PAYMENTS_LIST_ENDPOINT}?page=${page}&timeframe=${selectedOption || "yearly"}`,
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
        return { payments: Array.isArray(data.payments) ? data.payments : [], error: null };
    } catch (err) {
        console.error("Error fetching data:", err);
        return { payments: [], error: "Error fetching data" };
    }
}

export default function UserTablesPage() {
    const [payments, setPayments] = useState<SaleList[]>([]);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const { selectedOption } = useGlobalContext();

    useEffect(() => {
        async function loadUsers() {
            const { payments, error } = await fetchPayments(page,selectedOption);
            setPayments(payments);
            setError(error);
        }
        loadUsers();
    }, [page,selectedOption]); 

    return (
        <div>
            <PageBreadcrumb pageTitle="Payment" />
            <div className="space-y-6">
                <ComponentCard title="Payment List">
                    <SaleReportTable payments={payments} error={error} />
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
