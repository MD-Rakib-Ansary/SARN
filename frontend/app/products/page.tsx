"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Product } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function ProductsPage() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  useEffect(() => {
    async function loadProducts() {
      const apiUrl = `${getApiBaseUrl()}/products/`;

      try {
        setLoading(true);
        setError("");

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => {
          controller.abort();
        }, 10000);

        const response = await fetch(apiUrl, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        window.clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid product response format.");
        }

        setProducts(data);
      } catch (err: any) {
        console.error("Product loading error:", err);

        if (err?.name === "AbortError") {
          setError(
            `Product loading timed out. Check whether backend is running at ${apiUrl}`
          );
        } else {
          setError(`Failed to load products from backend. API: ${apiUrl}`);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, searchTerm, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      ...product,
      price: Number(product.price),
      image: product.image_url || product.image || "",
    } as any);

    setAddedProductId(product.id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#EFEBE4]/30 pb-20 font-sans">
      <div className="bg-white border-b border-[#EFEBE4] py-16 mb-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-[#2C302E]">
            Our Collection
          </h1>
          <p className="text-[#2C302E]/60 mt-2">
            Premium essentials for your baby&apos;s wellbeing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-12">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-6 py-4 rounded-2xl border border-[#EFEBE4] bg-white text-sm focus:outline-none focus:border-[#8DA399] w-full md:w-96 shadow-sm"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-6 py-4 rounded-2xl border border-[#EFEBE4] bg-white text-sm focus:outline-none focus:border-[#8DA399] shadow-sm"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-[#EFEBE4] p-8 text-center text-[#2C302E]/70">
            Loading products...
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center text-red-700">
            <p className="font-semibold mb-2">Product loading failed.</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#EFEBE4] p-8 text-center text-[#2C302E]/70">
            No products found.
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
            {filteredProducts.map((product) => {
              const imageSrc = product.image_url || product.image || "";
              const isAdded = addedProductId === product.id;
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-[2rem] p-5 border border-[#EFEBE4] group transition-all duration-300 hover:shadow-xl hover:shadow-[#8DA399]/10 flex h-full min-h-[560px] flex-col"
                >
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="h-[260px] w-full bg-[#EFEBE4]/40 rounded-[1.5rem] mb-6 overflow-hidden relative flex items-center justify-center">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-[#2C302E]/40 text-sm">
                          No image
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-xl font-serif font-bold text-[#2C302E] hover:text-[#8DA399] transition-colors leading-tight min-h-[60px]">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-[#2C302E]/50 mt-2 line-clamp-2 min-h-[42px]">
                      {product.description}
                    </p>

                    <div className="mt-auto pt-6">
                      <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0">
                          <span className="block text-2xl font-bold text-[#2C302E]">
                            ৳ {Number(product.price).toFixed(0)}
                          </span>

                          <span className="block min-h-[20px] text-sm text-[#2C302E]/40 line-through">
                            {product.old_price
                              ? `৳ ${Number(product.old_price).toFixed(0)}`
                              : ""}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => handleAddToCart(product)}
                          className="min-w-[128px] bg-[#8DA399] text-white px-4 py-2 rounded-xl hover:bg-[#2C302E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : isAdded
                            ? "Added"
                            : "Add to Cart"}
                        </button>
                      </div>

                      <p className="text-xs text-[#2C302E]/40 mt-4">
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}