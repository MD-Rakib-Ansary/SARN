"use client";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { TrashIcon } from "@heroicons/react/24/outline";

interface CartItemType {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition">
      {/* Product Image */}
      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-contain p-2"
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <p className="text-gray-600">${item.price}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 border rounded-lg hover:bg-gray-100 transition"
        >
          -
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 border rounded-lg hover:bg-gray-100 transition"
        >
          +
        </button>
      </div>

      {/* Item Total */}
      <div className="w-24 text-right font-semibold">
        ${(item.price * item.quantity).toFixed(2)}
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="text-red-500 hover:text-red-700 transition"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}