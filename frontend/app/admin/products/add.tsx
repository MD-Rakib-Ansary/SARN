"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
export default function AddProduct() {
  const router = useRouter();

  const handleSubmit = (productData: any) => {
    // Get existing products
    const existingProducts = JSON.parse(localStorage.getItem("products") || "[]");
    
    // Add new product
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
      image: productData.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    };
    
    existingProducts.push(newProduct);
    localStorage.setItem("products", JSON.stringify(existingProducts));
    
    alert("Product added successfully!");
    router.push("/admin/products");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}