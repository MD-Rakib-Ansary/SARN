"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { getApiBaseUrl, getProducts, type Product } from "@/lib/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to load products from Django backend.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setErrorMessage("You must login as an admin before deleting products.");
      return;
    }

    try {
      setDeletingProductId(product.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `${getApiBaseUrl()}/products/admin/${product.id}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      if (response.status === 403) {
        throw new Error("Permission denied. Please login with an admin account.");
      }

      if (!response.ok) {
        throw new Error("Failed to delete product.");
      }

      setProducts((previousProducts) =>
        previousProducts.filter((item) => item.id !== product.id)
      );

      setSuccessMessage(`"${product.name}" deleted successfully.`);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to delete product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = products
      .map((product) => product.category)
      .filter(Boolean);

    return ["all", ...Array.from(new Set(uniqueCategories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = product.name || "";
      const productCategory = product.category || "";

      const matchesSearch =
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productCategory.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || productCategory === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && product.stock > 0) ||
        (stockFilter === "out-of-stock" && product.stock <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const totalProducts = products.length;
  const inStockCount = products.filter((product) => product.stock > 0).length;
  const outOfStockCount = products.filter((product) => product.stock <= 0).length;
  const featuredCount = products.filter((product) => product.is_featured).length;

  const formatDate = (dateValue: string) => {
    if (!dateValue) return "N/A";

    return new Date(dateValue).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    return `৳ ${Number(value).toFixed(0)}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C302E]">Products</h1>
          <p className="text-[#2C302E]/70 mt-1">
            View and manage products loaded from the Django backend.
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="bg-[#2C302E] text-white px-5 py-3 rounded-xl hover:bg-black transition-colors flex items-center gap-2 w-fit"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#2C302E]/70">Total Products</p>
          <p className="text-3xl font-bold text-[#2C302E] mt-2">
            {totalProducts}
          </p>
        </div>

        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#2C302E]/70">In Stock</p>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {inStockCount}
          </p>
        </div>

        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#2C302E]/70">Out of Stock</p>
          <p className="text-3xl font-bold text-red-700 mt-2">
            {outOfStockCount}
          </p>
        </div>

        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-[#2C302E]/70">Featured</p>
          <p className="text-3xl font-bold text-[#8DA399] mt-2">
            {featuredCount}
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#EFEBE4] rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by product name or category..."
            className="px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            className="px-4 py-3 border border-[#EFEBE4] rounded-xl focus:outline-none focus:border-[#8DA399]"
          >
            <option value="all">All Stock Status</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-8 text-center text-[#2C302E]/70">
          Loading products...
        </div>
      )}

      {!loading && !errorMessage && filteredProducts.length === 0 && (
        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-8 text-center text-[#2C302E]/70">
          No products found.
        </div>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#EFEBE4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-[#EFEBE4]/60 border-b border-[#EFEBE4]">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Product
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Category
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Price
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Stock
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Featured
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Created
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-[#2C302E] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EFEBE4]">
                {filteredProducts.map((product) => {
                  const imageSrc = product.image_url || product.image || "";
                  const isDeleting = deletingProductId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-[#EFEBE4]/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-[#EFEBE4] overflow-hidden flex items-center justify-center border border-[#EFEBE4]">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-[#2C302E]/50 text-center px-1">
                                No image
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-[#2C302E]">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#2C302E]/60">
                              ID: {product.id}
                            </p>
                            <p className="text-xs text-[#2C302E]/60">
                              Slug: {product.slug || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#8DA399]/15 text-[#52665D]">
                          {product.category || "Uncategorized"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-[#2C302E]">
                          {formatPrice(product.price)}
                        </p>

                        {product.old_price && (
                          <p className="text-xs text-[#2C302E]/50 line-through">
                            {formatPrice(product.old_price)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            product.stock > 0
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} available`
                            : "Out of stock"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            product.is_featured
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {product.is_featured ? "Featured" : "Normal"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#2C302E]/70">
                        {formatDate(product.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/products/${product.id}`}
                            className="text-[#8DA399] hover:text-[#2C302E] transition"
                            title="View product"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>

                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-blue-500 hover:text-blue-700 transition"
                            title="Edit product"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={isDeleting}
                            title="Delete product"
                            className="text-red-400 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>

                        {isDeleting && (
                          <p className="text-[11px] text-red-500 mt-2">
                            Deleting...
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
