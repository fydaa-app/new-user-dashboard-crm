"use client";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function Profile() {
  const { user: authUser } = useAuth();
  const { user, loading, error } = useUser();

  if (!authUser) {
    return (
      <div>
        <PageBreadCrumb pageTitle="Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Please log in to view your profile</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PageBreadCrumb pageTitle="Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading profile data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadCrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard user={user} error={error} />
          <UserInfoCard user={user} error={error} />
          <UserAddressCard user={user} error={error} />
        </div>
      </div>
    </div>
  );
}
