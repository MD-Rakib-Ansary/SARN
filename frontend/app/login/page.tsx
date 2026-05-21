"use client";

import { useState } from "react";
import Link from "next/link";

import { getApiBaseUrl, loginUser } from "@/lib/api";

type LoginError = {
  detail?: string;
  message?: string;
  non_field_errors?: string[];
};

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrorMessage("");
    setSuccessMessage("");
  };

  const getReadableError = (error: unknown) => {
    if (typeof error === "object" && error !== null) {
      const apiError = error as LoginError;

      if (apiError.detail) return apiError.detail;
      if (apiError.message) return apiError.message;
      if (apiError.non_field_errors?.length) {
        return apiError.non_field_errors[0];
      }
    }

    if (typeof error === "string") return error;

    return "Login failed. Please check your username and password.";
  };

  const fetchCurrentUser = async (accessToken: string) => {
    const response = await fetch(`${getApiBaseUrl()}/accounts/me/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Login succeeded, but user profile could not be loaded.");
    }

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const result = await loginUser({
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem("accessToken", result.access);
      localStorage.setItem("refreshToken", result.refresh);

      const userData = await fetchCurrentUser(result.access);

      localStorage.setItem("sarn_user", JSON.stringify(userData));

      const isAdmin =
        userData.is_staff === true || userData.is_superuser === true;

      setSuccessMessage(
        isAdmin
          ? "Admin login successful. Redirecting to dashboard..."
          : "Login successful. Redirecting..."
      );

      setTimeout(() => {
        window.location.assign(isAdmin ? "/admin/dashboard" : "/");
      }, 800);
    } catch (error: unknown) {
      setErrorMessage(getReadableError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEBE4]/30 px-4 py-16 font-sans">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-[2rem] shadow-sm border border-[#EFEBE4] p-8">
          <h1 className="text-3xl font-serif font-bold text-center text-[#2C302E] mb-2">
            Login
          </h1>

          <p className="text-center text-[#2C302E]/70 mb-8">
            Sign in to continue shopping.
          </p>

          {successMessage && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form method="post" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2C302E] mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DA399]"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C302E] mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DA399]"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8DA399] text-white py-3 rounded-xl font-semibold hover:bg-[#2C302E] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-[#2C302E]/70">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#8DA399] hover:underline">
                Register
              </Link>
            </p>
          </div>

          <div className="mt-6 rounded-xl bg-[#EFEBE4]/50 p-4 text-sm text-[#2C302E]/70">
            <p className="font-medium text-[#2C302E] mb-1">Login note:</p>
            <p>Use username, not email.</p>
            <p>
              Admin users will be redirected to the admin dashboard automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
