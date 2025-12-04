"use client";

import React from "react";
import Image from "next/image";
import { UserDetails } from "./types";

interface UserProfileCardProps {
  userDetails: UserDetails;
}

export default function UserProfileCard({ userDetails }: UserProfileCardProps) {
  return (
    <div className="col-span-12 xl:col-span-4 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="items-center w-full">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 mb-4">
            <Image width={80} height={80} src="/images/user/user-image.png" alt="user" />
          </div>
          <div className="order-3 xl:order-2 mb-4">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {userDetails.firstName} {userDetails.lastName}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">{userDetails.userRole}</p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userDetails.city}, {userDetails.country}
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Email : {userDetails.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Phone : {userDetails.callingCode} {userDetails.mobileNumber}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">PAN Status : {userDetails.panStatus}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

