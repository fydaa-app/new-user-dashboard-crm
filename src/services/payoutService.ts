// src/services/payoutService.ts

import { apiClient } from './api-client';
import { PayoutEndpoints, AdminEndpoints } from '../config/api-endpoints';

// Interface for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Bank account details interface
interface BankAccountDetails {
  name: string;
  ifsc: string;
  account_number: string;
}

// UPI details interface
interface UpiDetails {
  address: string;
}

// Withdrawal account setup interface
interface WithdrawalAccountSetup {
  type: 'bank_account' | 'vpa';
  details: BankAccountDetails | UpiDetails;
}

interface PartnerPayoutApiResponse {
  success: boolean;
  data: {
    partners: {
      partnerId: number;
      name: string;
      email: string;
      mobileNumber: string;
      role: string;
      onboardingDate: string;
      earnings: {
        totalEarnings: number;
        availableAmount: number;
        withdrawableAmount: number;
        withdrawnAmount: number;
      };
      stats: {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
      };
      withdrawalSetup: {
        isSetup: boolean;
        accountType: string | null;
      };
    }[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    summary: {
      totalPartners: number;
      totalActivePartners: number;
      totalInactivePartners: number;
    };
  };
}

interface PartnerPayoutListItem {
  partnerId: number;
  partnerName: string;
  balanceEarned: number;
  balanceWithdrawable: number;
  lifetimeEarning: number;
  onboardingDate: string;
}
/**
 * Fetch partner earnings data
 * @param employeeId - Optional employee ID to fetch specific partner's earnings (admin view)
 */
export const fetchPartnerEarnings = async (employeeId?: string): Promise<{
  totalEarnings: number;
  availableAmount: number;
  withdrawableAmount: number;
} | null> => {
  try {
    let endpoint = PayoutEndpoints.PARTNER_EARNINGS;
    if (employeeId) {
      endpoint += `?employeeId=${employeeId}`;
    }

    const response = await apiClient.get<{ data: {
      totalEarnings: number;
      availableAmount: number;
      withdrawableAmount: number;
    } }>(endpoint);
    
    if (!response.ok) return null;

    const { data } = response.data;
    return {
      totalEarnings: data?.totalEarnings ?? 0,
      availableAmount: data?.availableAmount ?? 0,
      withdrawableAmount: data?.withdrawableAmount ?? 0,
    };
  } catch (e) {
    console.error('Error fetching partner earnings:', e);
    return null;
  }
};

/**
 * Check withdrawal account setup status
 */
export const checkWithdrawalAccountStatus = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<{ data: { isSetup: boolean } }>(
      PayoutEndpoints.WITHDRAWAL_ACCOUNT_STATUS
    );
    
    if (!response.ok) return false;

    const { data } = response.data;
    return !!data?.isSetup;
  } catch (e) {
    console.error('Error checking withdrawal account status:', e);
    return false;
  }
};

/**
 * Setup withdrawal account (Bank or UPI)
 */
export const setupWithdrawalAccount = async (
  accountData: WithdrawalAccountSetup
): Promise<ApiResponse<Record<string, unknown>>> => {
  try {
    const response = await apiClient.post<{
      message?: string;
      data?: Record<string, unknown>;
    }>(PayoutEndpoints.SETUP_WITHDRAWAL_ACCOUNT, accountData);

    if (!response.ok) {
      return {
        success: false,
        error: response.data.message || 'Failed to setup withdrawal account'
      };
    }

    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Withdrawal account setup successfully'
    };
  } catch (error) {
    console.error('Error setting up withdrawal account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
};

/**
 * Request withdrawal
 */
export const withdrawDirect = async (
  amount: number
): Promise<ApiResponse<Record<string, unknown>>> => {
  try {
    const response = await apiClient.post<{
      message?: string;
      data?: Record<string, unknown>;
    }>(PayoutEndpoints.WITHDRAW_DIRECT, { amount });

    if (!response.ok) {
      return {
        success: false,
        error: response.data.message || 'Withdrawal request failed'
      };
    }

    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Withdrawal request submitted successfully'
    };
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
};

/**
 * Calculate earnings (trigger calculation)
 */
export const calculateEarnings = async (): Promise<ApiResponse<Record<string, unknown>>> => {
  try {
    const response = await apiClient.post<{
      message?: string;
      data?: Record<string, unknown>;
    }>(PayoutEndpoints.CALCULATE_EARNINGS);

    if (!response.ok) {
      return {
        success: false,
        error: response.data.message || 'Failed to calculate earnings'
      };
    }

    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Error calculating earnings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
};


export const fetchPartnerPayoutList = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  payouts: PartnerPayoutListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  error: string | null;
}> => {
  try {
    const endpoint = `${AdminEndpoints.ADMIN_PARTNERS_LIST}?page=${page}&limit=${limit}`;
    const response = await apiClient.get<PartnerPayoutApiResponse>(endpoint);
    
    if (!response.ok) {
      return { 
        payouts: [], 
        pagination: null,
        error: (response.data as { message?: string }).message || "Failed to fetch payout list" 
      };
    }

    // Transform API response to match our interface
    const transformedPayouts: PartnerPayoutListItem[] = response.data.data.partners.map(partner => ({
      partnerId: partner.partnerId,
      partnerName: partner.name,
      balanceEarned: partner.earnings.availableAmount,
      balanceWithdrawable: partner.earnings.withdrawableAmount,
      lifetimeEarning: partner.earnings.totalEarnings,
      onboardingDate: partner.onboardingDate,
    }));

    return {
      payouts: transformedPayouts,
      pagination: response.data.data.pagination,
      error: null
    };
  } catch (e) {
    console.error("Error fetching partner payout list:", e);
    return {
      payouts: [],
      pagination: null,
      error: "Network error occurred while fetching payout list"
    };
  }
};