"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

import {
  TrashIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  CreditCardIcon,
  GiftIcon,
  TruckIcon,
  ShieldCheckIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const subtotal = Number(cartTotal) || 0;
  const shipping = subtotal > 2000 ? 0 : 120;
  const total = Math.max(subtotal + shipping - discount, 0);

  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setPromoMessage("Please enter a promo code.");
      setDiscount(0);
    } else if (code === "SAVE10") {
      setDiscount(subtotal * 0.1);
      setPromoMessage("10% discount applied.");
    } else if (code === "SAVE20") {
      setDiscount(subtotal * 0.2);
      setPromoMessage("20% discount applied.");
    } else {
      setDiscount(0);
      setPromoMessage("Invalid promo code.");
    }

    setTimeout(() => setPromoMessage(""), 3000);
  };

  const handlePromoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
  };

  const handleUpdateQuantity = (productId: number | string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const safeId = String(productId);
    setIsUpdating(safeId);

    setTimeout(() => {
      updateQuantity(productId, newQuantity);
      setIsUpdating(null);
    }, 200);
  };

  const handleRemove = (productId: number | string) => {
    removeFromCart(productId);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#EFEBE4] rounded-full w-32 h-32 mb-6 flex items-center justify-center">
          <ShoppingBagIcon className="h-16 w-16 text-[#8DA399]" />
        </div>

        <h1 className="text-3xl font-serif text-[#2C302E] mb-4">
          Your Cart is Empty
        </h1>

        <p className="text-gray-500 mb-8 max-w-md mx-auto text-center">
          Looks like you have not added any baby essentials yet. Browse our
          collection to find something you like.
        </p>

        <Link
          href="/products"
          className="bg-[#2C302E] text-white px-10 py-3.5 rounded-full font-semibold hover:bg-black transition shadow-md"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-serif text-[#2C302E]">
            Your Shopping Cart
          </h1>
          <p className="text-[#8DA399] font-medium mt-1">
            {cart.length} item(s) selected
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-[#EFEBE4] overflow-hidden">
              <div className="divide-y divide-[#EFEBE4]">
                {cart.map((item) => {
                  const itemAny = item as any;
                  const itemId = itemAny.id;
                  const imageSrc =
                    itemAny.image_url || itemAny.image || itemAny.thumbnail || "";
                  const itemPrice = Number(itemAny.price) || 0;
                  const itemQuantity = Number(itemAny.quantity) || 1;
                  const itemSubtotal = itemPrice * itemQuantity;
                  const isItemUpdating = isUpdating === String(itemId);

                  return (
                    <div
                      key={String(itemId)}
                      className="p-6 hover:bg-gray-50/50 transition"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative w-24 h-24 bg-[#EFEBE4] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={itemAny.name || "Product image"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-[#2C302E]/40 text-center px-2">
                              No image
                            </span>
                          )}
                        </div>

                        <div className="flex-1 text-left">
                          <Link href={`/products/${itemId}`}>
                            <h3 className="font-medium text-[#2C302E] text-lg hover:text-[#8DA399] transition">
                              {itemAny.name}
                            </h3>
                          </Link>

                          <p className="text-[#8DA399] font-bold mt-1 text-lg">
                            ৳ {itemPrice.toFixed(0)}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            Item total: ৳ {itemSubtotal.toFixed(0)}
                          </p>

                          <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-3 bg-[#EFEBE4]/50 rounded-full px-3 py-1 border border-[#EFEBE4]">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateQuantity(itemId, itemQuantity - 1)
                                }
                                disabled={isItemUpdating || itemQuantity <= 1}
                                className="p-1 hover:text-[#8DA399] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>

                              <span className="w-5 text-center text-sm font-bold">
                                {isItemUpdating ? (
                                  <ArrowPathIcon className="h-3 w-3 animate-spin mx-auto" />
                                ) : (
                                  itemQuantity
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateQuantity(itemId, itemQuantity + 1)
                                }
                                disabled={isItemUpdating}
                                className="p-1 hover:text-[#8DA399] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemove(itemId)}
                              className="text-red-400 hover:text-red-600 flex items-center gap-1 text-sm font-medium transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-left">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EFEBE4]">
                <TruckIcon className="h-6 w-6 text-[#8DA399] mb-2" />
                <p className="text-xs font-bold text-[#2C302E]">
                  Free Shipping
                </p>
                <p className="text-[10px] text-gray-400">Orders over ৳ 2000</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EFEBE4]">
                <ShieldCheckIcon className="h-6 w-6 text-[#8DA399] mb-2" />
                <p className="text-xs font-bold text-[#2C302E]">
                  Secure Checkout
                </p>
                <p className="text-[10px] text-gray-400">Order safely</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EFEBE4]">
                <ArrowPathIcon className="h-6 w-6 text-[#8DA399] mb-2" />
                <p className="text-xs font-bold text-[#2C302E]">
                  Easy Updates
                </p>
                <p className="text-[10px] text-gray-400">Edit quantities</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EFEBE4]">
                <GiftIcon className="h-6 w-6 text-[#8DA399] mb-2" />
                <p className="text-xs font-bold text-[#2C302E]">Gift Ready</p>
                <p className="text-[10px] text-gray-400">Baby essentials</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-md border border-[#EFEBE4] p-8 sticky top-24">
              <h2 className="text-xl font-serif text-blue-500 mb-6 text-left">
                Order Summary
              </h2>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={handlePromoChange}
                    className="flex-1 px-4 py-2 bg-[#EFEBE4]/30 border border-[#EFEBE4] rounded-full text-sm focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className="bg-[#2C302E] text-white px-6 py-2 rounded-full text-sm hover:bg-black transition"
                  >
                    Apply
                  </button>
                </div>

                {promoMessage && (
                  <p
                    className={`text-[11px] mt-2 text-left ${
                      promoMessage.includes("applied")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {promoMessage}
                  </p>
                )}
              </div>

              <div className="space-y-4 border-b border-[#EFEBE4] pb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#2C302E]">
                    ৳ {subtotal.toFixed(0)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span
                    className={
                      shipping === 0
                        ? "text-[#8DA399] font-bold"
                        : "font-bold text-[#2C302E]"
                    }
                  >
                    {shipping === 0 ? "FREE" : `৳ ${shipping}`}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Discount</span>
                    <span>- ৳ {discount.toFixed(0)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <span className="text-lg font-bold text-[#2C302E]">Total</span>
                <span className="text-2xl font-bold text-[#2C302E]">
                  ৳ {total.toFixed(0)}
                </span>
              </div>

              <Link href="/checkout">
                <button
                  type="button"
                  className="w-full bg-[#2C302E] text-white py-4 rounded-full font-bold hover:bg-black transition mt-8 shadow-lg flex items-center justify-center gap-2"
                >
                  <CreditCardIcon className="h-5 w-5" />
                  Proceed to Checkout
                </button>
              </Link>

              <Link
                href="/products"
                className="block text-center mt-4 text-sm text-[#8DA399] hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}