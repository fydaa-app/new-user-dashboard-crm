import { apiClient, ApiError } from './api-client';
import { LeadEndpoints } from '@/config/api-endpoints';

// Types for Lead management - matching backend API
export interface Lead {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  source: string;
  status: 'new' | 'in-progress' | 'converted' | 'lost';
  generatedById: number;
  assignedToId?: number;
  potentialInvestment?: number;
  notes?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  convertedAt?: string;
  convertedAmount?: number;
  priority?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadData {
  name: string;
  email: string;
  mobileNumber: string;
  source?: string;
  status?: 'new' | 'in-progress' | 'converted' | 'lost';
  generatedById?: number; // Add this required field
  assignedToId?: number;
  potentialInvestment?: number;
  notes?: string;
  nextFollowUpAt?: string;
  priority?: number;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  lastContactedAt?: string;
  convertedAt?: string;
  convertedAmount?: number;
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;
  status?: string;
  assignedToId?: number;
  generatedById?: number;
  priority?: number;
  fromDate?: string;
  toDate?: string;
  createdAfter?: string;
  createdBefore?: string;
  employeeId?: number; // Filter by either createdBy or assignedTo
  designationLevel?: number; // Filter by designation
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface LeadStats {
  total: number;
  new: number;
  'in-progress': number;
  converted: number;
  lost: number;
  conversionRate: number;
}

export interface LeadsResponse {
  leads: Lead[];
  employeeNames?: { [key: number]: string };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class LeadService {
  // Use the singleton API client instance

  // Get all leads with filters
  async getLeads(filters?: LeadFilters): Promise<LeadsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && !Number.isNaN(value)) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = queryParams.toString() ? 
        `${LeadEndpoints.LEADS}?${queryParams.toString()}` : 
        LeadEndpoints.LEADS;
      
      const response = await apiClient.get<LeadsResponse>(url);
      
      // The API client wraps responses, so we need response.data
      return response.data;
    } catch (error) {
      console.error('Error loading leads:', error);
      
      // If it's already an error with a meaningful message, pass it through
      if (error instanceof Error && error.message && error.message !== '[object Object]') {
        throw error;
      }
      
      // Otherwise, provide a generic message
      throw new Error('Failed to fetch leads. Please try again.');
    }
  }

  // Get lead by ID
  async getLeadById(id: number): Promise<Lead> {
    try {
      const response = await apiClient.get<Lead>(`${LeadEndpoints.LEAD_BY_ID}/${id}`);
      // The API client wraps responses, so we need response.data
      return response.data;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw new Error('Failed to fetch lead details. Please try again.');
    }
  }

  // Create new lead
  async createLead(leadData: CreateLeadData): Promise<Lead> {
    try {
      console.log('📝 Creating lead with data:', JSON.stringify(leadData, null, 2));
      const response = await apiClient.post<Lead>(LeadEndpoints.LEADS, leadData);
      console.log('✅ Create lead response:', response);
      
      // The API client wraps responses, so we need response.data
      return response.data;
    } catch (error) {
      console.error('❌ Error creating lead:', error);
      
      // Check if it's an ApiError instance
      if (error instanceof ApiError) {
        console.error('📡 API Error Details:', {
          status: error.status,
          message: error.message,
          data: error.data
        });
        
        // Try to extract error message from data
        if (error.data && typeof error.data === 'object') {
          const errorData = error.data as Record<string, unknown>;
          
          // Check for validation errors
          if (errorData.message && typeof errorData.message === 'string') {
            throw new Error(`Validation Error: ${errorData.message}`);
          }
          if (errorData.errors) {
            throw new Error(`Validation Errors: ${JSON.stringify(errorData.errors)}`);
          }
          // Check for nested error structure
          if (errorData.error && typeof errorData.error === 'object') {
            const nestedError = errorData.error as Record<string, unknown>;
            if (nestedError.message && typeof nestedError.message === 'string') {
              throw new Error(`Validation Error: ${nestedError.message}`);
            }
          }
        }
        
        // Use the error message if available
        throw new Error(error.message || 'Failed to create lead. Please check your input data.');
      }
      
      throw new Error('Failed to create lead. Please check your input data.');
    }
  }

