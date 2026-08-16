'use client';

import React, { useState } from 'react';
import { useAdmin, AdminOrder } from '@/context/AdminContext';
import type { ProductCategory } from '@furr/core';

export default function MarketplaceAdminPage() {
  const { products, addProduct, updateProductStock, toggleProductFeatured, deleteProduct, orders, updateOrderStatus } = useAdmin();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | AdminOrder['status']>('all');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'food' as ProductCategory,
    price: 3500,
    originalPrice: 4000,
    rating: 5.0,
    reviewCount: 0,
    imageUrls: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600'],
    description: '',
    features: ['High quality nutrition', 'Veterinarian approved'],
    stock: 20,
    inStock: true,
    targetSpecies: ['dog'] as ('dog' | 'cat')[],
    sellerId: 'vendor-1',
    sellerName: 'Colombo Pet Mart',
    isFeatured: false,
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.brand || !newProduct.price) return;
    addProduct(newProduct);
    setShowAddModal(false);
    setNewProduct({
      name: '',
      brand: '',
      category: 'food',
      price: 3500,
      originalPrice: 4000,
      rating: 5.0,
      reviewCount: 0,
      imageUrls: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600'],
      description: '',
      features: ['High quality nutrition', 'Veterinarian approved'],
      stock: 20,
      inStock: true,
      targetSpecies: ['dog'],
      sellerId: 'vendor-1',
      sellerName: 'Colombo Pet Mart',
      isFeatured: false,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Marketplace &amp; Fulfillment</h1>
          <p className="text-stone-500 text-sm mt-1">
            Vendor catalog administration, inventory levels, order tracking, and courier dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2 bg-stone-200/60 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'products' ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Catalog ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'orders' ? 'bg-white text-[#02202B] shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Orders ({orders.length})
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#02202B] hover:bg-[#003B46] text-white transition shadow-sm"
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex gap-4">
            <input
              type="text"
              placeholder="Search catalog by product name, brand, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-bold text-stone-500 hover:text-stone-800 px-3 py-2"
              >
                Clear
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-200">
                  <th className="p-4 font-bold">Product Details</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Seller</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold">Inventory Stock</th>
                  <th className="p-4 font-bold">Featured</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrls[0]}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-stone-400 font-medium">{item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-100 text-stone-700 uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-stone-700">{item.sellerName}</td>
                    <td className="p-4 font-black text-[#02202B]">Rs {item.price.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.stock}
                          onChange={(e) => updateProductStock(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-800"
                        />
                        <span className="text-xs text-stone-400">units</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleProductFeatured(item.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          item.isFeatured
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        {item.isFeatured ? '⭐ Featured' : 'Standard'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteProduct(item.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['all', 'placed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setOrderFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  orderFilter === filter
                    ? 'bg-[#02202B] text-white'
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-[#02202B]">{order.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Customer: <span className="font-bold text-stone-800">{order.customerName}</span> ({order.customerPhone}) · {order.city}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-[#02202B]">Rs {order.total.toLocaleString()}</p>
                    <p className="text-[11px] text-stone-400 font-medium">Paid via {order.paymentMethod}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold text-stone-400 uppercase tracking-wider text-[10px] mb-2">Order Items</p>
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-stone-50 p-2 rounded-xl border border-stone-100">
                          <span className="font-semibold text-stone-800">{item.name} × {item.quantity}</span>
                          <span className="font-bold text-stone-900">Rs {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-stone-400 uppercase tracking-wider text-[10px] mb-2">Fulfillment &amp; Courier Dispatch</p>
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 space-y-2">
                      <p className="text-stone-600">Delivery Address: <span className="font-semibold text-stone-800">{order.address}</span></p>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Tracking # (e.g. PRL-COL-9921)"
                          value={trackingInputs[order.id] !== undefined ? trackingInputs[order.id] : order.trackingNumber || ''}
                          onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                          className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs"
                        />
                        <button
                          onClick={() => updateOrderStatus(order.id, order.status, trackingInputs[order.id])}
                          className="px-3 py-1 bg-[#02202B] text-white rounded-lg font-bold text-xs"
                        >
                          Save Tracking
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold hover:bg-stone-100 text-[11px]"
                        >
                          Mark Processing
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-100 text-[11px]"
                        >
                          Out for Delivery
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100 text-[11px]"
                        >
                          Mark Delivered
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 font-bold hover:bg-red-100 text-[11px]"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h2 className="text-xl font-black text-[#02202B]">Add Marketplace Listing</h2>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Product Title</label>
                <input
                  required
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Royal Canin Maxi Adult Dry Food 15kg"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Brand</label>
                  <input
                    required
                    type="text"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="Royal Canin / Pedigree"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as ProductCategory })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  >
                    <option value="food">Food &amp; Nutrition</option>
                    <option value="medicine">Pharmacy &amp; Supplements</option>
                    <option value="accessories">Collars &amp; Accessories</option>
                    <option value="toys">Toys &amp; Enrichment</option>
                    <option value="hygiene">Grooming &amp; Hygiene</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Price (Rs)</label>
                  <input
                    required
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Original Price (Rs)</label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Initial Stock</label>
                  <input
                    required
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-600 uppercase tracking-wider block mb-1">Image URL</label>
                <input
                  required
                  type="text"
                  value={newProduct.imageUrls[0]}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrls: [e.target.value] })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#006B78]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#02202B] hover:bg-[#003B46] text-white"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
