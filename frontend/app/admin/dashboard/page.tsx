"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { getApiBaseUrl, getProducts, type Product } from "@/lib/api";

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

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          setErrorMessage("You must login as an admin to view dashboard data.");
          return;
        }

        const [productsData, ordersResponse] = await Promise.all([
          getProducts(),
          fetch(`${getApiBaseUrl()}/orders/admin/all/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          }),
        ]);

        if (ordersResponse.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }

        if (ordersResponse.status === 403) {
          throw new Error("Permission denied. Please login with an admin account.");
        }

        if (!ordersResponse.ok) {
          throw new Error("Failed to load orders from backend.");
        }

        const ordersData = await ordersResponse.json();

        setProducts(productsData);
        setOrders(ordersData);
      } catch (error: any) {
        setErrorMessage(error.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );

    const uniqueCustomers = new Set(
      orders.map((order) => order.email).filter(Boolean)
    ).size;

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue,
      uniqueCustomers,
    };
  }, [products, orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product) => product.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
  }, [products]);

  const formatDate = (dateValue: string) => {
    if (!dateValue) return "N/A";

    return new Date(dateValue).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      iconBg: "bg-blue-500",
      href: "/admin/products",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCartIcon,
      iconBg: "bg-green-500",
      href: "/admin/orders",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: ClockIcon,
      iconBg: "bg-yellow-500",
      href: "/admin/orders",
    },
    {
      title: "Revenue",
      value: `৳ ${stats.totalRevenue.toFixed(0)}`,
      icon: CurrencyDollarIcon,
      iconBg: "bg-[#8DA399]",
      href: "/admin/orders",
    },
    {
      title: "Customers",
      value: stats.uniqueCustomers,
      icon: UsersIcon,
      iconBg: "bg-purple-500",
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#2C302E]">Dashboard</h1>
        <p className="text-[#2C302E]/70 mt-1">
          Backend-connected overview of products, orders, revenue, and customers.
        </p>
      </div>

      {loading && (
        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-8 text-center text-[#2C302E]/70">
          Loading dashboard data...
        </div>
      )}

      {!loading && errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          <p className="font-semibold">Could not load dashboard</p>
          <p className="text-sm mt-1">{errorMessage}</p>

          <Link
            href="/login"
            className="inline-flex mt-4 bg-[#2C302E] text-white px-4 py-2 rounded-xl text-sm"
          >
            Login
          </Link>
        </div>
      )}

      {!loading && !errorMessage && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <Link
                  key={stat.title}
                  href={stat.href}
                  className="bg-white rounded-2xl border border-[#EFEBE4] shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#2C302E]/70">{stat.title}</p>
                      <p className="text-3xl font-bold text-[#2C302E] mt-2">
                        {stat.value}
                      </p>
                    </div>

                    <div className={`${stat.iconBg} p-3 rounded-full`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-[#EFEBE4] shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-[#2C302E]">
                  Recent Orders
                </h2>

                <Link
                  href="/admin/orders"
                  className="text-sm text-[#8DA399] hover:underline"
                >
                  View all
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="text-[#2C302E]/60">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="border-b border-[#EFEBE4]">
                      <tr>
                        <th className="text-left py-3 text-xs font-bold text-[#2C302E] uppercase">
                          Order
                        </th>
                        <th className="text-left py-3 text-xs font-bold text-[#2C302E] uppercase">
                          Customer
                        </th>
                        <th className="text-left py-3 text-xs font-bold text-[#2C302E] uppercase">
                          Total
                        </th>
                        <th className="text-left py-3 text-xs font-bold text-[#2C302E] uppercase">
                          Status
                        </th>
                        <th className="text-left py-3 text-xs font-bold text-[#2C302E] uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#EFEBE4]">
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="py-4 text-[#2C302E] font-semibold">
                            #{order.id}
                          </td>

                          <td className="py-4">
                            <p className="text-[#2C302E] font-medium">
                              {order.full_name}
                            </p>
                            <p className="text-xs text-[#2C302E]/60">
                              {order.email}
                            </p>
                          </td>

                          <td className="py-4 font-bold text-[#2C302E]">
                            ৳ {Number(order.total_amount).toFixed(0)}
                          </td>

                          <td className="py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold capitalize ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>

                          <td className="py-4 text-sm text-[#2C302E]/70">
                            {formatDate(order.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#EFEBE4] shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-[#2C302E]">
                  Low Stock Products
                </h2>

                <Link
                  href="/admin/products"
                  className="text-sm text-[#8DA399] hover:underline"
                >
                  Products
                </Link>
              </div>

              {lowStockProducts.length === 0 ? (
                <p className="text-[#2C302E]/60">
                  No low-stock products. Inventory looks okay.
                </p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-xl bg-[#EFEBE4]/40 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-[#2C302E]">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#2C302E]/60">
                          {product.category}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-bold rounded-full px-3 py-1 border ${
                          product.stock <= 0
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {product.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
