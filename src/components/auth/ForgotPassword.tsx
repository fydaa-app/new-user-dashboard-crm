"use client";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { apiClient } from "@/services/api-client";
import { AuthEndpoints } from "@/config/api-endpoints";

// ─── Step 1: Send OTP ────────────────────────────────────────────────────────

const SendOtpStep = ({ onOtpSent }: { onOtpSent: (email: string) => void }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.post<{ message: string }>(
        AuthEndpoints.FORGOT_PASSWORD, // add to your AuthEndpoints
        { email },
        { skipAuth: true }
      );

      if (response.ok && response.data) {
        setMessage({ text: response.data.message, type: "success" });
        setTimeout(() => onOtpSent(email), 1200);
      } else {
        setMessage({ text: response.data?.message || "Something went wrong", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Failed to connect to server", type: "error" });
      console.error("Send OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Head><title>Forgot Password | Fydaa</title></Head>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email and we&apos;ll send you an OTP
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {message && (
              <div className={`mb-4 p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {message.text}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email" name="email" type="email" autoComplete="email" required
                    placeholder="Enter your email"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/signin" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Remember your password? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 2: Verify OTP + Reset Password ─────────────────────────────────────

const ResetWithOtpStep = ({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.post<{ message: string }>(
        AuthEndpoints.RESET_PASSWORD, // add to your AuthEndpoints
        { email, otp, newPassword, confirmPassword },
        { skipAuth: true }
      );

      if (response.ok && response.data) {
        setMessage({ text: response.data.message, type: "success" });
        setTimeout(() => { window.location.href = "/signin"; }, 2000);
      } else {
        setMessage({ text: response.data?.message || "Failed to reset password", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Failed to connect to server", type: "error" });
      console.error("Reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setMessage(null);
    try {
      const response = await apiClient.post<{ message: string }>(
        AuthEndpoints.FORGOT_PASSWORD,
        { email },
        { skipAuth: true }
      );
      setMessage({
        text: response.ok ? "OTP resent successfully. Please check your inbox." : (response.data?.message || "Failed to resend OTP"),
        type: response.ok ? "success" : "error",
      });
    } catch {
      setMessage({ text: "Failed to connect to server", type: "error" });
    } finally {
      setIsResending(false);
    }
  };

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Enter the OTP and your new password</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="mb-4 p-4 rounded-md bg-green-50 text-green-800 text-sm">
              OTP has been sent to <strong>{email}</strong>. Please check your inbox.
            </div>

            {message && (
              <div className={`mb-4 p-4 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {message.text}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* OTP */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                <div className="mt-1">
                  <input
                    id="otp" name="otp" type="text" inputMode="numeric" maxLength={6} required
                    placeholder="Enter 6-digit OTP"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-center tracking-widest text-lg font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">OTP is valid for 10 minutes</p>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1 relative">
                  <input
                    id="newPassword" name="newPassword" type={showNewPassword ? "text" : "password"} required minLength={8}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowNewPassword(v => !v)}>
                    <EyeIcon open={showNewPassword} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Min 8 characters with uppercase, lowercase, and number</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required minLength={8}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPassword(v => !v)}>
                    <EyeIcon open={showConfirmPassword} />
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-4 flex justify-between text-sm">
              <button onClick={handleResendOtp} disabled={isResending} className="text-blue-600 hover:text-blue-800 disabled:opacity-50">
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
              <button onClick={onChangeEmail} className="text-gray-600 hover:text-gray-800">
                Change Email
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link href="/signin" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Remember your password? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────

const EmployeeForgotPasswordPage = () => {
  const [step, setStep] = useState<"send-otp" | "reset-password">("send-otp");
  const [email, setEmail] = useState("");

  return step === "reset-password" ? (
    <ResetWithOtpStep email={email} onChangeEmail={() => { setEmail(""); setStep("send-otp"); }} />
  ) : (
    <SendOtpStep onOtpSent={(e) => { setEmail(e); setStep("reset-password"); }} />
  );
};

export default EmployeeForgotPasswordPage;