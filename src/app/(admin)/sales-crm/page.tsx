"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    selectedEmployee 
  } = useGlobalContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [userMap, setUserMap] = useState<{ [key: number]: string }>({});
  const [backendUserNames, setBackendUserNames] = useState<{ [key: number]: string }>({});
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'assigned'>('assigned');

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
    status: 'new',
    potentialInvestment: undefined,
    nextFollowUpAt: '',
    notes: ''
  });

  const loadLeads = useCallback(async (filtersToUse?: LeadFilters) => {
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
      if (selectedEmployee && selectedEmployee !== 'all') {
        // When a specific employee is selected from header dropdown
        if (viewMode === 'all') {
          // Show all leads under that employee (hierarchy + assigned)
          enhancedFilters.employeeId = parseInt(selectedEmployee);
          console.log('👤 Show All mode - Employee hierarchy filter applied:', {
            selectedEmployee,
            employeeId: parseInt(selectedEmployee)
          });
        } else {
          // Show only leads assigned to that employee
          enhancedFilters.assignedToId = parseInt(selectedEmployee);
          console.log('👤 Assigned mode - Employee assignedTo filter applied:', {
            selectedEmployee,
            assignedToId: parseInt(selectedEmployee)
          });
        }
      } else if (user?.id) {
        // When no specific employee is selected, apply to logged-in user
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

      // Add designation filtering (this will need to be handled on backend)
      // Exclude 'assign_to_yourself' as it's not a designation level
      if (selectedDesignation && selectedDesignation !== 'all' && selectedDesignation !== 'assign_to_yourself') {
        const designationLevel = parseInt(selectedDesignation);
        if (!isNaN(designationLevel)) {
          enhancedFilters.designationLevel = designationLevel;
        }
      }

      console.log('🔍 Enhanced filters being applied:', enhancedFilters);
      
      const response = await leadService.getLeads(enhancedFilters);
      
      // Access the data from the response structure
      const leads = response.leads || [];
      const pagination = response.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };
      const backendEmployeeNames = response.employeeNames || {};
      
      setLeads(leads);
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
      setLoading(false);
    }
  }, [filters, selectedOption, customDates, selectedEmployee, selectedDesignation, viewMode]);

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
      if (selectedEmployee && selectedEmployee !== 'all') {
        if (viewMode === 'all') {
          // Show stats for all leads under that employee (hierarchy + assigned)
          statsFilters = {
            ...statsFilters,
            employeeId: parseInt(selectedEmployee)
          };
          console.log('📊 Show All mode - Stats employee hierarchy filter applied:', {
            selectedEmployee,
            employeeId: parseInt(selectedEmployee)
          });
        } else {
          // Show stats for only leads assigned to that employee
          statsFilters = {
            ...statsFilters,
            assignedToId: parseInt(selectedEmployee)
          };
          console.log('📊 Assigned mode - Stats employee assignedTo filter applied:', {
            selectedEmployee,
            assignedToId: parseInt(selectedEmployee)
          });
        }
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
  }, [isAuthenticated, user, token, selectedOption, customDates, selectedEmployee, viewMode]);

  // New handler functions for the integrated components
  const handleFiltersChange = (newFilters: LeadFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
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

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const handleDeleteLead = (leadId: number) => {
    const lead = leads.find(l => l.id === leadId);
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
  }, [selectedOption, selectedEmployee, selectedDesignation, customDates, viewMode]);

  // Load stats when filters change
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Load user data on component mount
  useEffect(() => {
    loadEmployeeData(); // Use the existing employee data loading
  }, []);

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
        
        console.log('🚀 Creating lead with cleaned data:', JSON.stringify(leadData, null, 2));
        await leadService.createLead(leadData);
        
        // Refresh the leads list and stats
        await loadLeads();
        await loadStats();
        
        // Reset form
        setNewLead({
          name: '',
          email: '',
          mobileNumber: '',
          source: 'Website',
          status: 'new',
          potentialInvestment: undefined,
          nextFollowUpAt: '',
          notes: ''
        });
        setSelectedDesignation('');
        setEmployees([]);
        setShowAddLead(false);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create lead. Please try again.';
        setError(errorMessage);
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
    return new Date(dateString).toLocaleDateString();
  };

  // Clean up old variables that are no longer needed
  // Note: All filtering is now handled server-side via API through the new filter system

  // Loading state - only show loading spinner on initial load
  if (loading && (!leads || leads.length === 0)) {
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
      
      <div className="grid gap-6">
        {/* Header */}
        <div className="bg-white dark:bg-dark rounded-lg border border-stroke dark:border-strokedark p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Sales CRM</h1>
              <p className="text-body dark:text-bodydark">Lead & Conversion Tracking</p>
            </div>
            <div className="flex gap-3">
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
          <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
            <div className="col-span-4">
              <div className="box-total-sales h-full">
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
              <div className="box-total-sales h-full">
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
              <div className="box-total-sales h-full">
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
              <div className="box-total-sales h-full">
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
              <div className="box-total-sales h-full">
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
              <div className="box-total-sales h-full">
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
          leads={leads}
          error={error}
          onEditLead={handleEditLead}
          onDeleteLead={handleDeleteLead}
          onSortChange={handleSortChange}
          currentSort={{ sortBy: filters.sortBy || "createdAt", sortOrder: filters.sortOrder || "DESC" }}
          userMap={combinedUserMap}
          currentUserId={user?.id}
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
          onClose={() => setShowAddLead(false)}
          showCloseButton={true}
          className="max-w-2xl w-full mx-auto my-8"
        >
          <div className="bg-white dark:bg-dark rounded-xl border border-stroke dark:border-strokedark max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stroke dark:border-strokedark">
              <h2 className="text-2xl font-bold text-black dark:text-white">Add New Lead</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Name *</label>
                  <input
                    type="text"
                    value={newLead.name || ''}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    value={newLead.mobileNumber || ''}
                    onChange={(e) => setNewLead({...newLead, mobileNumber: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={newLead.email || ''}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Source</label>
                  <select
                    value={newLead.source || 'Website'}
                    onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Cold Call</option>
                    <option>Social Media</option>
                    <option>Event</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Assign to Designation</label>
                  <select
                    value={selectedDesignation}
                    onChange={(e) => {
                      setSelectedDesignation(e.target.value);
                      // If "assign to yourself" is selected, automatically set the current user
                      if (e.target.value === 'assign_to_yourself' && user?.id) {
                        setNewLead({...newLead, assignedToId: user.id});
                      } else {
                        setNewLead({...newLead, assignedToId: undefined});
                      }
                    }}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    disabled={isLoadingDesignations}
                  >
                    <option value="">
                      {isLoadingDesignations ? "Loading designations..." : "Select Designation"}
                    </option>
                    {/* Assign to Yourself Option */}
                    <option 
                      value="assign_to_yourself" 
                      className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                    >
                      🙋‍♂️ Assign to Yourself
                    </option>
                    {designations.map((designation) => (
                      <option key={designation.value} value={designation.value}>
                        {designation.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Assign to Employee</label>
                  <select
                    value={newLead.assignedToId || ''}
                    onChange={(e) => setNewLead({...newLead, assignedToId: e.target.value ? Number(e.target.value) : undefined})}
                    className={`w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none ${
                      selectedDesignation === 'assign_to_yourself' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={selectedDesignation === 'assign_to_yourself' || isLoadingEmployees}
                  >
                    {selectedDesignation === 'assign_to_yourself' ? (
                      <option value={user?.id || ''}>
                        ✅ Assigned to You ({user?.name || 'You'})
                      </option>
                    ) : (
                      <>
                        <option value="">Unassigned</option>
                        {/* Designation-based employees */}
                        {selectedDesignation && !isLoadingEmployees && employees.length > 0 && (
                          <>
                            <optgroup label="Team Members">
                              {employees.map((employee) => (
                                <option key={employee.value} value={employee.value}>
                                  {employee.label}
                                </option>
                              ))}
                            </optgroup>
                          </>
                        )}
                        {/* All available employees if no designation selected */}
                        {!selectedDesignation && userOptions.length > 0 && (
                          <>
                            <optgroup label="All Employees">
                              {userOptions.map((user) => (
                                <option key={user.value} value={user.value}>
                                  {user.label}
                                </option>
                              ))}
                            </optgroup>
                          </>
                        )}
                      </>
                    )}
                  </select>
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
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
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
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
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
                  disabled={!newLead.name || !newLead.mobileNumber || !newLead.email || loading}
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