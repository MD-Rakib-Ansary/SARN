"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { getProduct, type Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const data = await getProduct(productId);
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;

    addToCart({
      ...product,
      price: Number(product.price),
      image: product.image_url || product.image || "",
    } as any);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFEBE4]/30 flex items-center justify-center font-sans">
        <div className="bg-white border border-[#EFEBE4] rounded-2xl p-8 text-[#2C302E]/70">
          Loading product details...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#EFEBE4]/30 flex items-center justify-center font-sans">
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-700 mb-4">{error || "Product not found."}</p>

          <button
            type="button"
            onClick={() => router.push("/products")}
            className="bg-[#8DA399] text-white px-5 py-3 rounded-xl hover:bg-[#2C302E] transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const imageSrc = product.image_url || product.image || "";
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-[#EFEBE4]/30 pb-20 font-sans">
      <div className="bg-white border-b border-[#EFEBE4] py-10 mb-12">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/products"
            className="text-sm text-[#8DA399] hover:text-[#2C302E] transition-colors"
          >
            ← Back to Products
          </Link>

          <h1 className="text-4xl font-serif font-bold text-[#2C302E] mt-4">
            {product.name}
          </h1>

          <p className="text-[#2C302E]/60 mt-2">
            {product.category || "Product Details"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white rounded-[2rem] border border-[#EFEBE4] p-6">
          <div className="aspect-square bg-[#EFEBE4]/40 rounded-[1.5rem] overflow-hidden flex items-center justify-center">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[#2C302E]/40">No image</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-[#EFEBE4] p-8 h-fit">
          <h2 className="text-3xl font-serif font-bold text-[#2C302E]">
            {product.name}
          </h2>

          <p className="text-[#2C302E]/60 mt-4 leading-7">
            {product.description}
          </p>

          <div className="mt-8">
            <span className="text-4xl font-bold text-[#2C302E]">
              ৳ {Number(product.price).toFixed(0)}
            </span>

            {product.old_price && (
              <span className="ml-4 text-xl text-[#2C302E]/40 line-through">
                ৳ {Number(product.old_price).toFixed(0)}
              </span>
            )}
          </div>

          <div className="mt-6 text-sm text-[#2C302E]/60 space-y-1">
            <p>Category: {product.category || "N/A"}</p>
            <p>Stock: {product.stock}</p>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="mt-8 w-full bg-[#8DA399] text-white px-6 py-4 rounded-2xl hover:bg-[#2C302E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOutOfStock ? "Out of Stock" : added ? "Added to Cart" : "Add to Cart"}
          </button>

          <Link
            href="/cart"
            className="mt-4 block text-center text-sm text-[#8DA399] hover:underline"
          >
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}