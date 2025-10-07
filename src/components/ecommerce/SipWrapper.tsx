"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Sip from "@/components/ecommerce/Sip";
import { useGlobalContext } from "@/context/GlobalState";

interface CardData {
  type: string;
  totalactivesip?: number;
  totalinactivesip?: number;
  totalcompletedsip?: number;
  totalinprogresssip?: number;
  totalpartiallyexitsip?: number;
}

interface SipData {
  totalActiveSips: number;
  totalInActiveSips: number;
  totalCompletedSips: number;
  totalInProgressSips: number;
  totalPartiallyExitedSips: number;
}

const SipWrapper = () => {
  const [sipData, setSipData] = useState<SipData>({
    totalActiveSips: 0,
    totalInActiveSips: 0,
    totalCompletedSips: 0,
    totalInProgressSips: 0,
    totalPartiallyExitedSips: 0,
  });
  const [loading, setLoading] = useState(true);
  const { selectedOption, customDates, selectedEmployee } = useGlobalContext();

  useEffect(() => {
    const fetchSipData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");

      if (!AUTH_TOKEN) {
        console.error("Auth token not found in cookies");
        setLoading(false);
        return;
      }

      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/sip-cards-data-mf?`;
    
        if (selectedOption === 'custom') {
          url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `timeframe=${selectedOption || "monthly"}`;
        }
        if (selectedEmployee) {
          url += `&employeeId=${selectedEmployee}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });

        if (response.status === 401) {
          Cookies.remove('authToken'); 
          window.location.href = "/signin";          
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: CardData[] = await response.json();

        const sipSummaryData: SipData = {
          totalActiveSips: data.find((item) => item.type === "Total Active Sips")?.totalactivesip || 0,
          totalInActiveSips: data.find((item) => item.type === "Total In Active Sips")?.totalinactivesip || 0,
          totalCompletedSips: data.find((item) => item.type === "Total Completed Sips")?.totalcompletedsip || 0,
          totalInProgressSips: data.find((item) => item.type === "Total In Progress Sips")?.totalinprogresssip || 0,
          totalPartiallyExitedSips: data.find((item) => item.type === "Partially Exited Sips")?.totalpartiallyexitsip || 0,
        };

        setSipData(sipSummaryData);
      } catch (error) {
        console.error("Error fetching SIP data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSipData();
  }, [selectedOption, customDates, selectedEmployee]);

  return <Sip data={sipData} loading={loading} />;
};

export default SipWrapper;