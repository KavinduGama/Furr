"use client";

import React, { useState } from "react";
import { INITIAL_PRODUCTS } from "@furr/firebase";
import type { Product } from "@furr/core";

export default function MarketplaceAdminPage() {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Marketplace & Orders</h1>
          <p className="text-stone-500 mt-1">Manage vendor listings, inventory stock and customer shipments.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === "products"
                ? "bg-[#02202B] text-white"
                : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === "orders"
                ? "bg-[#02202B] text-white"
                : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            Live Orders (3)
          </button>
        </div>
      </div>

      {activeTab === "products" ? (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
            <h3 className="font-bold text-[#02202B]">Vendor Product Catalog</h3>
            <span className="text-xs text-stone-500 font-medium">All items synced across mobile app</span>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrls[0]}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                      />
                      <div>
                        <p className="font-bold text-stone-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-stone-400 font-medium">{item.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 uppercase text-xs font-bold text-stone-500">{item.category}</td>
                  <td className="p-4 text-stone-700 font-medium">{item.sellerName}</td>
                  <td className="p-4 font-black text-stone-900">Rs {item.price.toLocaleString()}</td>
                  <td className="p-4 font-bold text-stone-700">{item.stock} units</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-[#02202B] mb-2">Recent Customer Orders</h3>
          <div className="divide-y divide-stone-100">
            {[
              { id: "ORD-9421", customer: "Amara Perera", total: 11900, items: 2, status: "Out for Delivery", city: "Colombo 07" },
              { id: "ORD-9420", customer: "Kasun Silva", total: 4800, items: 1, status: "Processing", city: "Kandy" },
              { id: "ORD-9419", customer: "Dilani Fernando", total: 8500, items: 1, status: "Delivered", city: "Gampaha" },
            ].map((order) => (
              <div key={order.id} className="py-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-900">{order.id}</span>
                    <span className="text-xs font-medium text-stone-400">· {order.customer} ({order.city})</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{order.items} item(s) · Paid via Cash on Delivery</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#02202B]">Rs {order.total.toLocaleString()}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
