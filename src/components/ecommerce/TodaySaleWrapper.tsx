"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import TodaySale from "@/components/ecommerce/TodaySale";
import { useGlobalContext } from "@/context/GlobalState";

interface CardData {
  type: string;
  totalRevenue?: number;
  totalNoOfTransactions?: number;
  noOfPayments?: number;
  activeUsers?: number;
  newUsers?: number;
  totalUsers?: number;
  assetsUnderManagement?:number;
}

interface TodaySalesData {
  totalRevenue: number;
  totalNoOfTransactions: number;
  noOfPayments: number;
  activeUsers: number;
  newUsers: number;
  totalUsers: number;
  assetsUnderManagement:number;
}

const TodaySaleWrapper = () => {
  const [salesData, setSalesData] = useState<TodaySalesData>({
    totalRevenue: 0,
    totalNoOfTransactions: 0,
    noOfPayments: 0,
    activeUsers: 0,
    newUsers: 0,
    totalUsers: 0,
    assetsUnderManagement:0,
  });
  const [loading, setLoading] = useState(true);
  const { selectedOption,customDates,selectedEmployee } = useGlobalContext();

  useEffect(() => {
    const fetchSalesData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        console.error("Auth token not found in cookies");
        setLoading(false);
        return;
      }

      try {

        let url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_CARD_ENDPOINT}?`;
    
        if (selectedOption === 'custom') {
          url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `timeframe=${selectedOption || "monthly"}`;
        }
        if (selectedEmployee) {
          url += `&employeeId=${selectedEmployee}`;
        }

        const response = await fetch(url,
          {
            headers: {
              Authorization: `Bearer ${AUTH_TOKEN}`,
            },
          }
        );

        if (response.status === 401) {
          Cookies.remove('authToken'); 
          window.location.href = "/signin";          
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: CardData[] = await response.json();

        const todaySalesData: TodaySalesData = {
          totalRevenue: data.find((item) => item.type === "Total Revenue")?.totalRevenue || 0,
          totalNoOfTransactions: data.find((item) => item.type === "Total Transactions")?.totalNoOfTransactions || 0,
          noOfPayments: data.find((item) => item.type === "Total Payments")?.noOfPayments || 0,
          newUsers: data.find((item) => item.type === "New Users")?.newUsers || 0,
          activeUsers: data.find((item) => item.type === "Active Users")?.activeUsers || 0,
          totalUsers: data.find((item) => item.type === "Total Users")?.totalUsers || 0,
          assetsUnderManagement: Number(
            (data.find((item) => item.type === "Assets under Management")?.assetsUnderManagement || 0).toFixed(2)
          ),
        };

        setSalesData(todaySalesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [selectedOption,customDates,selectedEmployee]);

  return <TodaySale data={salesData} loading={loading} />;
};

export default TodaySaleWrapper;
