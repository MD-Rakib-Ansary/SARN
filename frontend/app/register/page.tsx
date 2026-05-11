"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
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

  const getReadableError = (error: any) => {
    if (typeof error === "string") {
      return error;
    }

    if (error?.username) {
      return `Username: ${Array.isArray(error.username) ? error.username[0] : error.username}`;
    }

    if (error?.email) {
      return `Email: ${Array.isArray(error.email) ? error.email[0] : error.email}`;
    }

    if (error?.password) {
      return `Password: ${Array.isArray(error.password) ? error.password[0] : error.password}`;
    }

    if (error?.password2) {
      return `Confirm Password: ${Array.isArray(error.password2) ? error.password2[0] : error.password2}`;
    }

    if (error?.non_field_errors) {
      return Array.isArray(error.non_field_errors)
        ? error.non_field_errors[0]
        : error.non_field_errors;
    }

    return "Registration failed. Please check your information and try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      await registerUser(formData);

      setSuccessMessage("Registration successful. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error: any) {
      console.error(error);
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
            Register
          </h1>

          <p className="text-center text-[#2C302E]/60 mb-8">
            Create your account to continue shopping.
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
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DA399]"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C302E] mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DA399]"
                placeholder="Enter email"
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
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DA399]"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C302E] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="password2"
                required
                minLength={6}
                value={formData.password2}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DA399]"
                placeholder="Confirm password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8DA399] text-white py-3 rounded-xl font-semibold hover:bg-[#2C302E] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-[#2C302E]/60">
              Already have an account?{" "}
              <Link href="/login" className="text-[#8DA399] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}