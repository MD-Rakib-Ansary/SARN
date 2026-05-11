"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { useCart } from "@/context/CartContext";

type StoredUser = {
  id?: number;
  username?: string;
  email?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { cartCount, isLoaded } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("sarn_user");

    setIsLoggedIn(Boolean(accessToken));

    if (accessToken && savedUser) {
      try {
        const user: StoredUser = JSON.parse(savedUser);

        setIsAdmin(
          user.is_staff === true || user.is_superuser === true
        );
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }

    setAuthChecked(true);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sarn_user");

    setIsLoggedIn(false);
    setIsAdmin(false);

    router.push("/login");
  };

  return (
    <nav className="w-full bg-white sticky top-0 z-50 shadow-sm font-sans text-left">
      {/* Trust Bar */}
      <div className="bg-[#8DA399] text-white text-[10px] py-2 px-6 flex justify-between items-center uppercase tracking-[2px] font-bold">
        <span>🌙 Halal Certified Ingredients</span>
        <span className="hidden md:block">
          Free Shipping in Dhaka on orders over ৳2000
        </span>
        <span>🌿 100% Organic & Baby-Safe</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-3xl font-serif font-bold text-[#2C302E] tracking-tighter">
            SARN<span className="text-[#C89F8B]">.</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-10 text-left">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive("/")
                ? "text-[#8DA399]"
                : "text-[#2C302E]/70 hover:text-[#8DA399]"
            }`}
          >
            Home
          </Link>

          <Link
            href="/products"
            className={`text-sm font-medium transition-colors ${
              isActive("/products")
                ? "text-[#8DA399]"
                : "text-[#2C302E]/70 hover:text-[#8DA399]"
            }`}
          >
            Shop All
          </Link>

          <Link
            href="/about"
            className={`text-sm font-medium transition-colors ${
              isActive("/about")
                ? "text-[#8DA399]"
                : "text-[#2C302E]/70 hover:text-[#8DA399]"
            }`}
          >
            Our Story
          </Link>

          {authChecked && isAdmin && (
            <Link
              href="/admin/dashboard"
              className={`text-xs px-3 py-1 rounded-full border border-[#EFEBE4] transition-all ${
                isActive("/admin")
                  ? "bg-[#EFEBE4] text-[#2C302E]"
                  : "text-[#2C302E]/70 hover:bg-[#EFEBE4]"
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-5">
          <button
            type="button"
            className="text-[#2C302E]/70 hover:text-[#8DA399] transition-colors"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>

          {authChecked && isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-[#2C302E]/70 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm text-[#2C302E]/70 hover:text-[#8DA399] transition-colors"
              title="Login"
            >
              <UserIcon className="h-5 w-5" />
              <span className="hidden md:inline">Login</span>
            </Link>
          )}

          <Link href="/cart" className="relative group" title="Cart">
            <div className="bg-[#C89F8B]/10 p-2 rounded-full group-hover:bg-[#C89F8B]/20 transition-colors">
              <ShoppingCartIcon className="h-6 w-6 text-[#C89F8B]" />
            </div>

            {isLoaded && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2C302E] text-white text-[9px] min-w-4 h-4 px-1 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}