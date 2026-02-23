"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon } from "@/icons";
import { Lead } from "@/services/leadService";

export interface LeadsTableProps {
  leads: Lead[];
  error: string | null;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: number) => void;
  onSortChange?: (sortBy: string, sortOrder: "ASC" | "DESC") => void;
  currentSort?: { sortBy: string; sortOrder: "ASC" | "DESC" };
  userMap?: { [key: number]: string }; // Map for user ID to user name
  currentUserId?: number; // ID of the logged-in user for special styling
  isAdmin?: boolean; // Whether the current user is an admin (role: 0)
}

const formatCurrency = (value: number | string | null | undefined): string => {
  if (!value || isNaN(Number(value))) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value));
};


// Helper function to check if a date is overdue (compare dates only, not time)
const isOverdue = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  try {
    // Extract date parts without timezone conversion
    const followUpDate = dateString.split(/[T ]/)[0];
    const today = new Date().toISOString().split('T')[0];
    return followUpDate < today;
  } catch {
    return false;
  }
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Not set";
  try {
    // Extract just the date part to avoid timezone conversion
    const datePart = dateString.split(/[T ]/)[0];
    const [year, month, day] = datePart.split('-');
    
    // Format date without timezone conversion
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
  } catch {
    return "Invalid date";
  }
};

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "Not set";
  try {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return "Invalid date";
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "new":
      return "info";
    case "in-progress":
      return "warning";
    case "converted":
      return "success";
    case "lost":
      return "error";
    default:
      return "light";
  }
};

const getStatusDisplayText = (status: string) => {
  switch (status?.toLowerCase()) {
    case "new":
      return "New";
    case "in-progress":
      return "In Progress";
    case "converted":
      return "Converted";
    case "lost":
      return "Lost";
    default:
      return status || "Unknown";
  }
};

export default function LeadsTable({ 
  leads, 
  error, 
  onEditLead,
  onDeleteLead,
  onSortChange,
  currentSort = { sortBy: "createdAt", sortOrder: "DESC" },
  userMap = {},
  currentUserId,
  isAdmin = false
}: LeadsTableProps) {

  const handleEditLead = (lead: Lead) => {
    onEditLead?.(lead);
  };

  const handleDeleteLead = (leadId: number) => {
    onDeleteLead?.(leadId);
  };

  const handleSort = (sortBy: string) => {
    if (!onSortChange) return;
    
    // Toggle sort order if clicking the same column
    const newSortOrder = 
      currentSort.sortBy === sortBy && currentSort.sortOrder === "ASC" 
        ? "DESC" 
        : "ASC";
    
    onSortChange(sortBy, newSortOrder);
  };

  const getSortIcon = (column: string) => {
    if (currentSort.sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (currentSort.sortOrder === "ASC") {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // const getUserName = (userId: number | null | undefined): string => {
  //   if (!userId) return "Unassigned";
  //   return userMap[userId] || `User ${userId}`;
  // };

  const getUserDisplayName = (userId: number | null | undefined) => {
    if (!userId) {
      return {
        name: "Unassigned",
        className: "text-gray-400 dark:text-gray-500 italic"
      };
    }

    const userName = userMap[userId] || `User ${userId}`;
    let className = "text-gray-700 dark:text-gray-300";

    // Names are now consistently available via combinedUserMap

    // Special styling for current user
    if (userId === currentUserId) {
      className = "text-blue-600 dark:text-blue-400 font-medium";
      return {
        name: userName.includes('You (') ? userName : `${userName} (You)`,
        className
      };
    }

    // Special styling for users who might be above in hierarchy (heuristic based on name patterns)
    if (userName.toLowerCase().includes('admin') || userName.toLowerCase().includes('manager')) {
      className = "text-purple-600 dark:text-purple-400 font-medium";
    }

    return {
      name: userName,
      className
    };
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto lg:overflow-visible">
        <div className="w-full">
          {error && (
            <div className="m-4">
              <p style={{ color: "red" }}>{error}</p>
            </div>
          )}


          {!error && leads && leads.length > 0 ? (
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button 
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Entry Date
                      {getSortIcon("createdAt")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button 
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Name
                      {getSortIcon("name")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Phone
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button 
                      onClick={() => handleSort("source")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Source
                      {getSortIcon("source")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button 
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Status
                      {getSortIcon("status")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Created By
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Assigned To
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button 
                      onClick={() => handleSort("potentialInvestment")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Expected Investment
                      {getSortIcon("potentialInvestment")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button 
                      onClick={() => handleSort("convertedAmount")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Invested Amount
                      {getSortIcon("convertedAmount")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button 
                      onClick={() => handleSort("nextFollowUpAt")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Next Follow Up
                      {getSortIcon("nextFollowUpAt")}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-center text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    {/* Created At */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="text-theme-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(lead.createdAt)}
                      </div>
                    </TableCell>

                    {/* Name */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {lead.name}
                          </span>
                          <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                            ID: {lead.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <a 
                        href={`tel:${lead.mobileNumber}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {lead.mobileNumber}
                      </a>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <a 
                        href={`mailto:${lead.email}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 break-all"
                      >
                        {lead.email}
                      </a>
                    </TableCell>

                    {/* Source */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-theme-xs dark:bg-gray-700 dark:text-gray-300">
                        {lead.source}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge 
                        color={getStatusBadgeColor(lead.status)}
                        variant="light"
                        size="sm"
                      >
                        {getStatusDisplayText(lead.status)}
                      </Badge>
                    </TableCell>

                    {/* Created By */}
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span className={getUserDisplayName(lead.generatedById).className}>
                        {getUserDisplayName(lead.generatedById).name}
                      </span>
                    </TableCell>

                    {/* Assigned To */}
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span className={getUserDisplayName(lead.assignedToId).className}>
                        {getUserDisplayName(lead.assignedToId).name}
                      </span>
                    </TableCell>

                    {/* Expected Investment */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(lead.potentialInvestment)}
                      </span>
                    </TableCell>

                    {/* Invested Amount */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className={`font-medium ${lead.convertedAmount ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {formatCurrency(lead.convertedAmount)}
                      </span>
                    </TableCell>

                    {/* Next Follow Up */}
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div>
                        <span className={`text-theme-sm ${
                          isOverdue(lead.nextFollowUpAt) 
                            ? 'text-red-600 dark:text-red-400 font-medium' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatDate(lead.nextFollowUpAt)}
                        </span>
                        {isOverdue(lead.nextFollowUpAt) && (
                          <div className="text-theme-xs text-red-500 dark:text-red-400">Overdue</div>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => handleEditLead(lead)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                          aria-label={`Edit lead ${lead.name}`}
                          title={`Edit lead ${lead.name}`}
                        >
                          <PencilIcon />
                          <span className="sr-only">Edit</span>
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(lead.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-2 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/10 dark:hover:text-red-300"
                            aria-label={`Delete lead ${lead.name}`}
                            title={`Delete lead ${lead.name}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="sr-only">Delete</span>
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-8 text-center">
                <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leads found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No leads match your current filters. Try adjusting your search criteria.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}