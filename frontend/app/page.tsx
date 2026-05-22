"use client";

import { useState } from "react";
import Link from "next/link";

import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { addToCart } = useCart();
  const [addedProductId, setAddedProductId] = useState<number | string | null>(
    null
  );

  const handleAddToCart = (product: any) => {
    addToCart({
      ...product,
      price: Number(product.price),
      image: product.image || product.image_url || "",
      quantity: 1,
    } as any);

    setAddedProductId(product.id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#EFEBE4]/30 font-sans">
      {/* NEW SARN HERO SECTION */}
      <section className="bg-[#EFEBE4] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#8DA399]/10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#8DA399] tracking-tight mb-6">
            Purely for Your Little Ones
          </h1>

          <p className="mt-4 text-xl text-[#2C302E]/70 max-w-2xl mx-auto mb-10">
            Discover our carefully curated collection of premium, baby-safe, and
            halal-certified essentials.
          </p>

          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-[#8DA399] hover:bg-[#8DA399]/90 transition-all duration-200 shadow-lg shadow-[#8DA399]/20"
          >
            Shop the Collection
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#2C302E]">
              Featured Essentials
            </h2>
            <p className="text-[#2C302E]/50 mt-2">
              Handpicked for quality and safety
            </p>
          </div>

          <Link
            href="/products"
            className="text-[#C89F8B] font-medium hover:underline text-sm"
          >
            View all products →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product: any) => {
            const isAdded = addedProductId === product.id;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 border border-[#EFEBE4] group hover:shadow-xl hover:shadow-[#2C302E]/5 transition-all duration-300"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square bg-[#EFEBE4]/40 rounded-xl mb-4 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>

                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-medium text-[#2C302E] hover:text-[#8DA399] transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex justify-between items-center mt-3">
                  <p className="text-[#8DA399] font-bold text-lg">
                    ৳ {product.price}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="text-xs bg-[#2C302E] text-white px-3 py-1.5 rounded-full hover:bg-[#C89F8B] transition-colors"
                  >
                    {isAdded ? "Added" : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}