  // Update lead
  async updateLead(id: number, leadData: UpdateLeadData): Promise<Lead> {
    try {
      console.log('🔄 Updating lead:', { id, leadData });
      console.log('📋 Lead data keys:', Object.keys(leadData));
      console.log('📋 Lead data values:', Object.values(leadData));
      console.log('📍 Update URL:', `${LeadEndpoints.LEAD_BY_ID}/${id}`);
      
      const response = await apiClient.put<Lead>(`${LeadEndpoints.LEAD_BY_ID}/${id}`, leadData);
      
      console.log('✅ Update response:', response);
      // The API client wraps responses, so we need response.data
      return response.data;
    } catch (error) {
      console.error('❌ Error updating lead:', error);
      
      // Check if it's a specific API error
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { 
          response?: { 
            status?: number; 
            statusText?: string; 
            data?: { message?: string } 
          }; 
          config?: { url?: string; method?: string } 
        };
        console.error('📡 API Error Details:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          url: apiError.config?.url,
          method: apiError.config?.method
        });
        
        // Return more specific error message
        if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        } else if (apiError.response?.status === 404) {
          throw new Error('Lead not found. It may have been deleted.');
        } else if (apiError.response?.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (apiError.response?.status === 403) {
          throw new Error('You do not have permission to update this lead.');
        }
      }
      
      throw new Error('Failed to update lead. Please try again.');
    }
  }

  // Update lead status
  async updateLeadStatus(id: number, status: string, notes?: string, nextFollowUpAt?: string): Promise<Lead> {
    try {
      const updateData = {
        status,
        lastContactedAt: new Date().toISOString(),
        ...(notes && { notes }),
        ...(nextFollowUpAt && { nextFollowUpAt })
      };
      
      const response = await apiClient.patch<Lead>(`${LeadEndpoints.UPDATE_LEAD_STATUS}/${id}/status`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw new Error('Failed to update lead status. Please try again.');
    }
  }

  // Assign lead to employee
  async assignLead(leadId: number, assignedToId: number): Promise<Lead> {
    try {
      const response = await apiClient.patch<Lead>(
        `${LeadEndpoints.ASSIGN_LEAD}/${leadId}/assign`, 
        { assignedToId }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning lead:', error);
      throw new Error('Failed to assign lead. Please try again.');
    }
  }

  // Delete lead
  async deleteLead(id: number): Promise<void> {
    try {
      await apiClient.delete(`${LeadEndpoints.LEAD_BY_ID}/${id}`);
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw new Error('Failed to delete lead. Please try again.');
    }
  }

  // Get lead statistics
  async getLeadStats(filters?: LeadFilters | number): Promise<LeadStats> {
    try {
      let url: string = LeadEndpoints.LEAD_STATS;
      
      // Handle both legacy employeeId and new filters object
      if (filters) {
        const queryParams = new URLSearchParams();
        
        if (typeof filters === 'number') {
          // Legacy: just employeeId
          queryParams.append('employeeId', filters.toString());
        } else if (typeof filters === 'object') {
          // New: filters object
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value.toString());
            }
          });
        }
        
        if (queryParams.toString()) {
          url = `${LeadEndpoints.LEAD_STATS}?${queryParams.toString()}`;
        }
      }

      console.log('🔍 Fetching lead stats from URL:', url);
      const response = await apiClient.get<LeadStats>(url);
      console.log('📊 API Response:', response);
      console.log('📊 Response.data:', response.data);
      console.log('📊 Response type:', typeof response.data);
      
      // Handle potential nested response structure from backend
      const apiData = response.data;
      
      // Check if backend returned {success: true, data: stats} structure
      if (apiData && typeof apiData === 'object' && 'success' in apiData && 'data' in apiData) {
        console.log('✅ Using new backend response structure for stats');
        const wrappedData = apiData as { success?: boolean; data?: LeadStats };
        return wrappedData.data as LeadStats;
      } else {
        // Direct stats data
        console.log('✅ Using direct stats response structure');
        return apiData as LeadStats;
      }
    } catch (error) {
      console.error('❌ Error fetching lead stats:', error);
      throw new Error('Failed to fetch lead statistics. Please try again.');
    }
  }
}

// Export singleton instance
export const leadService = new LeadService();
export default leadService;