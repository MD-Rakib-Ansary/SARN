"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { getProduct, type Product } from "@/lib/api";

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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params?.id as string;

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setErrorMessage("");

        const product = await getProduct(productId);

        setCurrentProduct(product);

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: String(product.price || ""),
          old_price: product.old_price ? String(product.old_price) : "",
          category: product.category || "",
          stock: String(product.stock ?? 0),
          is_featured: Boolean(product.is_featured),
          image: null,
        });
      } catch (error) {
        setErrorMessage("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

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
      return `Price: ${
        Array.isArray(error.price) ? error.price[0] : error.price
      }`;
    }

    if (error?.stock) {
      return `Stock: ${
        Array.isArray(error.stock) ? error.stock[0] : error.stock
      }`;
    }

    if (error?.image) {
      return `Image: ${
        Array.isArray(error.image) ? error.image[0] : error.image
      }`;
    }

    return "Failed to update product. Please check the form and try again.";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setErrorMessage("You must login as an admin before editing products.");
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

    if (formData.stock === "" || Number(formData.stock) < 0) {
      setErrorMessage("Valid stock quantity is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("category", formData.category);
      payload.append("stock", formData.stock);
      payload.append("is_featured", String(formData.is_featured));

      if (formData.old_price) {
        payload.append("old_price", formData.old_price);
      }

      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response = await fetch(
        `${API_BASE_URL}/products/admin/${productId}/update/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: payload,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      setSuccessMessage("Product updated successfully.");

      setTimeout(() => {
        router.push("/admin/products");
      }, 800);
    } catch (error: any) {
      setErrorMessage(getReadableError(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#EFEBE4] rounded-2xl p-8 text-center text-[#2C302E]/70">
        Loading product...
      </div>
    );
  }

  if (errorMessage && !currentProduct) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
        <p>{errorMessage}</p>

        <Link
          href="/admin/products"
          className="inline-block mt-4 bg-[#2C302E] text-white px-4 py-2 rounded-xl"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const currentImage = currentProduct?.image_url || currentProduct?.image || "";

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
          Edit Product
        </h1>

        <p className="text-[#2C302E]/70 mt-1">
          Update product information in the Django backend.
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

        {currentImage && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#2C302E] mb-2">
              Current Image
            </p>
            <div className="w-32 h-32 rounded-xl bg-[#EFEBE4] overflow-hidden border border-[#EFEBE4]">
              <img
                src={currentImage}
                alt={formData.name || "Current product image"}
                className="w-full h-full object-cover"
              />
            </div>
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
                className="w-full px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C302E] mb-2">
              Replace Product Image
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
              disabled={saving}
              className="bg-[#2C302E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
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