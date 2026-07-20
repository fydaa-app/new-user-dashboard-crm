// src/components/payout/Payouts.tsx

import GridShape from "@/components/common/GridShape";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { fetchPartnerEarnings, fetchPartnerPayoutList, checkPendingWithdrawals, checkWithdrawalStatus, fetchPartnerEarningsList } from "@/services/payoutService";
import PayoutListTable, { PayoutListItem } from "../tables/PayoutListTable";
import PartnerTransactionsTable from "../tables/PartnerTransactionsTable";
import Pagination from "../tables/Pagination";
import { useAuth } from "@/context/AuthContext";
import { useRoleNameMap } from "@/context/RoleNameContext";


interface TransactionEntry {
  date: string;
  username: string | null;
  amount: number;
  type: string;
}

export default function Payouts() {
  const { user } = useAuth();
  const { roleNameMap } = useRoleNameMap();
  const searchParams = useSearchParams();
  const partnerIdParam = searchParams.get("partnerId");

  const userRoleLevel = user?.role ? parseInt(user.role, 10) : NaN;
  const isPartner = !isNaN(userRoleLevel) && roleNameMap[userRoleLevel]?.toLowerCase() === "partner";
  const isAdmin = !isNaN(userRoleLevel) && roleNameMap[userRoleLevel]?.toLowerCase() === "admin";
  const [adminEarnings, setAdminEarnings] = useState<{
    totalEarnings: number;
    totalWithdrawn: number;
    totalWithdrawable: number;
  } | null>(null);
  // State for partner's own earnings (partner view)
  const [earnings, setEarnings] = useState<{
    totalEarnings: number;
    withdrawnAmount: number;
    withdrawableAmount: number;
  }>({
    totalEarnings: 0,
    withdrawnAmount: 0,
    withdrawableAmount: 0,
  });

  // State for pending withdrawals
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState<boolean | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // State for partner transactions
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [transPage, setTransPage] = useState(1);
  const [transTotalPages, setTransTotalPages] = useState(1);
  const [transLoading, setTransLoading] = useState(false);

  // State for admin's payout list view
  const [payoutList, setPayoutList] = useState<PayoutListItem[]>([]);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPartners, setTotalPartners] = useState(0);


  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const router = useRouter();

  // Function to fetch transactions
  const fetchTransactions = async (page: number, partnerId?: number) => {
    setTransLoading(true);
    const transData = await fetchPartnerEarningsList(page, 10, partnerId);
    if (transData?.records) {
      // Flatten records for table display
      const flattenedTransactions: TransactionEntry[] = [];
      transData.records.forEach((record) => {
        if (record.earningsBreakdown && Array.isArray(record.earningsBreakdown)) {
          record.earningsBreakdown.forEach((entry) => {
            flattenedTransactions.push({
              date: entry.timestamp || record.createdAt,
              username: entry.userName || null,
              amount: entry.type === "withdrawal"
                ? record.withdrawnAmount
                : entry.commissionAmount,
              type: entry.type
            });
          });
        }
      });
      setTransactions(flattenedTransactions);
      if (transData.pagination) {
        setTransTotalPages(transData.pagination.totalPages);
      }
    }
    setTransLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingData(true);

      // Admin viewing specific partner's transactions
      if (isAdmin && partnerIdParam) {
        const partnerId = parseInt(partnerIdParam, 10);
        
        const transData = await fetchPartnerEarningsList(1, 10, partnerId);
        if (transData?.summary) {
          setAdminEarnings({
            totalEarnings: transData.summary.totalEarnings || 0,
            totalWithdrawn: transData.summary.totalWithdrawn || 0,
            totalWithdrawable: transData.summary.totalWithdrawable || 0,
          });
        }
        if (transData?.records) {
          const flattenedTransactions: TransactionEntry[] = [];
          transData.records.forEach((record) => {
            if (record.earningsBreakdown && Array.isArray(record.earningsBreakdown)) {
              record.earningsBreakdown.forEach((entry) => {
                flattenedTransactions.push({
                  date: entry.timestamp || record.createdAt,
                  username: entry.userName || null,
                  amount: entry.type === "withdrawal"
                    ? record.withdrawnAmount
                    : entry.commissionAmount || entry.commissionAmount,
                  type: entry.type
                });
              });
            }
          });
          setTransactions(flattenedTransactions);
          if (transData.pagination) {
            setTransTotalPages(transData.pagination.totalPages);
          }
        }
        setIsFetchingData(false);
        return;
      }

      // Partner viewing their own earnings
      if (isPartner) {
        const [earningsData, pendingData, transData] = await Promise.all([
          fetchPartnerEarnings(),
          checkPendingWithdrawals(),
          fetchPartnerEarningsList(1, 10)
        ]);
        if (earningsData) {
          setEarnings(earningsData);
        }
        if (pendingData) {
          setHasPendingWithdrawal(pendingData.hasPending);
        }
        // Set transactions
        if (transData?.records) {
          const flattenedTransactions: TransactionEntry[] = [];
          transData.records.forEach((record) => {
            if (record.earningsBreakdown && Array.isArray(record.earningsBreakdown)) {
              record.earningsBreakdown.forEach((entry) => {
                flattenedTransactions.push({
                  date: entry.timestamp || record.createdAt,
                  username: entry.userName || null,
                  amount: entry.type === "withdrawal"
                    ? record.withdrawnAmount
                    : entry.commissionAmount || entry.commissionAmount,
                  type: entry.type
                });
              });
            }
          });
          setTransactions(flattenedTransactions);
          if (transData.pagination) {
            setTransTotalPages(transData.pagination.totalPages);
          }
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
  }, [isPartner, isAdmin, currentPage, partnerIdParam]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTransPageChange = (page: number) => {
    setTransPage(page);
    const partnerId = partnerIdParam ? parseInt(partnerIdParam, 10) : undefined;
    fetchTransactions(page, partnerId);
  };

  const handleWithdrawClick = () => {
    setIsLoading(true);
    router.push("/payouts/withdraw");
  };

  // Show for both admin and partner
  if (!isPartner && !isAdmin) {
    return null;
  }

  // Admin viewing specific partner's transactions
  if (isAdmin && partnerIdParam) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <button
            onClick={() => router.push("/payouts")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Payouts
          </button>
        </div>
        {adminEarnings && (
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
                  <p className="text-white text-sm font-medium mb-2">Balance Withdrawn</p>
                  <p className="text-white text-2xl font-bold">
                    {adminEarnings.totalWithdrawn.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
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
                    {adminEarnings.totalWithdrawable.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
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
                    {adminEarnings.totalEarnings.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        </h2>
        <PartnerTransactionsTable 
          transactions={transactions} 
          isLoading={transLoading || isFetchingData} 
        />
        {transTotalPages > 1 && (
          <div className="mt-4 flex justify-start">
            <Pagination 
              currentPage={transPage} 
              totalPages={transTotalPages} 
              onPageChange={handleTransPageChange} 
            />
          </div>
        )}
      </div>
    );
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
                {earnings?.withdrawnAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
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
        {hasPendingWithdrawal ? (
          <div className="flex items-center gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">
                Cannot withdraw - you have pending withdrawal(s)
              </p>
            </div>
            <button
              onClick={async () => {
                setIsCheckingStatus(true);
                await checkWithdrawalStatus();
                // Refresh pending status
                const pendingData = await checkPendingWithdrawals();
                setHasPendingWithdrawal(pendingData?.hasPending || false);
                setIsCheckingStatus(false);
              }}
              disabled={isCheckingStatus}
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
                min-w-[200px]
              "
            >
              {isCheckingStatus ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Checking...</span>
                </>
              ) : (
                <span>Refresh Status</span>
              )}
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* Partner Transactions Table - Only for partners */}
      {isPartner && (
        <div className="w-full mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Transaction History
          </h3>
          <PartnerTransactionsTable 
            transactions={transactions} 
            isLoading={transLoading} 
          />
          {transTotalPages > 1 && (
            <div className="mt-4 flex justify-start">
              <Pagination 
                currentPage={transPage} 
                totalPages={transTotalPages} 
                onPageChange={handleTransPageChange} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
