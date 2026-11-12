"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import { useFilteredFetch } from "@/hooks/useFilteredFetch";
import { DashboardEndpoints } from "@/config/api-endpoints";
import DashboardSkeleton from "@/components/common/DashboardSkeleton";
import DashboardLoadError from "@/components/common/DashboardLoadError";

interface Order {
  date: string;
  userName: string;
  planName: string;
  orderValue: number;
  status: string;
  type: string;
}

interface OrdersResponse {
  transactions: Order[];
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { selectedOption, customDates, selectedEmployee, selectedTeamMember, selectedType, hierarchyViewMode, userAppTypeLock } = useGlobalContext();
  const effectiveType = userAppTypeLock || selectedType || "team";

  const { data: apiData, loading, error, refetch } = useFilteredFetch<OrdersResponse>(
    async (signal) => {
      const AUTH_TOKEN = Cookies.get("authToken");
      if (!AUTH_TOKEN) {
        throw new Error("Auth token not found");
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}${DashboardEndpoints.RECENT_ORDERS}?`;

      if (selectedOption === 'custom') {
        url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
      } else {
        url += `timeframe=${selectedOption || "monthly"}`;
      }

      const employeeId = selectedTeamMember || selectedEmployee;
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      if (selectedType && selectedType.length > 0) {
        url += `&type=${selectedTeamMember ? hierarchyViewMode : effectiveType}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        signal,
      });

      if (response.status === 401) {
        Cookies.remove('authToken');
        window.location.href = "/signin";
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: OrdersResponse = await response.json();
      return data;
    },
    [
      selectedOption,
      customDates,
      selectedEmployee,
      selectedTeamMember,
      selectedType,
      hierarchyViewMode,
      userAppTypeLock,
    ]
  );

  useEffect(() => {
    if (loading || !apiData) {
      setOrders([]);
      return;
    }
    setOrders(apiData.transactions || []);
  }, [apiData, loading]);

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

  if (loading) {
    return <DashboardSkeleton variant="table" count={5} />;
  }

  if (error) {
    return (
      <DashboardLoadError
        message={error.message || "Failed to load recent orders"}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] h-full max-h-96">
      <div className="flex flex-col gap-2 px-4 pt-4 sm:px-6 sm:pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-3 sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y sticky top-0 bg-white dark:bg-white/[0.03] z-10">
              <TableRow>
                <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Date
                </TableCell>
                <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  User Name
                </TableCell>
                <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Plan Name
                </TableCell>
                <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Type
                </TableCell>
                <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Order Value
                </TableCell>                
                <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
               {orders.length > 0 ? (
                 orders.map((order: Order, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="py-3">{order.date}</TableCell>
                    <TableCell className="py-3">{order.userName}</TableCell>
                    <TableCell className="py-3">{order.planName}</TableCell>
                    <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={order.type === "BUY" ? "success" : "error"}
                    >
                      {order.type}
                    </Badge>
                    </TableCell>
                    <TableCell className="py-3">{formatCurrency(order.orderValue)}</TableCell>                    
                    <TableCell className="py-3">
                      <Badge
                        size="sm"
                        color={
                          order.status === "COMPLETED"
                            ? "success"
                            : order.status === "PENDING"
                            ? "warning"
                            : "error"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <td colSpan={6} className="text-center py-3">
                    No orders found
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
