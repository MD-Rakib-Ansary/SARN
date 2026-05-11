"use client";
import { useState, useEffect } from "react";
import { products } from "@/data/products";
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ShoppingBagIcon,
  CurrencyDollarIcon 
} from "@heroicons/react/24/outline";

export default function AdminAnalytics() {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);

  useEffect(() => {
    // Load orders from localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    
    // Calculate total sales
    const sales = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    setTotalSales(sales);
    
    // Calculate average order value
    setAverageOrderValue(orders.length > 0 ? sales / orders.length : 0);
    
    // Get top products (mock data)
    const productSales = products.map(product => ({
      ...product,
      salesCount: Math.floor(Math.random() * 100) + 10,
      revenue: product.price * (Math.floor(Math.random() * 100) + 10)
    }));
    
    const sorted = productSales.sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
    setTopProducts(sorted);
  }, []);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#2C302E]">Store Analytics</h1>
        <p className="text-[#2C302E]/60 text-sm mt-1">Review your sales performance and top-moving products.</p>
      </div>

      {/* Stats Grid - Using SARN Custom Palette */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Sales Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE4] flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-[#8DA399]/10 text-[#8DA399]">
            <CurrencyDollarIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C302E]/60">Total Sales</p>
            <p className="text-2xl font-bold text-[#2C302E] mt-1">৳ {totalSales.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Average Order Value Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE4] flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-[#C89F8B]/10 text-[#C89F8B]">
            <ArrowTrendingUpIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C302E]/60">Average Order Value</p>
            <p className="text-2xl font-bold text-[#2C302E] mt-1">৳ {averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Total Products Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE4] flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-[#2C302E]/10 text-[#2C302E]">
            <ShoppingBagIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C302E]/60">Total Products</p>
            <p className="text-2xl font-bold text-[#2C302E] mt-1">{products.length}</p>
          </div>
        </div>
      </div>

      {/* Top Products List */}
      <div className="bg-white rounded-2xl p-8 border border-[#EFEBE4]">
        <h2 className="text-xl font-serif text-[#8DA399] mb-6 tracking-wide">Top Selling Products</h2>
        
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between border-b border-[#EFEBE4]/50 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                {/* Replaced harsh blue circle with soft Oat/Sage branding */}
                <div className="w-8 h-8 bg-[#EFEBE4] rounded-full flex items-center justify-center text-[#8DA399] font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-[#2C302E]">{product.name}</p>
                  <p className="text-sm text-[#2C302E]/60">৳ {product.price}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-[#2C302E]">{product.salesCount} sales</p>
                <p className="text-sm text-[#2C302E]/60">৳ {product.revenue.toFixed(2)} revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}