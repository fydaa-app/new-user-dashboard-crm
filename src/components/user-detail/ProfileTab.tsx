"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import { formatCurrency } from "./utils";
import { UserDetails } from "./types";

interface ProfileTabProps {
  userDetails: UserDetails;
}

export default function ProfileTab({ userDetails }: ProfileTabProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-900 dark:text-gray-400">Date of Birth</p>
          <p className="text-theme-sm text-gray-500">{new Date(userDetails.dob).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-900 dark:text-gray-400">Address</p>
          <p className="text-theme-sm text-gray-500">{userDetails.address?.addressLine1}</p>
          <p className="text-theme-sm text-gray-500">{userDetails.pincode}</p>
        </div>
        <div>
          <p className="text-sm text-gray-900 dark:text-gray-400">KYC Status</p>
          <Badge
            color={
              userDetails.panStatus === "KYC_SUCCESS" || userDetails.panStatus === "KYCSUCCESS"
                ? "success"
                : "error"
            }
          >
            {userDetails.panStatus}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-900 dark:text-gray-400">Total Investment</p>
          <p className="text-theme-sm text-gray-500">{formatCurrency(userDetails.total_investment)}</p>
        </div>
      </div>
    </div>
  );
}

