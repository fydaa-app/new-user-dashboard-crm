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
  totalinvestedsip?: number;
  totalcancelledsip?: number;
}


interface SipData {
  totalActiveSips: number;
  totalInActiveSips: number;
  totalCompletedSips: number;
  totalInProgressSips: number;
  totalPartiallyExitedSips: number;
  totalInvestedSips: number;
  totalCancelledSips: number;
}


const SipWrapper = () => {
  const [sipData, setSipData] = useState<SipData>({
    totalActiveSips: 0,
    totalInActiveSips: 0,
    totalCompletedSips: 0,
    totalInProgressSips: 0,
    totalPartiallyExitedSips: 0,
    totalInvestedSips: 0,
    totalCancelledSips: 0,
  });
  const [loading, setLoading] = useState(true);
  const { selectedOption, customDates, selectedEmployee } = useGlobalContext();


  useEffect(() => {
    const fetchSipData = async () => {
      // Retrieve authentication token from cookies
      const AUTH_TOKEN = Cookies.get("authToken");

      // Handle missing authentication token
      if (!AUTH_TOKEN) {
        setLoading(false);
        return;
      }

      try {
        // Build API URL based on selected timeframe and filters
        let url = `${process.env.NEXT_PUBLIC_API_URL}/referrals/sip-cards-data-mf?`;
    
        if (selectedOption === 'custom') {
          url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `timeframe=${selectedOption || "monthly"}`;
        }
        if (selectedEmployee) {
          url += `&employeeId=${selectedEmployee}`;
        }

        // Fetch SIP data from API
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });

        // Handle unauthorized access
        if (response.status === 401) {
          Cookies.remove('authToken'); 
          window.location.href = "/signin";          
        }

        // Handle HTTP errors
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse and transform API response data
        const data: CardData[] = await response.json();

        // Map API response to SipData structure
        const sipSummaryData: SipData = {
          totalActiveSips: data.find((item) => item.type === "Total Active Sips")?.totalactivesip || 0,
          totalInActiveSips: data.find((item) => item.type === "Total In Active Sips")?.totalinactivesip || 0,
          totalCompletedSips: data.find((item) => item.type === "Total Completed Sips")?.totalcompletedsip || 0,
          totalInProgressSips: data.find((item) => item.type === "Total In Progress Sips")?.totalinprogresssip || 0,
          totalPartiallyExitedSips: data.find((item) => item.type === "Partially Exited Sips")?.totalpartiallyexitsip || 0,
          totalInvestedSips: data.find((item) => item.type === "Total Invested Sips")?.totalinvestedsip || 0,
          totalCancelledSips: data.find((item) => item.type === "Cancelled Sips")?.totalcancelledsip || 0,
        };

        // Update state with parsed SIP data
        setSipData(sipSummaryData);
      } catch {
        // Handle fetch errors silently for production
      } finally {
        // Mark loading as complete
        setLoading(false);
      }
    };

    fetchSipData();
  }, [selectedOption, customDates, selectedEmployee]);


  return <Sip data={sipData} loading={loading} />;
};


export default SipWrapper;
