'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Size } from '@/types';
import { Badge } from '../ui/Badge';
import { normalizeSizes } from '@/lib/sizes';
import { useCartStore } from '@/lib/cart';
import { toast } from '../ui/Toast';
import { Heart, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { name, slug, price, images, category } = product;
  const { addItem } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Normalize sizes to safely read both {"S": 10} and [{"size": "S", "stock": 10}]
  const sizesStock = normalizeSizes(product.sizes);
  
  // Extract available sizes (stock > 0)
  const availableSizes = (Object.keys(sizesStock) as Size[]).filter(
    (size) => sizesStock[size] > 0
  );

  // Default size is the first available size in stock
  const defaultSize = availableSizes.length > 0 ? availableSizes[0] : null;

  // Support both compare_price and compare_at_price
  const comparePrice = (product as any).compare_price ?? (product as any).compare_at_price;
  
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  // Fallback image if none uploaded
  const displayImage =
    images && images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e01a?auto=format&fit=crop&w=400&q=80';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to products/[slug]
    e.stopPropagation();

    if (!defaultSize) {
      toast.error('This product is currently out of stock.');
      return;
    }

    addItem(product, defaultSize, 1);
    toast.success(`Quick added ${name} (${defaultSize}) to bag!`);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success(`Added ${name} to wishlist!`);
    } else {
      toast.success(`Removed ${name} from wishlist.`);
    }
  };

  return (
    <Link
      href={`/products/${slug}`}
      className="group relative flex flex-col bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-350 dark:hover:border-navy-700 transition-all duration-300 transform hover:-translate-y-1.5"
    >
      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 dark:bg-navy-900/80 backdrop-blur-md text-slate-500 hover:text-rose-500 hover:scale-110 shadow-sm transition-all duration-200"
        aria-label="Add to wishlist"
      >
        <Heart
          className={clsx(
            'h-4.5 w-4.5 transition-colors',
            isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-650 dark:text-slate-350'
          )}
        />
      </button>

      {/* Image container */}
      <div className="relative aspect-[4/5] w-full bg-slate-50 dark:bg-navy-900 overflow-hidden">
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="danger">{discount}% OFF</Badge>
          </div>
        )}
        <Image
          src={displayImage}
          alt={name}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>

      {/* Info container */}
      <div className="flex flex-col p-4 flex-grow">
        <span className="text-[9px] uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400 mb-1">
          {category}
        </span>
        <h3 className="font-bold text-navy-900 dark:text-white text-sm line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150 mb-2">
          {name}
        </h3>

        {/* Available Sizes row */}
        <div className="flex flex-wrap gap-1 mb-4">
          {availableSizes.length > 0 ? (
            availableSizes.map((size) => (
              <span
                key={size}
                className="text-[9px] font-black border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-sm"
              >
                {size}
              </span>
            ))
          ) : (
            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">
              Out of stock
            </span>
          )}
        </div>

        {/* Pricing & Quick Add */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-navy-900">
          <div className="flex flex-col">
            <span className="text-sm font-black text-navy-900 dark:text-white">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                ₹{comparePrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!defaultSize}
            className="p-2 bg-navy-900 hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-500 text-white dark:text-navy-900 dark:hover:text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 group/btn"
            title={defaultSize ? `Add default size (${defaultSize})` : 'Out of stock'}
          >
            <ShoppingBag className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
          </button>
        </div>
      </div>
    </Link>
  );
};
