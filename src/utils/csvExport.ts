/**
 * CSV and XLSX Export Utility
 * Handles exporting data to CSV and Excel formats
 */

import { Lead } from '@/services/leadService';
import * as XLSX from '@e965/xlsx';

/**
 * Format date with time for export
 */
export const formatDateTimeForCSV = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
};

/**
 * Format date only (without time) for export
 */
export const formatDateOnlyForCSV = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * Format currency for CSV export
 */
const formatCurrencyForCSV = (value: number | string | null | undefined): string => {
  if (!value || isNaN(Number(value))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value));
};

/**
 * Format currency for XLSX (as number)
 */
const formatCurrencyForXLSX = (value: number | string | null | undefined): number => {
  if (!value || isNaN(Number(value))) return 0;
  return Number(value);
};

/**
 * Get status display text
 */
const getStatusDisplayText = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'New';
    case 'in-progress':
      return 'In Progress';
    case 'converted':
      return 'Converted';
    case 'lost':
      return 'Lost';
    default:
      return status || 'Unknown';
  }
};

/**
 * Get user name from user map
 */
const getUserName = (userId: number | null | undefined, userMap: { [key: number]: string }): string => {
  if (!userId) return 'Unassigned';
  return userMap[userId] || `User ${userId}`;
};

/**
 * Escape CSV field value
 */
const escapeCSVField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  // Escape double quotes by doubling them, and wrap in quotes if contains comma, quote, or newline
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Convert leads data to CSV format
 */
export const convertLeadsToCSV = (
  leads: Lead[],
  userMap: { [key: number]: string } = {}
): string => {
  // CSV Headers
  const headers = [
    'Entry Date',
    'Lead ID',
    'Name',
    'Phone',
    'Email',
    'Source',
    'Status',
    'Created By',
    'Assigned To',
    'Expected Investment',
    'Invested Amount',
    'Next Follow Up',
    'Notes'
  ];

  // Convert leads to CSV rows
  const rows = leads.map(lead => [
    escapeCSVField(formatDateTimeForCSV(lead.createdAt)),
    escapeCSVField(lead.id),
    escapeCSVField(lead.name),
    escapeCSVField(lead.mobileNumber),
    escapeCSVField(lead.email),
    escapeCSVField(lead.source),
    escapeCSVField(getStatusDisplayText(lead.status)),
    escapeCSVField(getUserName(lead.generatedById, userMap)),
    escapeCSVField(getUserName(lead.assignedToId, userMap)),
    escapeCSVField(formatCurrencyForCSV(lead.potentialInvestment)),
    escapeCSVField(formatCurrencyForCSV(lead.convertedAmount)),
    escapeCSVField(formatDateOnlyForCSV(lead.nextFollowUpAt)),
    escapeCSVField(lead.notes || '')
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string = 'leads-export.csv'): void => {
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Export leads to CSV and trigger download
 */
export const exportLeadsToCSV = (
  leads: Lead[],
  userMap: { [key: number]: string } = {},
  filename?: string
): void => {
  const csvContent = convertLeadsToCSV(leads, userMap);
  const timestamp = new Date().toISOString().slice(0, 10);
  const defaultFilename = `sales-crm-leads-${timestamp}.csv`;
  downloadCSV(csvContent, filename || defaultFilename);
};

/**
 * Export leads to XLSX and trigger download
 */
export const exportLeadsToXLSX = (
  leads: Lead[],
  userMap: { [key: number]: string } = {},
  filename?: string
): void => {
  // Prepare data for XLSX
  const data = leads.map(lead => ({
    'Entry Date': formatDateTimeForCSV(lead.createdAt),
    'Lead ID': lead.id,
    'Name': lead.name || '',
    'Phone': lead.mobileNumber || '',
    'Email': lead.email || '',
    'Source': lead.source || '',
    'Status': getStatusDisplayText(lead.status),
    'Created By': getUserName(lead.generatedById, userMap),
    'Assigned To': getUserName(lead.assignedToId, userMap),
    'Expected Investment': formatCurrencyForXLSX(lead.potentialInvestment),
    'Invested Amount': formatCurrencyForXLSX(lead.convertedAmount),
    'Next Follow Up': formatDateOnlyForCSV(lead.nextFollowUpAt),
    'Notes': lead.notes || ''
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Entry Date
    { wch: 10 }, // Lead ID
    { wch: 20 }, // Name
    { wch: 15 }, // Phone
    { wch: 25 }, // Email
    { wch: 15 }, // Source
    { wch: 12 }, // Status
    { wch: 20 }, // Created By
    { wch: 20 }, // Assigned To
    { wch: 18 }, // Expected Investment
    { wch: 18 }, // Invested Amount
    { wch: 15 }, // Next Follow Up
    { wch: 30 }  // Notes
  ];
  worksheet['!cols'] = columnWidths;

  // Style header row (bold)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E0E0E0" } }
    };
  }

  // Format currency columns
  const currencyFormat = '₹#,##0.00';
  for (let row = 1; row <= range.e.r; row++) {
    // Expected Investment (column J - index 9)
    const expInvCell = XLSX.utils.encode_cell({ r: row, c: 9 });
    if (worksheet[expInvCell]) {
      worksheet[expInvCell].z = currencyFormat;
      worksheet[expInvCell].t = 'n';
    }
    
    // Invested Amount (column K - index 10)
    const invAmtCell = XLSX.utils.encode_cell({ r: row, c: 10 });
    if (worksheet[invAmtCell]) {
      worksheet[invAmtCell].z = currencyFormat;
      worksheet[invAmtCell].t = 'n';
    }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales CRM Leads');

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10);
  const defaultFilename = `sales-crm-leads-${timestamp}.xlsx`;

  // Write and download file
  XLSX.writeFile(workbook, filename || defaultFilename);
};
