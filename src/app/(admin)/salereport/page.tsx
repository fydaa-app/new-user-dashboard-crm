"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SaleReportTable from "@/components/tables/SaleReport";
import { useGlobalContext } from "@/context/GlobalState";
import Pagination from "@/components/tables/Pagination";

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

async function fetchPayments(page: number,selectedOption:string, customDates: { start: string; end: string }):
     Promise<{ 
        payments: SaleList[]; 
        error: string | null;
        totalCount?: number;
        limit?: number;
     }> {
    try {

        let url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_PAYMENTS_LIST_ENDPOINT}?page=${page}`;
    
        if (selectedOption === 'custom') {
          url += `&timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `&timeframe=${selectedOption || "yearly"}`;
        }

        const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
                }
            }
        );
  
        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        const data = await response.json();
        return { payments: Array.isArray(data.payments) ? data.payments : [], error: null,totalCount: data.totalCount,limit: data.limit};
    } catch (err) {
        console.error("Error fetching data:", err);
        return { payments: [], error: "Error fetching data" };
    }
}

export default function UserTablesPage() {
    const [payments, setPayments] = useState<SaleList[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { selectedOption,customDates } = useGlobalContext();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

     const fetchData = useCallback(async () => {
        try {
            const { payments, error, totalCount: apiTotalCount, limit } = await fetchPayments(page, selectedOption, customDates);
            setPayments(payments);
            setError(error);
            
            if (apiTotalCount && limit) {
                const calculatedTotalPages = Math.ceil(apiTotalCount / limit);
                setTotalPages(calculatedTotalPages);
                setTotalCount(apiTotalCount);
            }
        } catch (err) {
            console.error("Error in fetchData:", err);
            setError("Failed to load data");
        }
               
    }, [page, selectedOption, customDates]);
        
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [selectedOption, customDates]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "k") {
            event.preventDefault();
            inputRef.current?.focus();
            }
        };
    
        document.addEventListener("keydown", handleKeyDown);
    
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
        }, []);
    
    return (
        <div>
            <PageBreadcrumb pageTitle="Payment" />
            <div className="space-y-6">
                <ComponentCard title="Payment List">
                    <div>
                        <form>
                            <div className="relative">
                                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                                <svg
                                    className="fill-gray-500 dark:fill-gray-400"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                                    fill=""
                                    />
                                </svg>
                                </span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search or type command..."
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                                />
                            </div>
                        </form>
                    </div>
                    <SaleReportTable payments={payments} error={error} />
                    {totalCount > 0 && (
                        <Pagination 
                            currentPage={page} 
                            totalPages={totalPages} 
                            onPageChange={handlePageChange} 
                        />
                    )}   
                </ComponentCard>
            </div>
        </div>
    );
}
