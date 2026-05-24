'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

interface ProductsCatalogProps {
  initialProducts: Product[];
}

export const ProductsCatalog: React.FC<ProductsCatalogProps> = ({
  initialProducts,
}) => {
  const [products] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['All', 'Football', 'Cricket', 'Basketball', 'Retro', 'Training'];

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ? true : product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          All Jerseys
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Browse our collection of premium sports jerseys.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center bg-slate-900 border border-slate-850 p-4.5 rounded-xl">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <input
            type="text"
            placeholder="Search jerseys (e.g. Manchester, Madrid)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-850 text-slate-200 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        </div>

        {/* Category Selector */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-850 text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold appearance-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
          <Filter className="absolute left-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Sorting */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-850 text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold appearance-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          <SlidersHorizontal className="absolute left-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-slate-900 bg-slate-900/10 rounded-xl">
          <p className="text-sm text-slate-500 font-semibold">
            No jerseys found matching your filters. Try adjusting your search term.
          </p>
        </div>
      )}
    </div>
  );
};
