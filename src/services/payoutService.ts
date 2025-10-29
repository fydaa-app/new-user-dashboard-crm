// src/services/payoutService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get token from cookies
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('authToken=')
    );
    return authCookie ? authCookie.split('=')[1] : null;
  }
  return null;
};

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
    const token = getAuthToken();
    if (!token) return null;

    // Build URL with optional employeeId parameter
    let url = `${API_URL}/referrals/partner/earnings`;
    if (employeeId) {
      url += `?employeeId=${employeeId}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) return null;

    const { data } = await res.json();
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
    const token = getAuthToken();
    if (!token) return false;

    const res = await fetch(`${API_URL}/referrals/partner/withdrawal-account-status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) return false;

    const { data } = await res.json();
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
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found'
      };
    }

    const response = await fetch(
      `${API_URL}/referrals/partner/setup-withdrawal-account`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(accountData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to setup withdrawal account'
      };
    }

    return {
      success: true,
      data: data,
      message: 'Withdrawal account setup successfully'
    };
  } catch (error) {
    console.error('Error setting up withdrawal account:', error);
    return {
      success: false,
      error: 'Network error occurred'
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
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found'
      };
    }

    const response = await fetch(
      `${API_URL}/referrals/partner/withdraw-direct`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Withdrawal request failed'
      };
    }

    return {
      success: true,
      data: data,
      message: 'Withdrawal request submitted successfully'
    };
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};

/**
 * Calculate earnings (trigger calculation)
 */
export const calculateEarnings = async (): Promise<ApiResponse<Record<string, unknown>>> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found'
      };
    }

    const response = await fetch(
      `${API_URL}/referrals/partner/earnings/calculate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to calculate earnings'
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error calculating earnings:', error);
    return {
      success: false,
      error: 'Network error occurred'
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
    const token = getAuthToken();
    if (!token) {
      return { 
        payouts: [], 
        pagination: null,
        error: "Authentication token not found" 
      };
    }

    // ========== API CALL ==========
    const endpoint = process.env.NEXT_PUBLIC_ADMIN_PARTNERS_LIST_ENDPOINT || '/referrals/admin/partners';
    const res = await fetch(
      `${API_URL}${endpoint}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    
    if (!res.ok) {
      const errorData = await res.json();
      return { 
        payouts: [], 
        pagination: null,
        error: errorData.message || "Failed to fetch payout list" 
      };
    }

    const response: PartnerPayoutApiResponse = await res.json();
    
    // Transform API response to match our interface
    const transformedPayouts: PartnerPayoutListItem[] = response.data.partners.map(partner => ({
      partnerId: partner.partnerId,
      partnerName: partner.name,
      balanceEarned: partner.earnings.availableAmount,
      balanceWithdrawable: partner.earnings.withdrawableAmount,
      lifetimeEarning: partner.earnings.totalEarnings,
      onboardingDate: partner.onboardingDate,
    }));

    return {
      payouts: transformedPayouts,
      pagination: response.data.pagination,
      error: null
    };
    // ========== END API CALL ==========

  } catch (e) {
    console.error("Error fetching partner payout list:", e);
    return {
      payouts: [],
      pagination: null,
      error: "Network error occurred while fetching payout list"
    };
  }
};