"use client";

import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Pagination from "@/components/tables/Pagination";
import { DownloadIcon } from "@/icons";
import { useGlobalContext } from "@/context/GlobalState";
import { useFydaaOnlyPage } from "@/hooks/useFydaaOnlyPage";
import { UserEndpoints } from "@/config/api-endpoints";
import { ApiError, apiClient } from "@/services/api-client";

type Granularity = "user" | "daily";

interface UserAumRow {
  userId: number;
  userName: string;
  mobileNumber: string;
  referredBy: string;
  openingDate: string;
  openingAum: number;
  closingDate: string;
  closingAum: number;
  aumChange: number;
  investedValue: number;
  totalProfit: number;
}

interface DailyAumRow {
  userId: number;
  userName: string;
  mobileNumber: string;
  referredBy: string;
  date: string;
  aum: number;
  investedValue: number;
  totalProfit: number;
}

type AumRow = UserAumRow | DailyAumRow;

interface AumDownloadResponse {
  success: boolean;
  startDate: string;
  endDate: string;
  employeeId: number;
  employeeName: string;
  type: "individual" | "team";
  granularity: Granularity;
  totalUsers: number;
  rows: AumRow[];
}

const PAGE_SIZE = 15;

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function rangeFromTimeframe(
  option: string,
  customDates: { start: string; end: string }
) {
  const today = new Date();
  const end = toISODate(today);

  if (option === "custom" && customDates.start && customDates.end) {
    return {
      start: customDates.start.slice(0, 10),
      end: customDates.end.slice(0, 10),
    };
  }

  if (option === "daily") {
    return { start: end, end };
  }

  if (option === "weekly") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { start: toISODate(start), end };
  }

  if (option === "yearly" || option === "till_date") {
    return { start: `${today.getFullYear()}-01-01`, end };
  }

  return {
    start: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`,
    end,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function isUserRow(row: AumRow): row is UserAumRow {
  return "closingAum" in row;
}

export default function DownloadAumPage() {
  useFydaaOnlyPage();

  const {
    selectedOption,
    customDates,
    selectedEmployee,
    selectedTeamMember,
    selectedType,
    hierarchyViewMode,
  } = useGlobalContext();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [granularity, setGranularity] = useState<Granularity>("user");
  const [userId, setUserId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AumDownloadResponse | null>(null);

  useEffect(() => {
    const range = rangeFromTimeframe(selectedOption, customDates);
    setStartDate(range.start);
    setEndDate(range.end);
    // Seed once from the header date filter. Later edits stay on this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scopeType: "individual" | "team" = useMemo(() => {
    const raw = selectedTeamMember ? hierarchyViewMode : selectedType;
    return String(raw || "team") === "individual" ? "individual" : "team";
  }, [hierarchyViewMode, selectedTeamMember, selectedType]);

  const employeeId = selectedTeamMember || selectedEmployee || "";

  const buildQuery = (format?: "csv") => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      type: scopeType,
      granularity,
    });
    if (employeeId) params.set("employeeId", employeeId);
    if (userId.trim()) params.set("userId", userId.trim());
    if (format) params.set("format", format);
    return `${UserEndpoints.USER_AUM_DOWNLOAD}?${params.toString()}`;
  };

  const validate = () => {
    if (!startDate || !endDate) {
      return "Start date and end date are required.";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return "Dates must be in YYYY-MM-DD format.";
    }
    if (startDate > endDate) {
      return "Start date cannot be after end date.";
    }
    if (userId.trim() && !/^\d+$/.test(userId.trim())) {
      return "User ID must be a number.";
    }
    return null;
  };

  const loadPreview = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AumDownloadResponse>(buildQuery());
      setReport(response.data);
      setPage(1);
      setSearch("");
    } catch (err) {
      setReport(null);
      setError(err instanceof ApiError ? err.message : "Could not load AUM data.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setDownloading(true);
    setError(null);
    try {
      const token = Cookies.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "authToken");
      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const response = await fetch(`${base}${buildQuery("csv")}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.status === 401) {
        window.location.href = "/signin";
        return;
      }

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const body = await response.json();
          throw new Error(body.message || body.error || "Download failed.");
        }
        throw new Error("Download failed.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] || `user-aum_${startDate}_to_${endDate}_${granularity}.csv`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the CSV.");
    } finally {
      setDownloading(false);
    }
  };

  const rows = report?.rows || [];
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      [row.userName, row.mobileNumber, String(row.userId), row.referredBy]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => {
    if (!report) return null;
    if (report.granularity === "daily") {
      const dailyRows = report.rows.filter((row): row is DailyAumRow => !isUserRow(row));
      const latestDate = dailyRows.reduce((latest, row) => (row.date > latest ? row.date : latest), "");
      const latestRows = dailyRows.filter((row) => row.date === latestDate);
      return {
        users: report.totalUsers,
        primaryLabel: "Latest AUM",
        primaryValue: formatCurrency(latestRows.reduce((sum, row) => sum + Number(row.aum || 0), 0)),
        secondaryLabel: "Snapshots",
        secondaryValue: dailyRows.length.toLocaleString("en-IN"),
        quaternaryLabel: "Profit",
        quaternaryValue: formatCurrency(latestRows.reduce((sum, row) => sum + Number(row.totalProfit || 0), 0)),
      };
    }

    const userRows = report.rows.filter(isUserRow);
    return {
      users: report.totalUsers,
      primaryLabel: "Closing AUM",
      primaryValue: formatCurrency(userRows.reduce((sum, row) => sum + Number(row.closingAum || 0), 0)),
      secondaryLabel: "AUM change",
      secondaryValue: formatCurrency(userRows.reduce((sum, row) => sum + Number(row.aumChange || 0), 0)),
      quaternaryLabel: "Profit",
      quaternaryValue: formatCurrency(userRows.reduce((sum, row) => sum + Number(row.totalProfit || 0), 0)),
    };
  }, [report]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Download AUM" />

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              User AUM export
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Pull opening and closing AUM for referred Fydaa users. The header employee and team filters are sent with the request.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
              Scope: {scopeType === "team" ? "Team" : "Individual"}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
              {employeeId ? `Employee ${employeeId}` : "Logged-in employee"}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Label htmlFor="aum-start">Start date</Label>
            <Input id="aum-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="aum-end">End date</Label>
            <Input id="aum-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="aum-user">User ID</Label>
            <Input
              id="aum-user"
              type="text"
              inputMode="numeric"
              placeholder="Optional"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div>
            <Label>Report</Label>
            <div className="grid h-11 grid-cols-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              {([
                ["user", "By user"],
                ["daily", "Daily"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGranularity(value)}
                  className={`rounded-md text-sm font-medium transition ${
                    granularity === value
                      ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={loadPreview} disabled={loading || downloading}>
            {loading ? "Loading..." : "Preview"}
          </Button>
          <Button
            variant="outline"
            onClick={downloadCsv}
            disabled={loading || downloading}
            startIcon={<DownloadIcon className="fill-current" />}
          >
            {downloading ? "Downloading..." : "Download CSV"}
          </Button>
        </div>
      </section>

      {summary && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Users", value: summary.users.toLocaleString("en-IN") },
            { label: summary.primaryLabel, value: summary.primaryValue },
            { label: summary.secondaryLabel, value: summary.secondaryValue },
            { label: summary.quaternaryLabel, value: summary.quaternaryValue },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="mt-2 text-xl font-semibold text-gray-800 dark:text-white/90">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {report ? report.employeeName : "Preview"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {report
                ? `${report.startDate} to ${report.endDate} · ${filteredRows.length.toLocaleString("en-IN")} rows`
                : "Choose a date range and preview before downloading."}
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search name, mobile, ID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              disabled={!report}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {((report?.granularity ?? granularity) === "daily"
                  ? ["User", "Mobile", "Date", "AUM", "Invested", "Profit"]
                  : ["User", "Mobile", "Opening", "Closing", "Change", "Invested", "Profit"]
                ).map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                    Loading AUM records...
                  </td>
                </tr>
              )}
              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    {report ? "No AUM records for this range." : "Nothing to show yet."}
                  </td>
                </tr>
              )}
              {!loading &&
                pageRows.map((row) =>
                  isUserRow(row) ? (
                    <tr key={`${row.userId}-${row.openingDate}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-4 text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">{row.userName}</p>
                        <p className="text-xs text-gray-500">#{row.userId}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{row.mobileNumber || "—"}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <p>{formatCurrency(row.openingAum)}</p>
                        <p className="text-xs text-gray-500">{row.openingDate || "—"}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        <p>{formatCurrency(row.closingAum)}</p>
                        <p className="text-xs font-normal text-gray-500">{row.closingDate || "—"}</p>
                      </td>
                      <td className={`px-4 py-4 text-sm font-medium ${row.aumChange >= 0 ? "text-success-600" : "text-error-600"}`}>
                        {row.aumChange >= 0 ? "+" : ""}
                        {formatCurrency(row.aumChange)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(row.investedValue)}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(row.totalProfit)}</td>
                    </tr>
                  ) : (
                    <tr key={`${row.userId}-${row.date}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-4 text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">{row.userName}</p>
                        <p className="text-xs text-gray-500">#{row.userId}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{row.mobileNumber || "—"}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{row.date}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(row.aum)}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(row.investedValue)}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(row.totalProfit)}</td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>

        {report && filteredRows.length > PAGE_SIZE && (
          <div className="flex justify-end border-t border-gray-100 px-5 py-4 dark:border-gray-800">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </section>
    </div>
  );
}
