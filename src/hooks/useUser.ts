import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { UserData, userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

// Use UserData directly
export type User = UserData;

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const AUTH_TOKEN = Cookies.get("authToken");
        if (!AUTH_TOKEN) {
          throw new Error("Authentication token not found");
        }

        if (!authUser?.id) {
          throw new Error("User ID not found");
        }

        // Fetch real user data using the user ID
        const userData = await userService.fetchUser(authUser.id);
        setUser(userData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load user data"
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser?.id]);

  return { user, loading, error };
}