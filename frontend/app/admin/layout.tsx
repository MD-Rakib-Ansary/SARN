"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type StoredUser = {
  id?: number;
  username?: string;
  email?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("sarn_user");

    if (!accessToken || !savedUser) {
      setIsAdmin(false);
      setAuthChecked(true);
      router.replace("/login");
      return;
    }

    try {
      const user: StoredUser = JSON.parse(savedUser);
      const userIsAdmin =
        user.is_staff === true || user.is_superuser === true;

      if (!userIsAdmin) {
        setIsAdmin(false);
        setAuthChecked(true);
        router.replace("/");
        return;
      }

      setIsAdmin(true);
      setAuthChecked(true);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("sarn_user");

      setIsAdmin(false);
      setAuthChecked(true);
      router.replace("/login");
    }
  }, [router]);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEBE4]/30">
        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-8 text-[#2C302E]/70">
          Checking admin access...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEBE4]/30">
        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-8 text-[#2C302E]/70">
          Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEBE4]/30">
      <div className="flex">
        <aside className="hidden md:block w-64 min-h-screen bg-white border-r border-[#EFEBE4] p-6">
          <Link href="/admin/dashboard" className="block mb-8">
            <h2 className="text-2xl font-serif font-bold text-[#2C302E]">
              SARN Admin
            </h2>
            <p className="text-xs text-[#2C302E]/60 mt-1">
              Management Panel
            </p>
          </Link>

          <nav className="space-y-2">
            <Link
              href="/admin/dashboard"
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive("/admin/dashboard")
                  ? "bg-[#2C302E] text-white"
                  : "text-[#2C302E]/70 hover:bg-[#EFEBE4]"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/admin/products"
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive("/admin/products")
                  ? "bg-[#2C302E] text-white"
                  : "text-[#2C302E]/70 hover:bg-[#EFEBE4]"
              }`}
            >
              Products
            </Link>

            <Link
              href="/admin/orders"
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive("/admin/orders")
                  ? "bg-[#2C302E] text-white"
                  : "text-[#2C302E]/70 hover:bg-[#EFEBE4]"
              }`}
            >
              Orders
            </Link>

            <Link
              href="/"
              className="block px-4 py-3 rounded-xl text-sm font-medium text-[#2C302E]/70 hover:bg-[#EFEBE4] transition"
            >
              Back to Shop
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}