"use client";
import React from "react";

interface DashboardLoadErrorProps {
  message?: string;
  onRetry: () => void;
  className?: string;
}

export default function DashboardLoadError({
  message = "Failed to load data",
  onRetry,
  className = "",
}: DashboardLoadErrorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
      >
        Retry
      </button>
    </div>
  );
}
