"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import Link from "next/link";

import { getApiBaseUrl, loginUser } from "@/lib/api";

type LoginError = {
  detail?: string;
  message?: string;
  non_field_errors?: string[];
};

type UserData = {
  id?: number;
  username?: string;
  email?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
};

type LoginResult = {
  access?: string;
  refresh?: string;
  user?: UserData;
  username?: string;
  email?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
};

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

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

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "Login failed. Please check your username and password.";
  };

  const fetchCurrentUser = async (accessToken: string): Promise<UserData | null> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/accounts/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch {
      return null;
    }
  };

  const getSafeNextPath = () => {
    const params = new URLSearchParams(window.location.search);
    const nextPath = params.get("next");

    if (
      nextPath &&
      nextPath.startsWith("/") &&
      !nextPath.startsWith("//") &&
      nextPath !== "/login"
    ) {
      return nextPath;
    }

    return "/";
  };

  const clearOldLoginData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sarn_user");
  };

  const saveUserData = (userData: UserData | null, fallbackUsername: string) => {
    const safeUserData: UserData = userData || {
      username: fallbackUsername,
      is_staff: false,
      is_superuser: false,
    };

    localStorage.setItem("sarn_user", JSON.stringify(safeUserData));

    return safeUserData;
  };

  const redirectAfterLogin = (isAdmin: boolean) => {
    const targetPath = isAdmin ? "/admin/dashboard" : getSafeNextPath();

    window.dispatchEvent(new Event("sarn-auth-changed"));

    setTimeout(() => {
      window.location.replace(targetPath);
    }, 100);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const submittedForm = new FormData(e.currentTarget);

    const usernameFromForm = String(submittedForm.get("username") || "").trim();
    const passwordFromForm = String(submittedForm.get("password") || "");

    const username = usernameFromForm || formData.username.trim();
    const password = passwordFromForm || formData.password;

    if (!username || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      clearOldLoginData();

      const result = (await loginUser({
        username,
        password,
      })) as LoginResult;

      if (!result?.access || !result?.refresh) {
        throw new Error("Login response did not include valid tokens.");
      }

      localStorage.setItem("accessToken", result.access);
      localStorage.setItem("refreshToken", result.refresh);

      let userData: UserData | null = null;

      if (result.user) {
        userData = result.user;
      } else if (
        result.username ||
        result.email ||
        typeof result.is_staff === "boolean" ||
        typeof result.is_superuser === "boolean"
      ) {
        userData = {
          username: result.username || username,
          email: result.email,
          is_staff: result.is_staff === true,
          is_superuser: result.is_superuser === true,
        };
      } else {
        userData = await fetchCurrentUser(result.access);
      }

      const savedUser = saveUserData(userData, username);

      const isAdmin =
        savedUser.is_staff === true || savedUser.is_superuser === true;

      setSuccessMessage(
        isAdmin
          ? "Admin login successful. Redirecting to dashboard..."
          : "Login successful. Redirecting..."
      );

      redirectAfterLogin(isAdmin);
    } catch (error: unknown) {
      clearOldLoginData();
      setErrorMessage(getReadableError(error));
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2C302E] mb-2">
                Username
              </label>

              <input
                type="text"
                name="username"
                required
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DA399] disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DA399] disabled:bg-gray-50 disabled:cursor-not-allowed"
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