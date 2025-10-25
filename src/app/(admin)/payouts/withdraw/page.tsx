// src/app/(admin)/payouts/withdraw/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { setupWithdrawalAccount, checkWithdrawalAccountStatus, withdrawDirect, fetchPartnerEarnings } from "@/services/payoutService";
import GridShape from "@/components/common/GridShape";

export default function WithdrawPage() {
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccountSetup, setIsAccountSetup] = useState<boolean | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [earnings, setEarnings] = useState<{
    totalEarnings: number;
    availableAmount: number;
    withdrawableAmount: number;
  } | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    // Bank details
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchAddress: "",
    accountType: "savings",
    // UPI details
    upiId: ""
  });

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const router = useRouter();
  const { user, isLoading } = useAuth();

  const canAccess = user?.role === '5';

  useEffect(() => {
    if (!isLoading && !canAccess) {
      router.replace("/");
    }
  }, [isLoading, canAccess, router]);

  // Check if withdrawal account is already setup and fetch earnings
  useEffect(() => {
    const loadData = async () => {
      const [setupStatus, earningsData] = await Promise.all([
        checkWithdrawalAccountStatus(),
        fetchPartnerEarnings()
      ]);
      setIsAccountSetup(setupStatus);
      setEarnings(earningsData);
    };

    if (canAccess) {
      loadData();
    }
  }, [canAccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccountTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      accountType: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      let accountData;

      if (paymentMethod === "bank") {
        // Validate bank details
        if (!formData.accountName || !formData.accountNumber || !formData.ifscCode) {
          setMessage({
            type: 'error',
            text: 'Please fill in all required bank details'
          });
          setIsSubmitting(false);
          return;
        }

        accountData = {
          type: "bank_account" as const,
          details: {
            name: formData.accountName,
            account_number: formData.accountNumber,
            ifsc: formData.ifscCode
          }
        };
      } else {
        // Validate UPI details
        if (!formData.upiId) {
          setMessage({
            type: 'error',
            text: 'Please enter your UPI ID'
          });
          setIsSubmitting(false);
          return;
        }

        accountData = {
          type: "vpa" as const,
          details: {
            address: formData.upiId
          }
        };
      }

      const response = await setupWithdrawalAccount(accountData);

      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message || 'Withdrawal account setup successfully! Redirecting...'
        });
        
        // Clear form
        setFormData({
          accountName: "",
          accountNumber: "",
          ifscCode: "",
          bankName: "",
          branchAddress: "",
          accountType: "savings",
          upiId: ""
        });

        // Redirect back to payouts page after 2 seconds
        setTimeout(() => {
          router.push('/payouts');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Failed to setup withdrawal account'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid amount'
      });
      return;
    }

    if (earnings && amount > earnings.withdrawableAmount) {
      setMessage({
        type: 'error',
        text: 'Insufficient balance'
      });
      return;
    }

    setIsSubmitting(true);
    const response = await withdrawDirect(amount);

    if (response.success) {
      setMessage({
        type: 'success',
        text: 'Withdrawal request submitted successfully! Redirecting...'
      });
      setWithdrawAmount("");
      
      // Redirect back to payouts page after 2 seconds
      setTimeout(() => {
        router.push('/payouts');
      }, 2000);
    } else {
      setMessage({
        type: 'error',
        text: response.error || 'Withdrawal request failed'
      });
    }

    setIsSubmitting(false);
  };

  if (isLoading || isAccountSetup === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!canAccess) {
    return null;
  }
  
  return (
    <div>
      
      <PageBreadcrumb pageTitle="Payouts" />
      <div className="space-y-6">
        
        <ComponentCard title={isAccountSetup ? "Withdraw Balance" : "Setup Withdrawal Account"}>
          <div className="relative flex flex-col items-center justify-start min-h-screen p-6">
            <GridShape />
            {/* Message Display */}
            {message && (
              <div className={`w-full mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Show Withdrawal Form if account is setup, otherwise show Setup Form */}
            {isAccountSetup ? (
              // WITHDRAWAL FORM
              <div className="w-full max-w-md mx-auto">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                  <h3 className="text-lg font-medium mb-2">Balance Withdrawable</h3>
                  <p className="text-3xl font-bold">
                    {earnings?.withdrawableAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" }) || "₹0.00"}
                  </p>
                  <p className="text-sm mt-2 opacity-90">Enter amount below to withdraw</p>
                </div>

                <div className="bg-[#F9FAFB] dark:bg-gray-900 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
                    Request Withdrawal
                  </h3>
                  
                  <form onSubmit={handleWithdrawRequest} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                        Withdrawal Amount *
                      </label>
                      <input 
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => router.push('/payouts')}
                        className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              // ACCOUNT SETUP FORM
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <div></div>

                {/* Bank Details Form */}
                <div className="bg-[#F9FAFB] dark:bg-gray-900 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
                    Setup Withdrawal Account
                  </h3>
                  
                  {/* Payment Method Toggle */}
                  <div className="mb-6 flex gap-4 border-b border-gray-300 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      className={`pb-2 px-4 font-medium transition-colors ${
                        paymentMethod === "bank"
                          ? "border-b-2 border-black dark:border-white text-black dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Bank Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`pb-2 px-4 font-medium transition-colors ${
                        paymentMethod === "upi"
                          ? "border-b-2 border-black dark:border-white text-black dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      UPI ID
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {paymentMethod === "bank" ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                            Account Name *
                          </label>
                          <input 
                            type="text"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                            Account Number *
                          </label>
                          <input 
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                            IFSC Code *
                          </label>
                          <input 
                            type="text"
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                            Bank Name
                          </label>
                          <input 
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                            Branch Address
                          </label>
                          <input 
                            type="text"
                            name="branchAddress"
                            value={formData.branchAddress}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                            Account Type
                          </label>
                          <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="radio"
                                name="accountType"
                                value="savings"
                                checked={formData.accountType === "savings"}
                                onChange={handleAccountTypeChange}
                                className="w-4 h-4"
                              />
                              <span className="ml-2 text-black dark:text-white">Savings</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="radio"
                                name="accountType"
                                value="current"
                                checked={formData.accountType === "current"}
                                onChange={handleAccountTypeChange}
                                className="w-4 h-4"
                              />
                              <span className="ml-2 text-black dark:text-white">Current</span>
                            </label>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                          UPI ID *
                        </label>
                        <input 
                          type="text"
                          name="upiId"
                          value={formData.upiId}
                          onChange={handleInputChange}
                          placeholder="example@upi"
                          required
                          className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                        />
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-black text-white dark:bg-white dark:text-black py-2 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </form>
                </div>

                <div></div>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
