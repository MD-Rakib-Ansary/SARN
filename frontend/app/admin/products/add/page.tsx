"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  old_price: string;
  category: string;
  stock: string;
  is_featured: boolean;
  image: File | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function AddProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    old_price: "",
    category: "",
    stock: "",
    is_featured: false,
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((previous) => ({
      ...previous,
      is_featured: event.target.checked,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    setFormData((previous) => ({
      ...previous,
      image: file,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const getReadableError = (error: any) => {
    if (typeof error === "string") return error;

    if (error?.detail) return error.detail;

    if (error?.name) {
      return `Name: ${Array.isArray(error.name) ? error.name[0] : error.name}`;
    }

    if (error?.price) {
      return `Price: ${Array.isArray(error.price) ? error.price[0] : error.price}`;
    }

    if (error?.stock) {
      return `Stock: ${Array.isArray(error.stock) ? error.stock[0] : error.stock}`;
    }

    if (error?.image) {
      return `Image: ${Array.isArray(error.image) ? error.image[0] : error.image}`;
    }

    return "Failed to add product. Please check the form and try again.";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setErrorMessage("You must login as an admin before adding products.");
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMessage("Valid product price is required.");
      return;
    }

    if (!formData.stock || Number(formData.stock) < 0) {
      setErrorMessage("Valid stock quantity is required.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("price", formData.price);

      if (formData.old_price) {
        payload.append("old_price", formData.old_price);
      }

      payload.append("category", formData.category);
      payload.append("stock", formData.stock);
      payload.append("is_featured", String(formData.is_featured));

      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response = await fetch(`${API_BASE_URL}/products/admin/create/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: payload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      setSuccessMessage("Product added successfully.");

      setTimeout(() => {
        router.push("/admin/products");
      }, 800);
    } catch (error: any) {
      setErrorMessage(getReadableError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-[#8DA399] hover:underline"
        >
          ← Back to Products
        </Link>

        <h1 className="text-3xl font-bold text-[#2C302E] mt-4">
          Add New Product
        </h1>

        <p className="text-[#2C302E]/70 mt-1">
          Create a new product in the Django backend.
        </p>
      </div>

      <div className="bg-white border border-[#EFEBE4] rounded-2xl shadow-sm p-8">
        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#2C302E] mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: Organic Baby Lotion"
              className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C302E] mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Write product details..."
              className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#2C302E] mb-2">
                Price
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="350"
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2C302E] mb-2">
                Old Price
              </label>
              <input
                type="number"
                name="old_price"
                min="0"
                step="0.01"
                value={formData.old_price}
                onChange={handleChange}
                placeholder="450"
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#2C302E] mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Baby Care"
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2C302E] mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="20"
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C302E] mb-2">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
            />

            {formData.image && (
              <p className="text-sm text-[#2C302E]/60 mt-2">
                Selected: {formData.image.name}
              </p>
            )}
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-[#EFEBE4]/40 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={handleCheckboxChange}
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-[#2C302E]">
              Mark as featured product
            </span>
          </label>

          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2C302E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition disabled:opacity-60"
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>

            <Link
              href="/admin/products"
              className="bg-[#EFEBE4] text-[#2C302E] px-6 py-3 rounded-xl font-semibold hover:bg-[#d8d2c8] transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}