"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTab from "@/components/user-detail/UserTab";
import Cookies from 'js-cookie';
type Usable<T> = Promise<T> | { then(onFulfilled: (value: T) => any): any };
interface UserData {
  userDetails: any;
  portfolioDetails: any[];
  userTransactionDetails: any[];
  userSubscriptionDetails: any[];
  stockOrders: any[];
}

interface PageProps {
  params: Usable<{ userId: string }>; 
}

export default function UserDetails({ params }: PageProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = React.use(params as Promise<{ userId: string }>);
  const { userId } = resolvedParams;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_USER_DETAILS_ENDPOINT}/${userId}`,
          {
            headers: {
                Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
            }
          }
        );
        if (response.status === 401) {
          Cookies.remove('authToken'); 
          window.location.href = "/signin";          
        }
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
  }, [userId]);

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