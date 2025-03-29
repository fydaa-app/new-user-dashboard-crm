"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TransactionTable from "@/components/tables/TransactionTable";
import { useGlobalContext } from "@/context/GlobalState";
import Cookies from 'js-cookie';

interface Transaction {
  userName: string;
  orderAmount: number;
  transactionType: string;
  planName: string;
  managerName: string;
  date: string;
  time: string;
}

async function fetchTransactions(page: number,selectedOption:string): Promise<{ transactions: Transaction[]; error: string | null }> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_TRANSACTIONS_LIST_ENDPOINT}?page=${page}&timeframe=${selectedOption || "yearly"}`,
            {
                headers: {
                    Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
                }
            }
        );
  
        if (response.status === 401) {
            Cookies.remove('authToken'); 
            window.location.href = "/signin";          
        }

        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        const data = await response.json();
        return { transactions: Array.isArray(data.transactions) ? data.transactions : [], error: null };
    } catch (err) {
        console.error("Error fetching data:", err);
        return { transactions: [], error: "Error fetching data" };
    }
}

export default function TransactionTablesPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const { selectedOption } = useGlobalContext();

    useEffect(() => {
        async function loadUsers() {
            const { transactions, error } = await fetchTransactions(page,selectedOption);
            setTransactions(transactions);
            setError(error);
        }
        loadUsers();
    }, [page, selectedOption]); 

    return (
        <div>
            <PageBreadcrumb pageTitle="Transaction" />
            <div className="space-y-6">
                <ComponentCard title="Transaction List">
                    <TransactionTable transactions={transactions} error={error} />
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
