"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/context/AuthContext';
import { useGlobalContext } from '@/context/GlobalState';
import { 
  PlusIcon, 
  SalesIcon,
  SalesIconOrange,
  SalesIconGreen,
  SalesIconViolet
} from '@/icons';
import { leadService, Lead, CreateLeadData, UpdateLeadData, LeadStats, LeadFilters } from '@/services/leadService';
import { apiClient } from '@/services/api-client';
import { AdminEndpoints } from '@/config/api-endpoints';
import LeadsTable from '@/components/tables/LeadsTable';
import LeadsFilters from '@/components/leads/LeadsFilters';
import Pagination from '@/components/tables/Pagination';
import EditLeadModal from '@/components/leads/EditLeadModal';
import DeleteLeadModal from '@/components/leads/DeleteLeadModal';
import DatePicker from '@/components/form/DatePicker';
import Select from '@/components/form/Select';
import { ChevronDownIcon } from '@/icons';
import { exportLeadsToCSV, exportLeadsToXLSX } from '@/utils/csvExport';

// Interfaces for designation and employee data
interface DesignationItem {
  level: number;
  hierarchyName: string;
}

interface EmployeeItem {
  id: number;
  name: string;
}

export default function SalesCRM() {
  const { user, token, isAuthenticated } = useAuth();
  const { 
    selectedOption, 
    customDates, 
    selectedDesignation, 
    setSelectedDesignation,
    selectedEmployee,
    selectedTeamMember,
    selectedType
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  , hierarchyViewMode } = useGlobalContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUpdatingUrl = React.useRef(false);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [userMap, setUserMap] = useState<{ [key: number]: string }>({});
  const [backendUserNames, setBackendUserNames] = useState<{ [key: number]: string }>({});
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'assigned'>('all');
  const isAdmin = user?.role === '0';

  // Create a combined userMap that includes both local userMap and backend names
  const combinedUserMap = useMemo(() => {
    return {
      ...userMap,
      ...backendUserNames
    };
  }, [userMap, backendUserNames]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // New filters state
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlStatus = searchParams.get('status');
    const urlFollowUp = searchParams.get('followUp');
    const urlPage = searchParams.get('page');
    
    if (urlSearch || urlStatus || urlFollowUp || urlPage) {
      const newFilters: Partial<LeadFilters> = {
        ...filters,
      };
      
      if (urlSearch) newFilters.search = urlSearch;
      if (urlStatus) newFilters.status = urlStatus;
      if (urlFollowUp) newFilters.followUpTimeframe = urlFollowUp as "overdue" | "today" | "week" | "month" | "year" | "till_date";
      if (urlPage) newFilters.page = parseInt(urlPage);
      
      setFilters(newFilters as LeadFilters);
    }
  }, []); // Only run on mount

  // Employee assignment dropdowns
  const [designations, setDesignations] = useState<{value: string, label: string}[]>([]);
  const [employees, setEmployees] = useState<{value: string, label: string}[]>([]);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const [newLead, setNewLead] = useState<CreateLeadData>({
    name: '',
    email: '',
    mobileNumber: '',
    source: 'Website',
    appType: '',
    status: 'new',
    potentialInvestment: undefined,
    nextFollowUpAt: '',
    notes: '',
    imageUrl: ''
  });

  // Validation states for Add Lead Modal
  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [selectedSourceOption, setSelectedSourceOption] = useState<string>('Website');
  const [customSource, setCustomSource] = useState('');

  // Image upload state variables
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');

  // Email regex pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Phone regex pattern - exactly 10 digits
  const phoneRegex = /^\d{10}$/;

  const loadLeads = useCallback(async (filtersToUse?: LeadFilters) => {
    console.log('🔍 DEBUG: loadLeads STARTED', { 
      filtersToUse, 
      currentLeadsLength: leads?.length,
      loading 
    });
    try {
      setLoading(true);
      setError(null);
      
      // Build filters based on AppHeader selections
      const baseFilters = filtersToUse || filters;
      const enhancedFilters: LeadFilters = { ...baseFilters };

      // Add date filtering based on entry date (createdAt)
      console.log('🔍 Date filtering check:', { selectedOption, customDates });
      if (selectedOption && selectedOption !== 'all' && selectedOption !== '' && selectedOption !== 'till_date') {
        const now = new Date();
        let startDate: Date | null;
        let endDate: Date | null = now;

        switch (selectedOption) {
          case 'daily':
          case 'today':
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0); // Start of today
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            break;
          case 'yesterday':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0); // Start of yesterday
            endDate = new Date();
            endDate.setDate(endDate.getDate() - 1);
            endDate.setHours(23, 59, 59, 999); // End of yesterday
            break;
          case 'weekly':
            startDate = new Date();
            const dayOfWeek = startDate.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
            startDate.setDate(startDate.getDate() - daysToMonday);
            startDate.setHours(0, 0, 0, 0); // Start of current week (Monday)
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            break;
          case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0); // Start of current month
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            break;
          case 'quarterly':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3;
            startDate = new Date(now.getFullYear(), quarterStart, 1);
            startDate.setHours(0, 0, 0, 0); // Start of current quarter
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            break;
          case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0); // Start of current year
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            break;
          case 'all':
          case 'till_date':
            // No date filtering - show all leads regardless of date
            startDate = null;
            endDate = null;
            break;
          case 'custom':
            if (customDates.start && customDates.end) {
              startDate = new Date(customDates.start);
              startDate.setHours(0, 0, 0, 0); // Start of day
              endDate = new Date(customDates.end);
              endDate.setHours(23, 59, 59, 999); // End of day
            } else {
              // No custom dates set - show all
              startDate = null;
              endDate = null;
            }
            break;
          default:
            // Default case - show all leads without date restriction
            startDate = null;
            endDate = null;
        }

        if (startDate && endDate && startDate.getTime() > 0) {
          enhancedFilters.createdAfter = startDate.toISOString();
          enhancedFilters.createdBefore = endDate.toISOString();
          console.log('📅 Date filter applied:', {
            selectedOption,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            localStartDate: startDate.toLocaleString(),
            localEndDate: endDate.toLocaleString()
          });
        } else {
          console.log('📅 No date filter applied - showing all dates');
        }
      }

      // Add employee filtering based on view mode
      // Use selectedTeamMember if available (team mode), otherwise use selectedEmployee
      const employeeId = selectedTeamMember || selectedEmployee;
      
      if (employeeId && employeeId !== 'all') {
        // When a specific employee is selected from header dropdown
        if (viewMode === 'all') {
          // Show all leads under that employee (hierarchy + assigned)
          enhancedFilters.employeeId = parseInt(employeeId);
          console.log('👤 Show All mode - Employee hierarchy filter applied:', {
            employeeId: employeeId,
            parsedId: parseInt(employeeId)
          });
        } else {
          // Show only leads assigned to that employee
          enhancedFilters.assignedToId = parseInt(employeeId);
          console.log('👤 Assigned mode - Employee assignedTo filter applied:', {
            employeeId: employeeId,
            parsedId: parseInt(employeeId)
          });
        }
      } else if (employeeId === 'all') {
        // [FIX] Explicitly handle 'all' selection
        // Do NOT apply employeeId or assignedToId filters here.
        // This allows the backend to return ALL records (global view).
        console.log('👤 Show All Employees selected - Global view applied');
      } else if (user?.id) {
        // When no specific employee is selected AND 'all' was not explicitly chosen
        // Default behavior: apply to logged-in user
        if (viewMode === 'all') {
          // Show all leads under logged-in user (hierarchy + assigned)
          enhancedFilters.employeeId = user.id;
          console.log('👤 Show All mode - User hierarchy filter applied:', {
            loggedInUserId: user.id
          });
        } else {
          // Show only leads assigned to logged-in user
          enhancedFilters.assignedToId = user.id;
          console.log('👤 Assigned mode - User assignedTo filter applied:', {
            loggedInUserId: user.id
          });
        }
      }


      // Don't send designationLevel - it was incorrectly filtering the list
      // The designation dropdown is only for selecting which employee to view, not for filtering leads
      // Stats show the correct full hierarchy count, list should match

      // Don't send type parameter - use employeeId vs assignedToId to control behavior
      // (The type parameter is not needed because viewMode already determines the filtering)

      console.log('🔍 Enhanced filters being applied:', enhancedFilters);
      
      const response = await leadService.getLeads(enhancedFilters);
      
      // Access the data from the response structure
      const leads = response.leads || [];
      const pagination = response.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };
      const backendEmployeeNames = response.employeeNames || {};
      
      console.log('🔍 DEBUG: loadLeads SUCCESS', { 
        leadsCount: leads.length, 
        pagination,
        settingLeadsTo: leads.length === 0 ? 'empty array []' : `array with ${leads.length} items`
      });
      setLeads(leads); // Always set to array (never null after first load)
      setPagination(pagination);

      // Update userMap with names from backend response first (this should fix User 8)
      if (Object.keys(backendEmployeeNames).length > 0) {
        setBackendUserNames(backendEmployeeNames);
        console.log('✅ Updated userMap with backend employee names:', backendEmployeeNames);
      }

      // Load additional user names if needed (fallback)
      if (leads && leads.length > 0) {
        await loadAllUserNamesFromLeads(leads);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leads. Please try again.';
      setError(errorMessage);
      console.error('Error loading leads:', err);
    } finally {
      console.log('🔍 DEBUG: loadLeads FINISHED', { 
        leadsLength: leads?.length,
        settingLoadingToFalse: true 
      });
      setLoading(false);
    }
  }, [filters, selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedDesignation, selectedType]);

  const loadStats = useCallback(async () => {
    try {
      console.log('🔄 Loading lead stats...');
      console.log('👤 Auth Status:', { isAuthenticated, user: user?.name, hasToken: !!token });
      console.log('🍪 Token from cookie:', document.cookie.includes('authToken'));
      
      // Apply the same filters to stats as used for leads
      let statsFilters = {};
      
      // Apply date filtering
      console.log('📊 Stats date filtering check:', { selectedOption, customDates });
      if (selectedOption && selectedOption !== 'all' && selectedOption !== '' && selectedOption !== 'till_date') {
        const now = new Date();
        let startDate: Date | null;
        let endDate: Date | null = now;

        switch (selectedOption) {
          case 'daily':
          case 'today':
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0); // Start of today
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            break;
          case 'yesterday':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0); // Start of yesterday
            endDate = new Date();
            endDate.setDate(endDate.getDate() - 1);
            endDate.setHours(23, 59, 59, 999); // End of yesterday
            break;
          case 'weekly':
            startDate = new Date();
            const dayOfWeek = startDate.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
            startDate.setDate(startDate.getDate() - daysToMonday);
            startDate.setHours(0, 0, 0, 0); // Start of current week (Monday)
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            break;
          case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0); // Start of current month
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            break;
          case 'quarterly':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3;
            startDate = new Date(now.getFullYear(), quarterStart, 1);
            startDate.setHours(0, 0, 0, 0); // Start of current quarter
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            break;
          case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0); // Start of current year
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            break;
          case 'all':
          case 'till_date':
            // No date filtering - show all leads regardless of date
            startDate = null;
            endDate = null;
            break;
          case 'custom':
            if (customDates.start && customDates.end) {
              startDate = new Date(customDates.start);
              startDate.setHours(0, 0, 0, 0); // Start of day
              endDate = new Date(customDates.end);
              endDate.setHours(23, 59, 59, 999); // End of day
            } else {
              // No custom dates set - show all
              startDate = null;
              endDate = null;
            }
            break;
          default:
            // Default case - show all leads without date restriction
            startDate = null;
            endDate = null;
        }

        if (startDate && endDate && startDate.getTime() > 0) {
          statsFilters = {
            ...statsFilters,
            createdAfter: startDate.toISOString(),
            createdBefore: endDate.toISOString()
          };
          console.log('📊 Stats date filter applied:', {
            selectedOption,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            localStartDate: startDate.toLocaleString(),
            localEndDate: endDate.toLocaleString()
          });
        } else {
          console.log('📊 No date filter applied for stats - showing all dates');
        }
      }

      // Apply employee filter based on view mode (same logic as leads)
      // Use selectedTeamMember if available (team mode), otherwise use selectedEmployee
      const employeeId = selectedTeamMember || selectedEmployee;
      
      if (employeeId && employeeId !== 'all') {
        if (viewMode === 'all') {
          // Show stats for all leads under that employee (hierarchy + assigned)
          statsFilters = {
            ...statsFilters,
            employeeId: parseInt(employeeId)
          };
          console.log('📊 Show All mode - Stats employee hierarchy filter applied:', {
            employeeId: employeeId,
            parsedId: parseInt(employeeId)
          });
        } else {
          // Show stats for only leads assigned to that employee
          statsFilters = {
            ...statsFilters,
            assignedToId: parseInt(employeeId)
          };
          console.log('📊 Assigned mode - Stats employee assignedTo filter applied:', {
            employeeId: employeeId,
            parsedId: parseInt(employeeId)
          });
        }
      } else if (employeeId === 'all') {
        // [FIX] Explicitly handle 'all' selection
        // Do NOT apply filtering.
        console.log('📊 Show All Employees selected for Stats - Global view applied');
      } else if (user?.id) {
        if (viewMode === 'all') {
          // Show stats for all leads under logged-in user (hierarchy + assigned)
          statsFilters = {
            ...statsFilters,
            employeeId: user.id
          };
          console.log('📊 Show All mode - Stats user hierarchy filter applied:', {
            loggedInUserId: user.id
          });
        } else {
          // Show stats for only leads assigned to logged-in user
          statsFilters = {
            ...statsFilters,
            assignedToId: user.id
          };
          console.log('📊 Assigned mode - Stats user assignedTo filter applied:', {
            loggedInUserId: user.id
          });
        }
      }

      console.log('📊 Loading stats with filters:', statsFilters);
      const statsData = await leadService.getLeadStats(Object.keys(statsFilters).length > 0 ? statsFilters : undefined);
      console.log('✅ Lead stats loaded:', statsData);
      setStats(statsData);
    } catch (err) {
      console.error('❌ Error loading stats:', err);
      setError('Failed to load lead statistics. Please check your authentication.');
    }
  }, [isAuthenticated, user, token, selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType]);

  // New handler functions for the integrated components
  const handleFiltersChange = (newFilters: LeadFilters) => {
    console.log('🔍 DEBUG: handleFiltersChange called', { 
      newFilters, 
      currentLeadsLength: leads?.length,
      loading 
    });
    setFilters(newFilters);
    
    // Use requestIdleCallback or setTimeout to defer URL update
    // This prevents the URL update from interfering with input focus
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        isUpdatingUrl.current = true;
        const params = new URLSearchParams();
        if (newFilters.search) params.set('search', newFilters.search);
        if (newFilters.status) params.set('status', newFilters.status);
        if (newFilters.followUpTimeframe) params.set('followUp', newFilters.followUpTimeframe);
        if (newFilters.page && newFilters.page !== 1) params.set('page', newFilters.page.toString());
        
        // Update URL without refreshing the page (use replace to avoid adding to history on every keystroke)
        const queryString = params.toString();
        const newUrl = queryString ? `/sales-crm?${queryString}` : '/sales-crm';
        router.replace(newUrl, { scroll: false });
        isUpdatingUrl.current = false;
      }, 0);
    }
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    handleFiltersChange(newFilters);
  };

  const handleSortChange = (sortBy: string, sortOrder: "ASC" | "DESC") => {
    const newFilters = { ...filters, sortBy, sortOrder, page: 1 };
    setFilters(newFilters);
  };

  const handleViewModeChange = (mode: 'all' | 'assigned') => {
    setViewMode(mode);
    console.log('🔄 View mode changed to:', mode);
  };

  const handleResetAppHeader = () => {
    // Reset app header selections to show all data for the current user
    setSelectedDesignation(undefined);
    console.log('🔄 App header selections reset');
  };

  // Function to fetch all leads without pagination for CSV export
  const fetchAllLeadsForExport = async (): Promise<Lead[]> => {
    try {
      // Build the same filters as loadLeads but without pagination
      const enhancedFilters: LeadFilters = { 
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'DESC'
      };

      // Copy all the filter logic from loadLeads
      // Add date filtering
      if (selectedOption && selectedOption !== 'all' && selectedOption !== '' && selectedOption !== 'till_date') {
        const now = new Date();
        let startDate: Date | null;
        let endDate: Date | null = now;

        switch (selectedOption) {
          case 'daily':
          case 'today':
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'yesterday':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setDate(endDate.getDate() - 1);
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'weekly':
            startDate = new Date();
            const dayOfWeek = startDate.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate.setDate(startDate.getDate() - daysToMonday);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'quarterly':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3;
            startDate = new Date(now.getFullYear(), quarterStart, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'custom':
            if (customDates.start && customDates.end) {
              startDate = new Date(customDates.start);
              startDate.setHours(0, 0, 0, 0);
              endDate = new Date(customDates.end);
              endDate.setHours(23, 59, 59, 999);
            } else {
              startDate = null;
              endDate = null;
            }
            break;
          default:
            startDate = null;
            endDate = null;
        }

        if (startDate && endDate && startDate.getTime() > 0) {
          enhancedFilters.createdAfter = startDate.toISOString();
          enhancedFilters.createdBefore = endDate.toISOString();
        }
      }

      // Add employee filtering
      const employeeId = selectedTeamMember || selectedEmployee;
      if (employeeId && employeeId !== 'all') {
        if (viewMode === 'all') {
          enhancedFilters.employeeId = parseInt(employeeId);
        } else {
          enhancedFilters.assignedToId = parseInt(employeeId);
        }
      } else if (employeeId !== 'all' && user?.id) {
        if (viewMode === 'all') {
          enhancedFilters.employeeId = user.id;
        } else {
          enhancedFilters.assignedToId = user.id;
        }
      }

      // Don't send designationLevel for export either - list should show full hierarchy

      // Don't send type parameter for export either - use employeeId vs assignedToId

      // Add search and status filters from the filters state
      if (filters.search) {
        enhancedFilters.search = filters.search;
      }
      if (filters.status) {
        enhancedFilters.status = filters.status;
      }
      if (filters.followUpTimeframe) {
        enhancedFilters.followUpTimeframe = filters.followUpTimeframe;
      }

      console.log('📊 Fetching all leads for export with filters:', enhancedFilters);

      // Fetch all pages
      let allLeads: Lead[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const pageFilters = { ...enhancedFilters, page: currentPage, limit: 100 }; // Use larger page size for efficiency
        const response = await leadService.getLeads(pageFilters);
        
        const pageLeads = response.leads || [];
        allLeads = [...allLeads, ...pageLeads];
        
        totalPages = response.pagination?.totalPages || 1;
        currentPage++;
        
        console.log(`📄 Fetched page ${currentPage - 1}/${totalPages}, Total leads so far: ${allLeads.length}`);
      } while (currentPage <= totalPages);

      console.log(`✅ Fetched all ${allLeads.length} leads for export`);
      return allLeads;
    } catch (error) {
      console.error('❌ Error fetching leads for export:', error);
      throw error;
    }
  };

  // Function to fetch all leads without pagination for CSV export

  const handleExportCSV = async () => {
    try {
      console.log('📊 Starting CSV export...');
      setLoading(true);
      
      // Fetch all leads across all pages
      const allLeads = await fetchAllLeadsForExport();
      
      console.log('📊 Exporting leads to CSV...', { count: allLeads.length });
      exportLeadsToCSV(allLeads, combinedUserMap);
      
      setLoading(false);
    } catch (error) {
      console.error('Error exporting leads:', error);
      setError('Failed to export leads. Please try again.');
      setLoading(false);
    }
  };

  const handleExportXLSX = async () => {
    try {
      console.log('📊 Starting XLSX export...');
      setLoading(true);
      
      // Fetch all leads across all pages
      const allLeads = await fetchAllLeadsForExport();
      
      console.log('📊 Exporting leads to XLSX...', { count: allLeads.length });
      exportLeadsToXLSX(allLeads, combinedUserMap);
      
      setLoading(false);
    } catch (error) {
      console.error('Error exporting leads:', error);
      setError('Failed to export leads. Please try again.');
      setLoading(false);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const handleDeleteLead = (leadId: number) => {
    const lead = leads?.find(l => l.id === leadId);
    if (lead) {
      setLeadToDelete(lead);
      setShowDeleteModal(true);
    }
  };

  const handleSaveEdit = async (leadId: number, data: UpdateLeadData) => {
    try {
      await leadService.updateLead(leadId, data);
      await loadLeads(); // Refresh the leads list
      setShowEditModal(false);
      setSelectedLead(null);
    } catch (error) {
      throw error; // Let the modal handle the error display
    }
  };

  const handleConfirmDelete = async (leadId: number) => {
    try {
      await leadService.deleteLead(leadId);
      await loadLeads(); // Refresh the leads list
      setShowDeleteModal(false);
      setLeadToDelete(null);
    } catch (error) {
      throw error; // Let the modal handle the error display
    }
  };

  const buildUserMap = (employeeData: EmployeeItem[]) => {
    const map: { [key: number]: string } = {};
    const options: { value: string; label: string }[] = [];
    
    employeeData.forEach(emp => {
      map[emp.id] = emp.name;
      options.push({ value: emp.id.toString(), label: emp.name });
    });
    
    setUserMap(map);
    setUserOptions(options);
  };

  const loadEmployeeData = async () => {
    try {
      // Try to get all employees from all designations
      const designationResponse = await apiClient.get<{ success: boolean; data: DesignationItem[] }>(
        AdminEndpoints.DESIGNATION_LIST
      );

      if (designationResponse.data.success) {
        const allEmployees: EmployeeItem[] = [];
        
        // Fetch employees for each designation
        for (const designation of designationResponse.data.data) {
          try {
            const endpoint = `${AdminEndpoints.ROLE_WISE_EMPLOYEE_LIST}?role=${designation.level}`;
            const employeeResponse = await apiClient.get<{ success: boolean; data: EmployeeItem[] }>(endpoint);
            
            if (employeeResponse.data.success) {
              allEmployees.push(...employeeResponse.data.data);
            }
          } catch (error) {
            console.warn(`Failed to load employees for designation ${designation.hierarchyName}:`, error);
          }
        }
        
        // Remove duplicates based on ID
        const uniqueEmployees = allEmployees.reduce((acc: EmployeeItem[], current) => {
          const exists = acc.find(emp => emp.id === current.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        buildUserMap(uniqueEmployees);
      }
    } catch (error) {
      console.error('Error loading all employee data:', error);
      
      // Fallback user map with the IDs from your API response
      const fallbackUsers: EmployeeItem[] = [
        { id: 2, name: "John Doe" },
        { id: 8, name: "Admin User" },
        { id: 62, name: "Sarah Smith" },
        { id: 92, name: "Mike Johnson" },
      ];
      buildUserMap(fallbackUsers);
    }
  };

  /**
   * Enhanced function to load all user names who appear in leads data
   * This ensures we have names for everyone - managers, current user, and people in hierarchy
   */
  const loadAllUserNamesFromLeads = async (leadsData: Lead[]) => {
    const uniqueUserIds = new Set<number>();
    
    // Collect all user IDs from leads data
    leadsData.forEach(lead => {
      if (lead.assignedToId) uniqueUserIds.add(lead.assignedToId);
      if (lead.generatedById) uniqueUserIds.add(lead.generatedById);
    });

    // Add current user ID to ensure we have their name
    if (user?.id) uniqueUserIds.add(user.id);

    console.log('🔍 Unique user IDs found in leads:', Array.from(uniqueUserIds));

    // Try to get names for these specific users
    const newUserMap: { [key: number]: string } = { ...userMap };
    const missingUserIds: number[] = [];

    // Check which users we don't have names for
    uniqueUserIds.forEach(id => {
      if (!newUserMap[id]) {
        missingUserIds.push(id);
      }
    });

    if (missingUserIds.length > 0) {
      console.log('🔍 Missing user names for IDs:', missingUserIds);

      // Try to get missing employees from the existing role-wise endpoint
      try {
        // Get all designations and try to find missing users
        const designationResponse = await apiClient.get<{ success: boolean; data: DesignationItem[] }>(
          AdminEndpoints.DESIGNATION_LIST
        );

        if (designationResponse.data.success) {
          // Try each designation level to find missing users
          for (const designation of designationResponse.data.data) {
            try {
              const endpoint = `${AdminEndpoints.ROLE_WISE_EMPLOYEE_LIST}?role=${designation.level}`;
              const employeeResponse = await apiClient.get<{ success: boolean; data: EmployeeItem[] }>(endpoint);
              
              if (employeeResponse.data.success) {
                employeeResponse.data.data.forEach(emp => {
                  if (uniqueUserIds.has(emp.id) && !newUserMap[emp.id]) {
                    newUserMap[emp.id] = emp.name;
                  }
                });
              }
            } catch (error) {
              console.warn(`Could not load employees for role ${designation.level}:`, error);
            }
          }
        }

        console.log('✅ Loaded missing names from role-wise endpoints');
      } catch (error) {
        console.warn('⚠️ Could not load from role-wise employee endpoints:', error);
      }

      // Try to get missing users from all employees endpoint as a last resort
      const stillMissingIds = missingUserIds.filter(id => !newUserMap[id]);
      if (stillMissingIds.length > 0) {
        try {
          console.log('🔍 Trying all employees endpoint for missing users:', stillMissingIds);
          // Try the general userOptions list first
          if (userOptions && userOptions.length > 0) {
            userOptions.forEach(userOption => {
              const userId = parseInt(userOption.value);
              if (stillMissingIds.includes(userId)) {
                newUserMap[userId] = userOption.label;
                console.log(`✅ Found ${userId} in userOptions: ${userOption.label}`);
              }
            });
          }
        } catch (error) {
          console.warn('⚠️ Could not load from userOptions:', error);
        }
      }

      // Final fallback: Set default names for any still missing users
      missingUserIds.forEach(id => {
        if (!newUserMap[id]) {
          // Set a default name with special styling for current user
          if (id === user?.id) {
            newUserMap[id] = user?.name || `You (${id})`;
          } else {
            newUserMap[id] = `User ${id}`;
            console.warn(`⚠️ Could not find name for user ${id}, using fallback`);
          }
        }
      });
    }

    setUserMap(newUserMap);
    console.log('✅ Updated user map:', newUserMap);
  };

  // Fetch designations on component mount
  useEffect(() => {
    const fetchDesignations = async () => {
      setIsLoadingDesignations(true);
      try {
        const response = await apiClient.get<{ success: boolean; data: DesignationItem[] }>(
          AdminEndpoints.DESIGNATION_LIST
        );

        if (response.data.success) {
          const designationOptions = response.data.data.map((item: DesignationItem) => ({
            value: item.level.toString(),
            label: item.hierarchyName
          }));
          setDesignations(designationOptions);
        }
      } catch (error) {
        console.error("Failed to fetch designations:", error);
      } finally {
        setIsLoadingDesignations(false);
      }
    };

    fetchDesignations();
  }, []);

  // Fetch employees when designation changes
  useEffect(() => {
    if (selectedDesignation && selectedDesignation !== 'all') {
      const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        try {
          const endpoint = `${AdminEndpoints.ROLE_WISE_EMPLOYEE_LIST}?role=${selectedDesignation}`;
          const response = await apiClient.get<{ success: boolean; data: EmployeeItem[] }>(endpoint);

          if (response.data.success) {
            const employeeOptions = response.data.data.map((item: EmployeeItem) => ({
              value: item.id.toString(),
              label: item.name
            }));
            setEmployees(employeeOptions);
          }
        } catch (error) {
          console.error("Failed to fetch employees:", error);
          setEmployees([]);
        } finally {
          setIsLoadingEmployees(false);
        }
      };

      fetchEmployees();
    } else {
      setEmployees([]);
    }
  }, [selectedDesignation]);

  // Load leads when filters change
  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Reset to page 1 when AppHeader filters change
  useEffect(() => {
    console.log('🔄 AppHeader filters changed, resetting to page 1');
    setFilters(prev => ({ ...prev, page: 1 }));
  }, [selectedOption, selectedEmployee, selectedTeamMember, selectedDesignation, customDates, viewMode]);

  // Load stats when filters change
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Load user data on component mount
  useEffect(() => {
    loadEmployeeData(); // Use the existing employee data loading
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      setImageError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLead = async () => {
    if (newLead.name && newLead.mobileNumber && newLead.email) {
      try {
        setLoading(true);
        setError(null);
        
        // Add the required generatedById field from the current user
        // Clean up the data by removing undefined, null, and empty string values
        const leadData: CreateLeadData = {
          name: newLead.name.trim(),
          email: newLead.email.trim(),
          mobileNumber: newLead.mobileNumber.trim(),
          generatedById: user?.id || 1, // Use current user's ID or fallback to 1
          source: (newLead.source && newLead.source.trim()) || 'Website', // Default to 'Website' if not provided
          appType: (newLead.appType && newLead.appType.trim()) || undefined, // Include appType
          status: newLead.status || 'new', // Default to 'new' if not provided
        };
        
        // Add optional fields only if they have valid values
        if (newLead.assignedToId && typeof newLead.assignedToId === 'number' && !isNaN(newLead.assignedToId)) {
          leadData.assignedToId = newLead.assignedToId;
        }

        if (newLead.potentialInvestment && typeof newLead.potentialInvestment === 'number' && !isNaN(newLead.potentialInvestment)) {
          leadData.potentialInvestment = newLead.potentialInvestment;
        }
        if (newLead.nextFollowUpAt && newLead.nextFollowUpAt.trim()) {
          leadData.nextFollowUpAt = newLead.nextFollowUpAt.trim();
        }
        if (newLead.notes && newLead.notes.trim()) {
          leadData.notes = newLead.notes.trim();
        }
        
        await leadService.createLead(leadData, selectedImage || undefined);
        
        // Refresh the leads list and stats
        await loadLeads();
        await loadStats();
        
        // Reset form
        setNewLead({
          name: '',
          email: '',
          mobileNumber: '',
          source: 'Website',
          appType: '',
          status: 'new',
          potentialInvestment: undefined,
          nextFollowUpAt: '',
          notes: '',
          imageUrl: ''
        });
        setSelectedDesignation('');
        setEmployees([]);
        // Reset validation states
        setEmailError('');
        setPhoneError('');
        setEmailTouched(false);
        setPhoneTouched(false);
        setSelectedImage(null);
        setImagePreview('');
        setImageError('');
        setShowAddLead(false);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create lead. Please try again.';
        
        // Check if error is related to mobile number conflict
        const isMobileNumberError = errorMessage.toLowerCase().includes('mobile number') || 
                                     errorMessage.toLowerCase().includes('phone number') ||
                                     errorMessage.toLowerCase().includes('already exists');
        
        if (isMobileNumberError) {
          // Set phone error to show below the phone input
          setPhoneError(errorMessage);
          setPhoneTouched(true);
          // Also set general error for visibility
          setError(errorMessage);
        } else {
          setError(errorMessage);
        }
        
        console.error('Error creating lead:', err);
      } finally {
        setLoading(false);
      }
    }
  };



  // const updateLeadStatus = async (id: number, newStatus: string) => {
  //   try {
  //     await leadsAPI.updateLeadStatus(id, newStatus);
  //     setLeads(leads.map(lead => 
  //       lead.id === id ? { 
  //         ...lead, 
  //         status: newStatus as 'New' | 'In Progress' | 'Converted' | 'Lost', 
  //         lastContact: new Date().toISOString().split('T')[0] 
  //       } : lead
  //     ));
  //   } catch (err) {
  //     setError('Failed to update lead status. Please try again.');
  //     console.error('Error updating lead status:', err);
  //   }
  // };


  // Helper function to format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'new': return 'New';
      case 'in-progress': return 'In Progress';
      case 'converted': return 'Converted';
      case 'lost': return 'Lost';
      default: return status;
    }
  };

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const datePart = dateString.split(/[T ]/)[0];
    console.log("🔍 formatDate - input:", dateString, "datePart:", datePart);
    const [year, month, day] = datePart.split('-');
    
    // Format date without timezone conversion
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
    
    console.log("🔍 formatDate - result:", result);
    return result;
  };

  // Clean up old variables that are no longer needed
  // Note: All filtering is now handled server-side via API through the new filter system

  // Loading state - only show loading spinner on initial load (when leads is null)
  console.log('🔍 DEBUG: Render check', { 
    loading, 
    leadsIsNull: leads === null,
    leadsLength: leads?.length,
    showingSpinner: loading && leads === null
  });
  if (loading && leads === null) {
    console.log('🔍 DEBUG: SHOWING LOADING SPINNER (first load only)');
    return (
      <>
        <PageBreadCrumb pageTitle="Sales CRM" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadCrumb pageTitle="Sales CRM" />
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {setError(null); loadLeads();}}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}
      
      <div className="grid gap-6 w-full max-w-full">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 dark:border-white/[0.05] dark:bg-white/[0.03] shadow-theme-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Sales CRM</h1>
              <p className="text-body dark:text-bodydark">Lead & Conversion Tracking</p>
            </div>
            <div className="flex gap-3">
              {/* Export Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  disabled={loading || pagination.total === 0}
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  <span>{loading ? 'Exporting...' : `Export ${pagination.total > 0 ? `(${pagination.total})` : ''}`}</span>
                  <svg 
                    className="w-4 h-4 ml-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </Button>
                
                {/* Dropdown Menu */}
                {showExportDropdown && !loading && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowExportDropdown(false);
                          handleExportCSV();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export as CSV
                      </button>
                      <button
                        onClick={() => {
                          setShowExportDropdown(false);
                          handleExportXLSX();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Export as XLSX
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                variant="primary"
                onClick={() => setShowAddLead(true)}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="xl:flex items-stretch justify-between mt-5 sales-box-row ">
            <div className="col-span-4">
              <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                <SalesIcon />
                <h2 className="numbers-sale text-gray-900">{stats?.total || 0}</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    Total Leads
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                <SalesIconOrange />
                <h2 className="numbers-sale text-gray-900">{stats?.new || 0}</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    New Leads
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                <SalesIconGreen />
                <h2 className="numbers-sale text-gray-900">{stats?.["in-progress"] || 0}</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    In Progress
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                <SalesIconViolet />
                <h2 className="numbers-sale text-gray-900">{stats?.converted || 0}</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    Converted
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                <SalesIconOrange />
                <h2 className="numbers-sale text-gray-900">{stats?.lost || 0}</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    Lost Leads
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full bg-white border border-gray-200 rounded-xl dark:bg-white/[0.03] dark:border-white/[0.05]">
                <SalesIcon />
                <h2 className="numbers-sale text-gray-900">{stats?.conversionRate || 0}%</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    Conversion Rate
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <LeadsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          userOptions={userOptions}
          isLoading={loading}
          onViewModeChange={handleViewModeChange}
          viewMode={viewMode}
          onResetAppHeader={handleResetAppHeader}
        />

        {/* Leads Table */}
        <LeadsTable
          leads={leads || []}
          error={error}
          onEditLead={handleEditLead}
          onDeleteLead={handleDeleteLead}
          onSortChange={handleSortChange}
          currentSort={{ sortBy: filters.sortBy || "createdAt", sortOrder: filters.sortOrder || "DESC" }}
          userMap={combinedUserMap}
          currentUserId={user?.id}
          isAdmin={isAdmin}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddLead && (
        <Modal 
          isOpen={showAddLead} 
          onClose={() => {
            setShowAddLead(false);
            setError(null); // Clear error when closing
            // Reset validation states
            setEmailError('');
            setPhoneError('');
            setEmailTouched(false);
            setPhoneTouched(false);
            setSelectedImage(null);
            setImagePreview('');
            setImageError('');
          }}
          showCloseButton={true}
          className="max-w-2xl w-full mx-auto my-8"
        >
          <div className="bg-white border border-gray-200 rounded-xl max-h-[90vh] overflow-x-hidden shadow-theme-xs dark:border-white/[0.05] dark:bg-white/[0.03] relative">
            <div className="p-6 border-b border-gray-200 dark:border-white/[0.06]">
              <h2 className="text-2xl font-bold text-black dark:text-white">Add New Lead</h2>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)] overflow-x-hidden">
              {/* Insert Error Message Here */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        Error Adding Lead
                      </h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Name <span className="text-red-500">*(Mandatory)</span> </label>
                  <input
                    type="text"
                    value={newLead.name || ''}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Mobile Number <span className="text-red-500">*(Mandatory)</span></label>
                  <input
                    type="tel"
                    value={newLead.mobileNumber || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewLead({...newLead, mobileNumber: value});
                      setPhoneTouched(true);
                      // Clear any previous backend error when user starts typing
                      if (error && (error.toLowerCase().includes('mobile number') || error.toLowerCase().includes('phone number') || error.toLowerCase().includes('already exists'))) {
                        setError(null);
                      }
                      // Remove any non-digit characters for validation
                      const digitsOnly = value.replace(/\D/g, '');
                      if (value && digitsOnly.length !== 10) {
                        setPhoneError('Phone number must be exactly 10 digits');
                      } else {
                        setPhoneError('');
                      }
                    }}
                    className={`w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border ${
                      phoneTouched && phoneError 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-stroke dark:border-gray-700'
                    } focus:border-primary focus:ring-1 focus:ring-primary outline-none`}
                  />
                  {phoneTouched && phoneError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{phoneError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Email <span className="text-red-500">*(Mandatory)</span> </label>
                  <input
                    type="email"
                    value={newLead.email || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewLead({...newLead, email: value});
                      setEmailTouched(true);
                      if (value && !emailRegex.test(value)) {
                        setEmailError('Please enter a valid email address');
                      } else {
                        setEmailError('');
                      }
                    }}
                    className={`w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border ${
                      emailTouched && emailError 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-stroke dark:border-gray-700'
                    } focus:border-primary focus:ring-1 focus:ring-primary outline-none`}
                  />
                  {emailTouched && emailError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{emailError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Source <span className="text-red-500">*(Mandatory)</span> </label>
                  <div className="relative">
                    <Select
                      options={[
                        { value: 'Website', label: 'Website' },
                        { value: 'Referral', label: 'Referral' },
                        { value: 'Cold Call', label: 'Cold Call' },
                        { value: 'Social Media', label: 'Social Media' },
                        { value: 'Event', label: 'Event' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      placeholder="Select Source"
                      value={selectedSourceOption}
                      onChange={(option) => {
                        const value = option?.value || 'Website';
                        setSelectedSourceOption(value);
                        if (value === 'Other') {
                          setCustomSource('');
                          setNewLead({ ...newLead, source: '' });
                        } else {
                          setCustomSource('');
                          setNewLead({ ...newLead, source: value });
                        }
                      }}
                      className="dark:bg-dark-900"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {selectedSourceOption === 'Other' && (
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-black/70 dark:text-white/70 mb-1">
                        Other Source
                      </label>
                      <input
                        type="text"
                        value={customSource}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomSource(value);
                          setNewLead({ ...newLead, source: value });
                        }}
                        className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Enter custom source"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Assign to Designation</label>
                  <div className="relative">
                    <Select
                      options={[
                        {
                          value: '',
                          label: isLoadingDesignations ? 'Loading designations...' : 'Select Designation',
                        },
                        { value: 'assign_to_yourself', label: '🙋‍♂️ Assign to Yourself' },
                        ...designations,
                      ]}
                      placeholder="Select Designation"
                      value={selectedDesignation}
                      onChange={(option) => {
                        const value = option?.value || '';
                        setSelectedDesignation(value);
                        // If "assign to yourself" is selected, automatically set the current user
                        if (value === 'assign_to_yourself' && user?.id) {
                          setNewLead({ ...newLead, assignedToId: user.id });
                        } else {
                          setNewLead({ ...newLead, assignedToId: undefined });
                        }
                      }}
                      className={`dark:bg-dark-900 ${isLoadingDesignations ? 'pointer-events-none opacity-60' : ''}`}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Assign to Employee</label>
                  <div className="relative">
                    <Select
                      options={
                        selectedDesignation === 'assign_to_yourself'
                          ? user?.id
                            ? [
                                {
                                  value: String(user.id),
                                  label: `✅ Assigned to You (${user.name || 'You'})`,
                                },
                              ]
                            : []
                          : [
                              { value: '', label: 'Unassigned' },
                              ...(selectedDesignation && !isLoadingEmployees && employees.length > 0
                                ? employees
                                : !selectedDesignation && userOptions.length > 0
                                ? userOptions
                                : []),
                            ]
                      }
                      placeholder="Select Employee"
                      value={
                        selectedDesignation === 'assign_to_yourself'
                          ? user?.id?.toString() || ''
                          : (newLead.assignedToId && String(newLead.assignedToId)) || ''
                      }
                      onChange={(option) => {
                        if (selectedDesignation === 'assign_to_yourself') return;
                        const id = option?.value ? Number(option.value) : undefined;
                        setNewLead({ ...newLead, assignedToId: id });
                      }}
                      className={`dark:bg-dark-900 ${
                        selectedDesignation === 'assign_to_yourself' || isLoadingEmployees
                          ? 'opacity-50 cursor-not-allowed pointer-events-none'
                          : ''
                      }`}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {isLoadingEmployees && (
                    <p className="text-sm text-gray-500 mt-1">Loading employees...</p>
                  )}
                  {selectedDesignation === 'assign_to_yourself' && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      💡 Lead will be assigned to you automatically
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Expected Investment</label>
                  <input
                    type="number"
                    value={newLead.potentialInvestment || ''}
                    onChange={(e) => setNewLead({...newLead, potentialInvestment: e.target.value ? Number(e.target.value) : undefined})}
                    placeholder="500000"
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">App Type <span className="text-red-500">*(Mandatory)</span> </label>
                  <div className="relative">
                    <Select
                      options={[
                        { value: 'Fydaa', label: 'Fydaa' },
                        { value: 'Savestment', label: 'Savestment' },
                      ]}
                      placeholder="Select App Type"
                      value={newLead.appType || null}
                      onChange={(option) => {
                        const value = option?.value || '';
                        setNewLead({ ...newLead, appType: value });
                      }}
                      className="dark:bg-dark-900"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <DatePicker
                    label="Next Follow-up Date"
                    value={newLead.nextFollowUpAt || ''}
                    onChange={(value) => setNewLead({...newLead, nextFollowUpAt: value})}
                    placeholder="Select follow-up date"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Notes</label>
                  <textarea
                    value={newLead.notes || ''}
                    onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                    rows={3}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lead Image <span className="text-red-500">*(Image Upload is Mandatory)</span> 
                  </label>
                  <input
                    type="file"
                    id="create-lead-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="create-lead-image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-gray-900 dark:text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Image
                  </label>
                  
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  )}
                  
                  {imageError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{imageError}</p>
                  )}
                  
                  {!selectedImage && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                          Supported formats: JPEG, PNG, JPG (Max 5MB) - Image cannot be changed after upload
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddLead(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddLead}
                  disabled={
                    !newLead.name || 
                    !newLead.mobileNumber || 
                    !newLead.email || 
                    !newLead.appType ||
                    loading ||
                    !!emailError ||
                    !!phoneError ||
                    !!imageError ||
                    !emailRegex.test(newLead.email || '') ||
                    !phoneRegex.test((newLead.mobileNumber || '').replace(/\D/g, ''))
                  }
                  className="flex-1"
                >
                  {loading ? 'Adding...' : 'Add Lead'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* View Lead Details Modal */}
      {selectedLead && (
        <Modal 
          isOpen={!!selectedLead} 
          onClose={() => setSelectedLead(null)}
          showCloseButton={true}
          className="max-w-2xl w-full mx-auto my-8"
        >
          <div className="bg-white dark:bg-dark rounded-xl border border-stroke dark:border-strokedark">
            <div className="p-6 border-b border-stroke dark:border-strokedark">
              <h2 className="text-2xl font-bold text-black dark:text-white">{selectedLead.name}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Mobile Number</p>
                  <p className="text-black dark:text-white">{selectedLead.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Email</p>
                  <p className="text-black dark:text-white">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Source</p>
                  <p className="text-black dark:text-white">{selectedLead.source}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Status</p>
                  <p className="text-black dark:text-white">{formatStatus(selectedLead.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Assigned To ID</p>
                  <p className="text-black dark:text-white">{selectedLead.assignedToId || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Potential Investment</p>
                  <p className="text-black dark:text-white">
                    {selectedLead.potentialInvestment ? `₹${selectedLead.potentialInvestment.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Last Contact</p>
                  <p className="text-black dark:text-white">{formatDate(selectedLead.lastContactedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Next Follow-up</p>
                  <p className="text-black dark:text-white">{formatDate(selectedLead.nextFollowUpAt)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-body dark:text-bodydark mb-1">Notes</p>
                  <p className="text-black dark:text-white">{selectedLead.notes || 'No notes'}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Lead Modal */}
      <EditLeadModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLead(null);
        }}
        onSave={handleSaveEdit}
        lead={selectedLead}
        userOptions={userOptions}
        currentUser={user ? { id: user.id, name: user.name || 'You' } : null}
        designations={designations}
      />

      {/* Delete Lead Modal */}
      <DeleteLeadModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setLeadToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        lead={leadToDelete}
      />
    </>
  );
}