// app/reset-password/page.tsx
import ResetPasswordForm from "@/components/auth/ResetPassword";
import { Metadata } from "next";

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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_VALIDATE_RESET_TOKEN_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store' // Important for token validation
    });

    if (!response.ok) {
      return { isValid: false, email: null };
    }
    

    return await response.json();
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
