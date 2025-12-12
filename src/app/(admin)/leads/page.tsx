"use client";

import React, { useState, useEffect } from "react";
import LeadsTable from "@/components/tables/LeadsTable";
import { Lead, leadService } from "@/services/leadService";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<{ [key: number]: string }>({});

  // Mock user map - replace with actual user service call
  const mockUserMap = {
    2: "John Doe",
    8: "Admin User", 
    62: "Sarah Smith",
    92: "Mike Johnson",
  };

  useEffect(() => {
    fetchLeads();
    setUserMap(mockUserMap);
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await leadService.getLeads({
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      
      setLeads(response.leads || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleViewLead = (leadId: number) => {
    console.log('View lead:', leadId);
    // Implement navigation to lead detail page
    // router.push(`/leads/${leadId}`);
  };

  const handleEditLead = (lead: Lead) => {
    console.log('Edit lead:', lead.id);
    // Implement navigation to lead edit page or open modal
    // router.push(`/leads/${lead.id}/edit`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleUpdateStatus = async (leadId: number, status: string) => {
    try {
      await leadService.updateLeadStatus(leadId, status);
      // Refresh leads after status update
      fetchLeads();
    } catch (err) {
      console.error('Error updating lead status:', err);
      setError('Failed to update lead status.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageBreadCrumb pageTitle="Leads Management" />
        <div className="mt-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageBreadCrumb pageTitle="Leads Management" />
      
      <div className="mt-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Leads Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and track your leads and referrals
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchLeads}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Refresh
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Add New Lead
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Leads
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {leads.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-yellow-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    New Leads
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {leads.filter(lead => lead.status === 'new').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Converted
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {leads.filter(lead => lead.status === 'converted').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-orange-500 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    In Progress
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {leads.filter(lead => lead.status === 'in-progress').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <LeadsTable
          leads={leads}
          error={error}
          onEditLead={handleEditLead}
          userMap={userMap}
        />
      </div>
    </div>
  );
}