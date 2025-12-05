// app/reset-password/page.tsx
import ResetPasswordForm from "@/components/auth/ResetPassword";
import { Metadata } from "next";
import { apiClient } from "@/services/api-client";
import { AuthEndpoints } from "@/config/api-endpoints";

export const metadata: Metadata = {
  title: "Reset Password | Fydaa",
  description: "Reset Password",
};

interface ValidationResult {
  isValid: boolean;
  email?: string | null;
}

async function validateToken(token: string): Promise<ValidationResult> {
 
  try {
    const response = await apiClient.post<ValidationResult>(
      AuthEndpoints.VALIDATE_RESET_TOKEN,
      { token },
      { skipAuth: true }
    );

    if (!response.ok || !response.data) {
      return { isValid: false, email: null };
    }
    

    return response.data;
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false, email: null };
  }
}

export default async function ResetPasswordPage({
  searchParams,
}: { 
  searchParams: Promise<{ token?: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const token = Array.isArray(resolvedSearchParams.token) 
    ? resolvedSearchParams.token[0] 
    : resolvedSearchParams.token;
  let isValidToken = false;
  let email: string | undefined = undefined;

  if (token) {
    const validationResult = await validateToken(token);
    isValidToken = validationResult.isValid;
    email = validationResult.email || undefined;
  }

  return (
    <ResetPasswordForm 
      isValidToken={isValidToken} 
      email={email}
      token={token}
    />
  );
}
