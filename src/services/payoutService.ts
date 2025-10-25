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

/**
 * Fetch partner earnings data
 */
export const fetchPartnerEarnings = async (): Promise<{
  totalEarnings: number;
  availableAmount: number;
  withdrawableAmount: number;
} | null> => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const res = await fetch(`${API_URL}/referrals/partner/earnings`, {
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
): Promise<ApiResponse<any>> => {
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
): Promise<ApiResponse<any>> => {
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
export const calculateEarnings = async (): Promise<ApiResponse<any>> => {
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
