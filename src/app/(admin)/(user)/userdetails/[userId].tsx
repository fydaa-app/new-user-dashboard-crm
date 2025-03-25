"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTab from "@/components/user-detail/UserTab";

interface UserData {
  userDetails: any;
  portfolioDetails: any[];
  userTransactionDetails: any[];
  userSubscriptionDetails: any[];
  stockOrders: any[];
}

export default function UserDetails({ params }: { params: { userId: string }}) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_USER_DETAILS_ENDPOINT}/${params.userId}`,
          {
            headers: {
                Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.userId]);

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>No user data found</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="User" />
      <div className="space-y-6">
        <ComponentCard title="User Details">
          <UserTab 
            userDetails={userData.userDetails}
            portfolioDetails={userData.portfolioDetails}
            transactions={userData.userTransactionDetails}
            subscriptions={userData.userSubscriptionDetails}
            stockOrders={userData.stockOrders}
          />
        </ComponentCard>
      </div>
    </div>
  );
}