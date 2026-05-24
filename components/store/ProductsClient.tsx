'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { motion, Variants } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, ShoppingBag, X } from 'lucide-react';
import { clsx } from 'clsx';

interface ProductsClientProps {
  products: Product[];
  currentCategory: string;
  currentSort: string;
  currentSearch: string;
}

export const ProductsClient: React.FC<ProductsClientProps> = ({
  products,
  currentCategory,
  currentSort,
  currentSearch,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(currentSearch);

  // Debounce search term to prevent excessive server requests on keystrokes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sync URL when debounced search, category, or sort changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    
    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [debouncedSearch]);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat.toLowerCase() === 'all') {
      params.delete('category');
    } else {
      params.set('category', cat.toLowerCase());
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (sortVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sortVal);
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearchTerm('');
    router.push('/products');
  };

  const categories = [
    { name: 'All', id: 'all' },
    { name: 'Football', id: 'football' },
    { name: 'Cricket', id: 'cricket' },
    { name: 'Basketball', id: 'basketball' },
  ];

  // Framer Motion staggered grid variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-100 dark:border-navy-900 pb-6 transition-colors duration-300">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-wide text-navy-900 dark:text-white uppercase">
            All Jerseys
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 font-semibold mt-0.5">
            Browse our full catalog of premium club and international jerseys.
          </p>
        </div>
        
        {/* Active Filters Display */}
        {(currentSearch || currentCategory !== 'all') && (
          <button
            onClick={clearFilters}
            className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-650 dark:text-slate-350 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-colors"
          >
            Clear Filters
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-900 p-4 rounded-2xl shadow-sm transition-colors duration-300">
        
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <input
            type="text"
            placeholder="Search jerseys (e.g. United, Madrid)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white rounded-xl placeholder-slate-450 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-xs font-bold uppercase tracking-wider transition-colors duration-150"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-450 dark:text-slate-500" />
        </div>

        {/* Category Pills (rendered as select for small devices, pill buttons for larger) */}
        <div className="relative">
          <select
            value={currentCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-xs font-bold uppercase tracking-wider appearance-none transition-colors duration-150"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                Category: {cat.name}
              </option>
            ))}
          </select>
          <Filter className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-450 dark:text-slate-500 pointer-events-none" />
        </div>

        {/* Sorting Dropdown */}
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-xs font-bold uppercase tracking-wider appearance-none transition-colors duration-150"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          <SlidersHorizontal className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-450 dark:text-slate-500 pointer-events-none" />
        </div>

      </div>

      {/* Products Catalog Display Grid */}
      {products.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-24 border border-dashed border-slate-200 dark:border-navy-900 bg-slate-50/50 dark:bg-navy-950/20 rounded-2xl flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
          <div className="bg-slate-100 dark:bg-navy-900 p-4 rounded-full text-slate-400 dark:text-slate-650">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider">No jerseys found</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 leading-normal">
              We couldn't find any items matching your selected filters. Try searching for other terms or resetting filters.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="inline-flex bg-navy-900 hover:bg-navy-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy-900 text-xs font-extrabold px-6 py-3 rounded-lg transition-colors uppercase tracking-wider"
          >
            View All Jerseys
          </button>
        </div>
      )}
    </div>
  );
};
