// src/app/(full-width-pages)/(auth)/resetpassword/page.tsx

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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_VALIDATE_RESET_TOKEN_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { isValid: false, email: null };
    }

    return await response.json();
  } catch (error) {
    console.error("Token validation error:", error);
    return { isValid: false, email: null };
  }
}

// ✅ Inline typing instead of using a custom PageProps
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = Array.isArray(searchParams.token)
    ? searchParams.token[0]
    : searchParams.token;

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
