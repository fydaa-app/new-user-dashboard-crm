import { getCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UserData {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  bio?: string;
  // Add other user properties as needed
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const token = getCookie("authToken") as string | undefined;

    if (!token) {
      console.warn("No auth token found in cookies");
      return null;
    }

    console.log("Auth token found:", token.substring(0, 20) + "...");
    return token;
  }
  return null;
};

const getHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Generate fallback user data when backend is unavailable
const generateFallbackUser = (userId: number): UserData => {
  return {
    id: userId,
    name: "John Doe",
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@fydaa.com",
    mobile: "+91 98765 43210",
    role: "Sales Manager",
    bio: "Experienced Sales Professional"
  };
};

export const userService = {
  async fetchUser(userId: number): Promise<UserData> {
    try {
      if (!API_URL) {
        console.warn("API_URL not configured, using fallback user data");
        return generateFallbackUser(userId);
      }

      const url = `${API_URL}/employees/${userId}`;
      const headers = getHeaders();

      console.log("Attempting to fetch user from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers,
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`HTTP Error ${response.status}, using fallback data:`, errorData);
        return generateFallbackUser(userId);
      }

      const result: ApiResponse<UserData> = await response.json();
      
      if (!result.data) {
        console.warn("API returned no user data, using fallback data");
        return generateFallbackUser(userId);
      }

      console.log('✅ Successfully fetched real user data');
      return result.data;
      
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        console.warn("API request timed out, using fallback user data");
      } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn("Network error (backend might be offline), using fallback user data");
      } else {
        console.warn("Error fetching user data, using fallback data:", error);
      }
      
      // Always return fallback data instead of throwing
      return generateFallbackUser(userId);
    }
  },
};