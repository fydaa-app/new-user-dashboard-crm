"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function WithdrawPage() {
  const [paymentMethod, setPaymentMethod] = useState("bank"); // "bank" or "upi"
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const canAccess = user?.role === '5';

  useEffect(() => {
    if (!isLoading && !canAccess) {
      router.replace("/");
    }
  }, [isLoading, canAccess, router]);

  if (isLoading) {
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
        <ComponentCard title="Withdraw Balance">
          <div className="relative flex flex-col items-center justify-start min-h-screen p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              {/* Personal Details Form */}
              {/* <div className="bg-[#F7F7F7] dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Personal Details</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black dark:text-white">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black dark:text-white">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black dark:text-white">Phone</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black dark:text-white">Current Password</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-black text-white dark:bg-white dark:text-black py-2 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Save
                  </button>
                </form>
              </div> */}

              {/* Bank Details Form */}
            <div className="bg-[#F7F7F7] dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Bank Details</h3>
                
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

                <form className="space-y-4">
                    {paymentMethod === "bank" ? (
                    <>
                        {/* Bank Details Fields */}
                        <div>
                        <label className="block text-sm font-medium mb-2 text-black dark:text-white">Account Name</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2 text-black dark:text-white">Account Number</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2 text-black dark:text-white">IFSC Code</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2 text-black dark:text-white">Bank Name</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2 text-black dark:text-white">Branch Address</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2 text-black dark:text-white">Account Type</label>
                        <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                name="accountType" 
                                value="savings"
                                className="w-4 h-4 text-black dark:text-white"
                            />
                            <span className="ml-2 text-black dark:text-white">Savings</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                name="accountType" 
                                value="current"
                                className="w-4 h-4 text-black dark:text-white"
                            />
                            <span className="ml-2 text-black dark:text-white">Current</span>
                            </label>
                        </div>
                        </div>
                    </>
                    ) : (
                    <>
                        {/* UPI ID Field */}
                        <div>
                        <label className="block text-sm font-medium mb-2 text-black dark:text-white">UPI ID</label>
                        <input 
                            type="text" 
                            placeholder="example@upi"
                            className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                        />
                        </div>
                    </>
                    )}

                    <button 
                    type="submit" 
                    className="w-full bg-black text-white dark:bg-white dark:text-black py-2 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                    Save
                    </button>
                </form>
                </div>

              {/* Change Password Form */}
              {/* <div className="bg-[#F7F7F7] dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Change Password</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black dark:text-white">Current Password</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black dark:text-white">New Password</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black dark:text-white">Confirm Password</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 dark:border-gray-700" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-black text-white dark:bg-white dark:text-black py-2 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Save
                  </button>
                </form>
              </div> */}
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
