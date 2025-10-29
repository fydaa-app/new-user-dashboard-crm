// src/components/payout/Payouts.tsx

import GridShape from "@/components/common/GridShape";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { fetchPartnerEarnings, fetchPartnerPayoutList } from "@/services/payoutService";
import PayoutListTable, { PayoutListItem } from "../tables/PayoutListTable";
import Pagination from "../tables/Pagination";


interface PayoutsProps {
  userRole?: string;
}

export default function Payouts({ userRole }: PayoutsProps) {
  // State for partner's own earnings (partner view)
  const [earnings, setEarnings] = useState<{
    totalEarnings: number;
    availableAmount: number;
    withdrawableAmount: number;
  }>({
    totalEarnings: 0,
    availableAmount: 0,
    withdrawableAmount: 0,
  });

  // State for admin's payout list view
  const [payoutList, setPayoutList] = useState<PayoutListItem[]>([]);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPartners, setTotalPartners] = useState(0);


  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const router = useRouter();
  const isPartner = userRole === "5";
  const isAdmin = userRole === "0";

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingData(true);

      // Partner viewing their own earnings
      if (isPartner) {
        const data = await fetchPartnerEarnings();
        if (data) {
          setEarnings(data);
        }
      }

      // Admin viewing all partners' payout list
      if (isAdmin) {
        const { payouts, pagination: paginationData, error } = await fetchPartnerPayoutList(currentPage, 10);
        setPayoutList(payouts);
        setPayoutError(error);
        
        if (paginationData) {
          setTotalPages(paginationData.totalPages);
          setTotalPartners(paginationData.totalItems);
        }
      }


      setIsFetchingData(false);
    };

    fetchData();
  }, [isPartner, isAdmin, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleWithdrawClick = () => {
    setIsLoading(true);
    router.push("/payouts/withdraw");
  };

  // Show for both admin and partner
  if (!isPartner && !isAdmin) {
    return null;
  }

  // Admin View: Show Payout List Table
  if (isAdmin) {
    return (
      <div className="space-y-4">
        <PayoutListTable 
          payouts={payoutList} 
          error={payoutError} 
          isLoading={isFetchingData}
        />
        {totalPartners > 0 && !isFetchingData && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        )}
      </div>
    );
  }

  // Partner View: Show Cards and Withdraw Button
  // Show loading while fetching data
  if (isFetchingData) {
    return (
      <div className="flex h-[400px] items-center justify-center w-full">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen p-6 overflow-hidden z-1">
      <GridShape />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        {/* Balance Earned */}
        <div className="bg-[#EA580C] rounded-lg p-6 shadow-lg opacity-80">
          <div className="flex flex-col items-start gap-4">
            <div className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-2">Balance Earned</p>
              <p className="text-white text-2xl font-bold">
                {earnings?.availableAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Withdrawable */}
        <div className="bg-[#2563EB] rounded-lg p-6 shadow-lg opacity-80">
          <div className="flex flex-col items-start gap-4">
            <div className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-2">Balance Withdrawable</p>
              <p className="text-white text-2xl font-bold">
                {earnings?.withdrawableAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
              </p>
            </div>
          </div>
        </div>

        {/* Lifetime Earning */}
        <div className="bg-[#EC4899] rounded-lg p-6 shadow-lg opacity-80">
          <div className="flex flex-col items-start gap-4">
            <div className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-2">Lifetime Earning</p>
              <p className="text-white text-2xl font-bold">
                {earnings?.totalEarnings.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Button - Only for partners */}
      <div className="w-full flex justify-end">
        <button
          onClick={handleWithdrawClick}
          disabled={isLoading}
          className="
            flex items-center justify-center gap-2 
            bg-black text-white 
            dark:bg-white dark:text-black
            font-semibold py-3 px-6 rounded-lg shadow-lg 
            hover:text-gray-200 dark:hover:text-gray-800
            hover:shadow-xl 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none 
            transition-all duration-200 transform 
            hover:scale-105 active:scale-95 
            focus:outline-none focus:ring-4 focus:ring-gray-300
            dark:focus:ring-gray-700
            min-w-[400px]
          "
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            <span>Withdraw Balance</span>
          )}
        </button>
      </div>
    </div>
  );
}
