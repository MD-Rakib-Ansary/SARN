"use client";

import { useEffect, useMemo, useState } from "react";

import { getApiBaseUrl } from "@/lib/api";

type OrderItem = {
  id: number;
  product: number | null;
  product_name: string;
  price: string;
  quantity: number;
  subtotal: string;
};

type Order = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  payment_method: string;
  total_amount: string;
  status: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const [downloadingReport, setDownloadingReport] = useState(false);
  const [downloadingDateReport, setDownloadingDateReport] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setErrorMessage("");

      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setErrorMessage("You must login as an admin to view orders.");
        setOrders([]);
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}/orders/admin/all/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      if (response.status === 403) {
        throw new Error("Permission denied. Please login using an admin account.");
      }

      if (!response.ok) {
        throw new Error("Failed to load orders from backend.");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setErrorMessage("You must login as an admin before updating order status.");
      return;
    }

    const shouldConfirm =
      newStatus === "cancelled"
        ? window.confirm("Are you sure you want to cancel this order?")
        : true;

    if (!shouldConfirm) return;

    try {
      setUpdatingOrderId(orderId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `${getApiBaseUrl()}/orders/admin/${orderId}/status/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      if (response.status === 403) {
        throw new Error("Permission denied. Please login using an admin account.");
      }

      if (!response.ok) {
        throw new Error(result?.status?.[0] || "Failed to update order status.");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: result.status,
                updated_at: result.updated_at,
              }
            : order
        )
      );

      setSuccessMessage(
        `Order #${orderId} status updated to ${formatStatus(newStatus)}.`
      );
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDownloadMonthlyReport = async () => {
    try {
      setDownloadingReport(true);
      setErrorMessage("");
      setSuccessMessage("");

      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setErrorMessage("You must login as an admin to download the report.");
        return;
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const response = await fetch(
        `${getApiBaseUrl()}/orders/admin/monthly-report/?year=${year}&month=${month}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      if (response.status === 403) {
        throw new Error("Permission denied. Please login using an admin account.");
      }

      if (!response.ok) {
        throw new Error("Failed to download monthly sales report.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `SARN_Monthly_Sales_Report_${year}_${String(month).padStart(
        2,
        "0"
      )}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setSuccessMessage("Monthly sales report downloaded successfully.");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to download monthly sales report.");
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleDownloadDateWiseReport = async () => {
    try {
      setDownloadingDateReport(true);
      setErrorMessage("");
      setSuccessMessage("");

      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setErrorMessage("You must login as an admin to download the report.");
        return;
      }

      if (!startDate || !endDate) {
        setErrorMessage("Please select both start date and end date.");
        return;
      }

      if (startDate > endDate) {
        setErrorMessage("Start date cannot be after end date.");
        return;
      }

      const response = await fetch(
        `${getApiBaseUrl()}/orders/admin/date-wise-report/?start_date=${startDate}&end_date=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      if (response.status === 403) {
        throw new Error("Permission denied. Please login using an admin account.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to download date-wise sales report."
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `SARN_Date_Wise_Sales_Report_${startDate}_to_${endDate}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setSuccessMessage("Date-wise sales report downloaded successfully.");
    } catch (error: any) {
      setErrorMessage(
        error.message || "Failed to download date-wise sales report."
      );
    } finally {
      setDownloadingDateReport(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const totalRevenue = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );
  }, [orders]);

  const pendingCount = orders.filter((order) => order.status === "pending").length;

  const processingCount = orders.filter(
    (order) => order.status === "processing"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  const formatDate = (dateValue: string) => {
    if (!dateValue) return "N/A";

    return new Date(dateValue).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatStatus = (status: string) => {
    return status.replaceAll("_", " ");
  };

  const getStatusClass = (status: string) => {
    if (status === "pending") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    if (status === "processing") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    if (status === "shipped") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    if (status === "delivered") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "cancelled") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const renderOrderActions = (order: Order) => {
    const isUpdating = updatingOrderId === order.id;

    if (order.status === "delivered") {
      return (
        <p className="text-xs font-semibold text-green-700">
          Order completed
        </p>
      );
    }

    if (order.status === "cancelled") {
      return (
        <p className="text-xs font-semibold text-red-700">
          Order cancelled
        </p>
      );
    }

    if (order.status === "pending") {
      return (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleStatusChange(order.id, "processing")}
            className="rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Approve"}
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleStatusChange(order.id, "cancelled")}
            className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      );
    }

    if (order.status === "processing" || order.status === "shipped") {
      return (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleStatusChange(order.id, "delivered")}
            className="rounded-xl bg-[#2C302E] px-3 py-2 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Mark Delivered"}
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleStatusChange(order.id, "cancelled")}
            className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2C302E]">Orders</h1>
          <p className="text-[#2C302E]/70 mt-1">
            Approve, cancel, and mark customer orders as delivered.
          </p>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <button
            type="button"
            onClick={handleDownloadMonthlyReport}
            disabled={downloadingReport}
            className="rounded-xl bg-[#2C302E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8DA399] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloadingReport
              ? "Downloading Report..."
              : "Download Monthly Sales Report"}
          </button>

          <div className="rounded-2xl border border-[#EFEBE4] bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-bold text-[#2C302E]">
              Date-wise Sales Report
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#2C302E]/60">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl border border-[#EFEBE4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DA399]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#2C302E]/60">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl border border-[#EFEBE4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DA399]"
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadDateWiseReport}
                disabled={downloadingDateReport}
                className="rounded-xl bg-[#8DA399] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2C302E] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloadingDateReport ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#2C302E]/70">Total Orders</p>
          <p className="text-3xl font-bold text-[#2C302E] mt-2">
            {orders.length}
          </p>
        </div>

        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#2C302E]/70">Pending</p>
          <p className="text-3xl font-bold text-yellow-700 mt-2">
            {pendingCount}
          </p>
        </div>

        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#2C302E]/70">Approved</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">
            {processingCount}
          </p>
        </div>

        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#2C302E]/70">Delivered</p>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {deliveredCount}
          </p>
        </div>

        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#2C302E]/70">Cancelled</p>
          <p className="text-3xl font-bold text-red-700 mt-2">
            {cancelledCount}
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#EFEBE4] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {["all", ...ORDER_STATUSES].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl capitalize text-sm font-medium transition ${
                filter === status
                  ? "bg-[#2C302E] text-white"
                  : "bg-[#EFEBE4]/60 text-[#2C302E] hover:bg-[#EFEBE4]"
              }`}
            >
              {formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap gap-4 text-sm text-[#2C302E]/75">
          <div>
            <span className="font-bold text-[#2C302E]">Workflow:</span>{" "}
            Pending → Approve → Delivered
          </div>

          <div>
            <span className="font-bold text-[#2C302E]">Revenue:</span>{" "}
            ৳ {totalRevenue.toFixed(0)}
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-8 text-center text-[#2C302E]/70">
          Loading orders...
        </div>
      )}

      {!loading && filteredOrders.length === 0 && (
        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-8 text-center text-[#2C302E]/70">
          No orders found.
        </div>
      )}

      {!loading && filteredOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#EFEBE4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-[#EFEBE4]/60">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Order
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Contact
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Items
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Total
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Admin Action
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EFEBE4]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#EFEBE4]/20">
                    <td className="px-5 py-4 align-top">
                      <p className="font-bold text-[#2C302E]">#{order.id}</p>
                      <p className="text-xs text-[#2C302E]/60">
                        User: {order.username || "Guest"}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <p className="font-semibold text-[#2C302E]">
                        {order.full_name}
                      </p>
                      <p className="text-xs text-[#2C302E]/60">{order.city}</p>
                      <p className="text-xs text-[#2C302E]/60 max-w-[220px]">
                        {order.address}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <p className="text-sm text-[#2C302E]">{order.email}</p>
                      <p className="text-sm text-[#2C302E]/70">{order.phone}</p>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl bg-[#EFEBE4]/40 px-3 py-2"
                          >
                            <p className="text-sm font-medium text-[#2C302E]">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-[#2C302E]/70">
                              Qty {item.quantity} × ৳{" "}
                              {Number(item.price).toFixed(0)} = ৳{" "}
                              {Number(item.subtotal).toFixed(0)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <p className="font-bold text-[#2C302E]">
                        ৳ {Number(order.total_amount).toFixed(0)}
                      </p>
                      <p className="text-xs text-[#2C302E]/60 capitalize">
                        {order.payment_method.replaceAll("_", " ")}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold capitalize ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status === "processing"
                          ? "approved"
                          : formatStatus(order.status)}
                      </span>

                      <p className="text-[11px] text-[#2C302E]/60 mt-2">
                        Updated: {formatDate(order.updated_at)}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-top min-w-[150px]">
                      {renderOrderActions(order)}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <p className="text-sm text-[#2C302E]">
                        {formatDate(order.created_at)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}