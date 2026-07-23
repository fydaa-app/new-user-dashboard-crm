/**
 * Centralized API Client Service
 * 
 * This service provides a centralized HTTP client with:
 * - Automatic authentication token injection
 * - Global error handling (401 redirects)
 * - Support for multiple base URLs (CRM, Stock, Onboarding)
 * - Type-safe request/response handling
 */

import Cookies from 'js-cookie';

// Base URL types for different microservices
export type ApiBaseUrl = 'crm' | 'stock' | 'onboarding';

// Request configuration
export interface ApiRequestConfig extends RequestInit {
  baseUrl?: ApiBaseUrl;
  requireAuth?: boolean;
  skipAuth?: boolean; // For special cases like login
}

// Response wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  ok: boolean;
}

// Error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private readonly baseUrls: Record<ApiBaseUrl, string> = {
    crm: process.env.NEXT_PUBLIC_API_URL || '',
    stock: process.env.NEXT_PUBLIC_STOCK_API_URL || '',
    onboarding: process.env.NEXT_PUBLIC_ONBOARDING_API_URL || '',
  };

  private readonly authCookieName: string = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'authToken';

  /**
   * Get authentication token from cookies
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try cookies-next first (server-side compatible)
    try {
      const cookieValue = Cookies.get(this.authCookieName);
      if (cookieValue) return cookieValue;
    } catch {
      // Fallback to document.cookie for client-side
    }

    // Fallback to document.cookie parsing
    const cookies = document.cookie.split('; ');
    const authCookie = cookies.find(cookie => cookie.startsWith(`${this.authCookieName}=`));
    return authCookie ? authCookie.split('=')[1] : null;
  }

  /**
   * Handle 401 unauthorized responses globally
   */
  private handleUnauthorized(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove(this.authCookieName);
      Cookies.remove('employeeData');
      // Redirect to signin page
      window.location.href = '/signin';
    }
  }

  /**
   * Build full URL from base URL and endpoint
   */
  private buildUrl(endpoint: string, baseUrl?: ApiBaseUrl): string {
    const base = baseUrl ? this.baseUrls[baseUrl] : this.baseUrls.crm;
    
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Ensure base URL doesn't end with /
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    
    return `${normalizedBase}${normalizedEndpoint}`;
  }

  /**
   * Prepare headers with authentication token
   */
  private prepareHeaders(config: ApiRequestConfig): HeadersInit {
    // If body is FormData, don't set Content-Type (let browser set it with boundary)
    const isFormData = config.body instanceof FormData;
    
    const headers: HeadersInit = !isFormData 
      ? {
          'Content-Type': 'application/json',
          ...config.headers,
        }
      : {
          ...config.headers,
        };

    // Add auth token if required and not skipped
    if (config.requireAuth !== false && !config.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        // Fix the type issue by casting headers to Record<string, string>
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Core fetch wrapper with interceptors
   */
  private async fetch<T = unknown>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      baseUrl = 'crm',
      requireAuth = true,
      skipAuth = false,
      headers,
      ...fetchConfig
    } = config;

    const url = this.buildUrl(endpoint, baseUrl);
    const preparedHeaders = this.prepareHeaders({ requireAuth, skipAuth, headers, body: fetchConfig.body });

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers: preparedHeaders,
      });

      // Parse response body
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      // Handle 401 globally
      if (response.status === 401 && requireAuth && !skipAuth) {
        this.handleUnauthorized();
        throw new ApiError('Unauthorized', 401);
      }

      // Throw error for non-ok responses
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        // Try to extract a meaningful error message
        // Only try object operations if data is actually an object
        if (data && typeof data === 'object' && !(data instanceof String)) {
          const errorData = data as Record<string, unknown>;
          
          // Check if message is a string and not [object Object]
          if (errorData.message && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          }
          // Check if error field exists and is a string
          else if (errorData.error && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          }
          // Check nested error message
          else if (errorData.error && typeof errorData.error === 'object' && errorData.error !== null) {
            const nestedError = errorData.error as Record<string, unknown>;
            if (nestedError.message && typeof nestedError.message === 'string') {
              errorMessage = nestedError.message;
            }
          }
        } else if (typeof data === 'string' && data.length > 0) {
          // If it's a string response, use first 200 chars as error message
          errorMessage = data.substring(0, 200);
        }
        
        throw new ApiError(errorMessage, response.status, data);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
        error
      );
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default for convenience
export default apiClient;

