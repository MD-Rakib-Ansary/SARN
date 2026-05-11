"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

// Interface updated to match your global Product type exactly
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string; // Removed the "?" to satisfy the strict Type check
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    // These two lines prevent the card's Link from triggering when 
    // you only meant to click the "Add to Cart" button.
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EFEBE4] overflow-hidden hover:shadow-md transition-all duration-300 group">
      
      {/* Clickable Area: Takes user to the Dynamic Product Detail Page */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-64 w-full bg-[#F8F6F2] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        <div className="p-5 text-left">
          {/* Subtle Category Badge */}
          <span className="text-[10px] font-bold text-[#8DA399] uppercase tracking-widest mb-1 block">
            {product.category}
          </span>
          
          <h3 className="text-lg font-serif text-[#2C302E] mb-2 group-hover:text-[#8DA399] transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </Link>

      {/* Action Area: Price and Cart Button */}
      <div className="px-5 pb-5 flex justify-between items-center">
        <span className="text-xl font-bold text-[#2C302E]">
          ৳ {product.price}
        </span>
        <button
          onClick={handleAddToCart}
          className="bg-[#2C302E] text-white px-5 py-2 rounded-full hover:bg-black transition-all text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}