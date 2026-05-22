"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowDownTrayIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

import {
  downloadOrderPayslip,
  getMyOrders,
  type Order,
} from "@/lib/api";

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending",
    processing: "Approved / Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return labels[status] || status;
};

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-purple-50 text-purple-700 border-purple-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

const getDeliveryCharge = (subtotal: number) => {
  return subtotal > 2000 ? 0 : 120;
};

const getPaymentLabel = (paymentMethod: string) => {
  return paymentMethod
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadingOrderId, setDownloadingOrderId] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function loadOrders() {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        window.location.assign("/login?next=/my-orders");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getMyOrders();
        setOrders(data);
      } catch (error: any) {
        setErrorMessage(
          error?.detail || "Failed to load your orders. Please login again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const handleDownloadPayslip = async (orderId: number) => {
    try {
      setDownloadingOrderId(orderId);
      setErrorMessage("");

      await downloadOrderPayslip(orderId);
    } catch (error: any) {
      setErrorMessage(error?.detail || "Failed to download payslip.");
    } finally {
      setDownloadingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#EFEBE4]/30">
        <div className="bg-white border border-[#EFEBE4] rounded-2xl px-8 py-6 text-[#2C302E]/70">
          Loading your orders...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEBE4]/30 py-12 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-left">
          <h1 className="text-4xl font-serif font-bold text-[#2C302E]">
            My Orders
          </h1>
          <p className="text-[#2C302E]/60 mt-2">
            Track your order status and download your payslip.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EFEBE4] p-10 text-center">
            <ClipboardDocumentListIcon className="h-16 w-16 text-[#8DA399] mx-auto mb-4" />

            <h2 className="text-2xl font-serif text-[#2C302E] mb-3">
              No orders found
            </h2>

            <p className="text-[#2C302E]/60 mb-6">
              You have not placed any orders yet.
            </p>

            <Link
              href="/products"
              className="inline-flex bg-[#2C302E] text-white px-8 py-3 rounded-full font-bold hover:bg-black transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const productSubtotal = Number(order.total_amount) || 0;
              const deliveryCharge = getDeliveryCharge(productSubtotal);
              const grandTotal = productSubtotal + deliveryCharge;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#EFEBE4] shadow-sm p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-[#EFEBE4] pb-5">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-[#2C302E]">
                        Order #{order.id}
                      </h2>

                      <p className="text-sm text-[#2C302E]/50 mt-1">
                        Placed on {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      <span
                        className={`text-xs font-bold border rounded-full px-4 py-2 ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDownloadPayslip(order.id)}
                        disabled={downloadingOrderId === order.id}
                        className="inline-flex items-center justify-center gap-2 bg-[#8DA399] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#2C302E] transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        {downloadingOrderId === order.id
                          ? "Preparing..."
                          : "Download Payslip"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#2C302E]/50 mb-3">
                      Items
                    </h3>

                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-4 text-sm border-b border-[#EFEBE4]/60 pb-2 last:border-b-0"
                        >
                          <div>
                            <p className="font-medium text-[#2C302E]">
                              {item.product_name}
                            </p>
                            <p className="text-[#2C302E]/50">
                              Qty: {item.quantity} × BDT {item.price}
                            </p>
                          </div>

                          <p className="font-bold text-[#2C302E]">
                            BDT {item.subtotal}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
                    <div className="bg-[#EFEBE4]/40 rounded-2xl p-4">
                      <p className="text-[#2C302E]/50">Product Subtotal</p>
                      <p className="font-bold text-[#2C302E] mt-1">
                        BDT {productSubtotal.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-[#EFEBE4]/40 rounded-2xl p-4">
                      <p className="text-[#2C302E]/50">Delivery Charge</p>
                      <p className="font-bold text-[#2C302E] mt-1">
                        {deliveryCharge === 0
                          ? "FREE"
                          : `BDT ${deliveryCharge.toFixed(2)}`}
                      </p>
                    </div>

                    <div className="bg-[#2C302E] text-white rounded-2xl p-4">
                      <p className="text-white/60">Grand Total</p>
                      <p className="font-bold mt-1">
                        BDT {grandTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 text-sm text-[#2C302E]/60 text-left">
                    <p>
                      <b>Payment:</b> {getPaymentLabel(order.payment_method)}
                    </p>
                    <p>
                      <b>Delivery Address:</b> {order.address}, {order.city}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}