"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import TodaySale from "@/components/ecommerce/TodaySale";

const API_URL = "https://crm-prod.fydaa.com/referrals/cards-Data";

interface CardData {
    type: string;
    totalRevenue?: number;
    totalTransactionsAmount?: number;
    noOfPayments?: number;
    countOfUsers?: number;
  }

interface TodaySalesData {
totalRevenue: number;
totalTransactionsAmount: number;
noOfPayments: number;
countOfUsers: number;
}
  

const TodaySaleWrapper = () => {

let todaySalesData: TodaySalesData = {
    totalRevenue: 0,
    totalTransactionsAmount: 0,
    noOfPayments: 0,
    countOfUsers: 0,
    };

  const [salesData, setSalesData] = useState<TodaySalesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJhZG1pbkBmeWRhYS5pbiIsInJvbGUiOiIwIiwiaWF0IjoxNzQxNzY4Mjc1LCJleHAiOjE3NDE3NzE4NzV9.pS0H5t7lFHbka06o6J7si0yVXRNGP26bQti7N5PZxI8";

      if (!AUTH_TOKEN) {
        console.error("Auth token not found in cookies");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
       const data: CardData[] = await response.json();
       
        // Map API response to required format
        todaySalesData  = {
          totalRevenue: data.find((item) => item.type === "Total Revenue")?.totalRevenue || 0,
          totalTransactionsAmount: data.find((item) => item.type === "Total Transactions")?.totalTransactionsAmount || 0,
          noOfPayments: data.find((item) => item.type === "Total Payments")?.noOfPayments || 0,
          countOfUsers: data.find((item) => item.type === "New Users")?.countOfUsers || 0,
        };

        setSalesData(todaySalesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  return <TodaySale data={salesData} loading={loading} />;
};

export default TodaySaleWrapper;
