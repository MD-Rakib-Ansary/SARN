"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import { useCart } from "@/context/CartContext";
import { createOrder, downloadOrderPayslip } from "@/lib/api";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();

  const [authChecked, setAuthChecked] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  const [payslipLoading, setPayslipLoading] = useState(false);
  const [payslipError, setPayslipError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "Dhaka",
    address: "",
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      window.location.assign("/login?next=/checkout");
      return;
    }

    setAuthChecked(true);
  }, []);

  const shippingFee = cartTotal > 2000 ? 0 : 120;
  const displayTotal = cartTotal + shippingFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrorMessage("");
  };

  const getReadableError = (error: any) => {
    if (typeof error === "string") {
      return error;
    }

    if (error?.detail) {
      return error.detail;
    }

    if (error?.items) {
      return Array.isArray(error.items) ? error.items[0] : error.items;
    }

    if (error?.full_name) {
      return `Full name: ${
        Array.isArray(error.full_name) ? error.full_name[0] : error.full_name
      }`;
    }

    if (error?.email) {
      return `Email: ${
        Array.isArray(error.email) ? error.email[0] : error.email
      }`;
    }

    if (error?.phone) {
      return `Phone: ${
        Array.isArray(error.phone) ? error.phone[0] : error.phone
      }`;
    }

    if (error?.address) {
      return `Address: ${
        Array.isArray(error.address) ? error.address[0] : error.address
      }`;
    }

    if (error?.city) {
      return `City: ${
        Array.isArray(error.city) ? error.city[0] : error.city
      }`;
    }

    return "Order failed. Please check your cart and customer information.";
  };

  const handleDownloadPayslip = async () => {
    if (!orderId) {
      setPayslipError(
        "Order ID not found. Please check your order from My Orders later."
      );
      return;
    }

    try {
      setPayslipLoading(true);
      setPayslipError("");

      await downloadOrderPayslip(orderId);
    } catch (error: any) {
      console.error(error);
      setPayslipError(getReadableError(error));
    } finally {
      setPayslipLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    const items = cart.map((item) => ({
      product: Number(item.id),
      quantity: Number(item.quantity),
    }));

    const orderPayload = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      payment_method: "cash_on_delivery",
      items,
    };

    try {
      setLoading(true);
      setErrorMessage("");
      setPayslipError("");

      const result = await createOrder(orderPayload);

      setOrderId(result.id || null);
      setIsOrdered(true);

      setTimeout(() => {
        clearCart();
      }, 800);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(getReadableError(error));
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="bg-[#EFEBE4]/40 border border-[#EFEBE4] rounded-2xl px-8 py-6 text-[#2C302E]/70">
          Checking login status...
        </div>
      </div>
    );
  }

  if (isOrdered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-white">
        <CheckBadgeIcon className="h-20 w-20 text-[#8DA399] mb-6" />

        <h1 className="text-4xl font-serif text-[#2C302E] mb-4">
          Order Confirmed!
        </h1>

        <p className="text-gray-500 max-w-md mb-3">
          Thank you for choosing SARN. Your order has been placed successfully.
        </p>

        {orderId && (
          <p className="text-sm text-[#2C302E]/60 mb-6">
            Order ID: #{orderId}
          </p>
        )}

        {payslipError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 max-w-md">
            {payslipError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleDownloadPayslip}
            disabled={!orderId || payslipLoading}
            className="bg-[#8DA399] text-white px-10 py-3.5 rounded-full font-bold hover:bg-[#2C302E] transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {payslipLoading ? "Preparing Payslip..." : "Download Payslip"}
          </button>

          <Link
            href="/"
            className="bg-[#2C302E] text-white px-10 py-3.5 rounded-full font-bold hover:bg-black transition shadow-lg"
          >
            Return to Boutique
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif text-[#2C302E] mb-4">
          Your cart is empty
        </h2>

        <Link
          href="/products"
          className="text-[#8DA399] font-medium hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-[#8DA399] mb-8 hover:text-[#2C302E] transition font-medium"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Cart
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#EFEBE4]">
            <h1 className="text-3xl font-serif text-[#2C302E] mb-8">
              Secure Checkout
            </h1>

            {errorMessage && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F6F2] border border-[#EFEBE4] focus:outline-none focus:border-[#8DA399] transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F6F2] border border-[#EFEBE4] focus:outline-none focus:border-[#8DA399] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Phone
                  </label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F6F2] border border-[#EFEBE4] focus:outline-none focus:border-[#8DA399] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  City
                </label>
                <input
                  required
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F6F2] border border-[#EFEBE4] focus:outline-none focus:border-[#8DA399] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Address
                </label>
                <textarea
                  required
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F6F2] border border-[#EFEBE4] focus:outline-none focus:border-[#8DA399] transition"
                />
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-6 bg-gray-50 p-3 rounded-lg">
                  <ShieldCheckIcon className="h-4 w-4 text-[#8DA399]" />
                  <span>Cash on Delivery for Dhaka orders.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2C302E] text-white py-4 rounded-full font-bold hover:bg-black transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Placing Order..."
                    : `Place Order • ৳ ${displayTotal}`}
                </button>
              </div>
            </form>
          </div>

          <div className="sticky top-24">
            <div className="bg-[#2C302E] text-white p-8 rounded-3xl shadow-xl">
              <h2 className="text-xl font-serif mb-6 border-b border-white/10 pb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm text-left"
                  >
                    <span className="opacity-90">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      ৳ {Number(item.price) * Number(item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3">
                <div className="flex justify-between text-sm opacity-70">
                  <span>Subtotal</span>
                  <span>৳ {cartTotal}</span>
                </div>

                <div className="flex justify-between text-sm opacity-70">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? "FREE" : `৳ ${shippingFee}`}</span>
                </div>

                <div className="flex justify-between text-2xl font-serif pt-4">
                  <span>Total</span>
                  <span className="text-[#C89F8B]">৳ {displayTotal}</span>
                </div>

                <p className="text-xs text-white/40 pt-4">
                  Note: Backend currently stores product subtotal only. Shipping
                  fee is shown in frontend summary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}