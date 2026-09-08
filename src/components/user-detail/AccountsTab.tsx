"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserAccountLedgerTable, {
  UserAccountLedger,
} from "@/components/tables/UserAccountLedgerTable";
import { apiClient } from "@/services/api-client";
import { PaymentEndpoints } from "@/config/api-endpoints";

interface AccountLedgerResponse {
  data: UserAccountLedger[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface AccountsTabProps {
  userId: number;
}

export default function AccountsTab({ userId }: AccountsTabProps) {
  const [ledgers, setLedgers] = useState<UserAccountLedger[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedgers = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<AccountLedgerResponse>(
          `${PaymentEndpoints.USER_ACCOUNT_LEDGERS}/${userId}?page=${page}&limit=10`,
          { baseUrl: "payment" }
        );

        if (response.ok && response.data) {
          setLedgers(response.data.data);
          setMeta(response.data.meta);
        } else {
          throw new Error("Failed to fetch account ledgers");
        }
      } catch (err) {
        console.error("Error fetching user account ledgers:", err);
        setError("Failed to load account ledger data");
        setLedgers([]);
        setMeta((prev) => ({ ...prev, totalPages: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchLedgers(1);
  }, [fetchLedgers]);

  const handlePrev = () => {
    if (meta.page > 1) {
      fetchLedgers(meta.page - 1);
    }
  };

  const handleNext = () => {
    if (meta.page < meta.totalPages) {
      fetchLedgers(meta.page + 1);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <svg
            className="w-8 h-8 animate-spin text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading account ledger...
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={handleReload}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 active:bg-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/40"
          >
            Reload
          </button>
        </div>
      ) : (
        <>
          <UserAccountLedgerTable ledgers={ledgers} error={error} />

          {meta.total > 0 && (
            <div className="mt-4 mb-4 flex items-center justify-center gap-4">
              <button
                onClick={handlePrev}
                disabled={meta.page <= 1 || loading}
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    meta.page <= 1 || loading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                      : "bg-brand-50 text-brand-600 hover:bg-brand-100 active:bg-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/40"
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Prev
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {meta.page} of {meta.totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={meta.page >= meta.totalPages || loading}
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    meta.page >= meta.totalPages || loading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                      : "bg-brand-50 text-brand-600 hover:bg-brand-100 active:bg-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/40"
                  }`}
              >
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
