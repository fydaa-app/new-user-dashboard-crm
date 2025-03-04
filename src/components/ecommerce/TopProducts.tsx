"use client";
import Image from "next/image";

import CountryMap from "./CountryMap";
import { useState } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function TopProducts() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Top Products
          </h3>          
        </div>
      </div>
      
      <div className="space-y-5">

      <div className="flex items-center justify-between top-product-rows">
          <div className="flex items-center top-product-col-6">
            <div className="items-center w-full rounded-full max-w-8">
              <p>#</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-theme-sm dark:text-white/90">
                Name
              </p>              
            </div>
          </div>

          <div className="flex w-full max-w-[140px] items-center  top-product-col-6">
            <div className="w-full text-gray-500 ">
            Popularity
            
            </div>
            <p className="font-medium text-gray-500 text-theme-sm dark:text-white/90 w-20">
            Sales
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between top-product-rows">
          <div className="flex items-center top-product-col-6">
            <div className="items-center w-full rounded-full max-w-8">
              <p>1</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-theme-sm dark:text-white/90">
              Home Decor Range
              </p>              
            </div>
          </div>

          <div className="flex w-full max-w-[140px] items-center  top-product-col-6">
            <div className="relative block h-1 w-full  rounded-sm bg-gray-200 dark:bg-gray-800">
              <div className="absolute left-0 top-0 flex h-full w-[45%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
            </div>
            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 count-products">
              45%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between top-product-rows">
          <div className="flex items-center top-product-col-6">
            <div className="items-center w-full rounded-full max-w-8">
              <p>2</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-theme-sm dark:text-white/90">
              Disney Princess Pink Bag 18'
              </p>              
            </div>
          </div>

          <div className="flex w-full max-w-[140px] items-center  top-product-col-6">
            <div className="relative block h-1 w-full  rounded-sm bg-gray-200 dark:bg-gray-800">
              <div className="absolute left-0 top-0 flex h-full w-[29%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
            </div>
            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 count-products">
              29%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between top-product-rows">
          <div className="flex items-center top-product-col-6">
            <div className="items-center w-full rounded-full max-w-8">
              <p>3</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-theme-sm dark:text-white/90">
              Bathroom Essentials
              </p>              
            </div>
          </div>

          <div className="flex w-full max-w-[140px] items-center  top-product-col-6">
            <div className="relative block h-1 w-full  rounded-sm bg-gray-200 dark:bg-gray-800">
              <div className="absolute left-0 top-0 flex h-full w-[18%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
            </div>
            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 count-products">
              18%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between top-product-rows">
          <div className="flex items-center top-product-col-6">
            <div className="items-center w-full rounded-full max-w-8">
              <p>4</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-theme-sm dark:text-white/90">
              Apple Smartwatches
              </p>              
            </div>
          </div>

          <div className="flex w-full max-w-[140px] items-center  top-product-col-6">
            <div className="relative block h-1 w-full  rounded-sm bg-gray-200 dark:bg-gray-800">
              <div className="absolute left-0 top-0 flex h-full w-[25%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
            </div>
            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 count-products">
              25%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
