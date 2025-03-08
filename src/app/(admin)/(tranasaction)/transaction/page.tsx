// app/transaction-tables/page.tsx
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TransactionTable, { TransactionTableProps } from "@/components/tables/TransactionTable";
import Pagination from "@/components/tables/Pagination";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  referredBy: string;
  createdAt: string;
}


interface APIResponse {
  success: boolean;
  users: User[];
}

export default async function TransactionTablesPage() {
  let users: User[] = [];
  let error: string | null = null;

  try {
    const res = await fetch("https://crm-prod.fydaa.com/referrals/latest-referred-users", {
      next: { revalidate: 60 },
    });
    const data: APIResponse = await res.json();

    if (!data.success) {
      error = "Failed to load data";
    } else {
      // Ensure that data.users is an array of User
      users = Array.isArray(data.users) ? data.users : [];
    }
  } catch (err: any) {
    console.error("Error fetching data:", err);
    error = "Error fetching data";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Transaction" />
      <div className="space-y-6">
        <ComponentCard title="Transaction List">
          {/* Pass the data down as props */}
          <TransactionTable users={users} error={error} />
          {/* <Pagination currentPage={5} totalPages={10} onPageChange={(page) => console.log(page)} /> */}
        </ComponentCard>
      </div>
    </div>
  );
}
