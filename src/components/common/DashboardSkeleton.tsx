"use client";
import React from "react";

type SkeletonVariant = "cards" | "chart" | "list" | "table" | "section";

interface DashboardSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  /** Number of card placeholders for cards/section variants */
  count?: number;
}

function Pulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

export default function DashboardSkeleton({
  variant = "cards",
  className = "",
  count = 4,
}: DashboardSkeletonProps) {
  if (variant === "chart") {
    return (
      <div
        className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 ${className}`}
      >
        <Pulse className="mb-4 h-5 w-40" />
        <Pulse className="h-64 w-full" />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div
        className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 ${className}`}
      >
        <Pulse className="mb-4 h-5 w-36" />
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Pulse className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-3 w-3/4" />
                <Pulse className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div
        className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 ${className}`}
      >
        <Pulse className="mb-4 h-5 w-40" />
        <div className="space-y-3">
          <Pulse className="h-8 w-full" />
          {Array.from({ length: count }).map((_, i) => (
            <Pulse key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "section") {
    return (
      <div className={`w-full ${className}`}>
        <Pulse className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <Pulse className="mb-3 h-3 w-20" />
              <Pulse className="h-7 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // cards (default) — metric card row
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <Pulse className="mb-4 h-5 w-40" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
            <Pulse className="mb-3 h-8 w-8 rounded-full" />
            <Pulse className="mb-2 h-6 w-24" />
            <Pulse className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
