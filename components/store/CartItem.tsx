'use client';

import React from 'react';
import Image from 'next/image';
import { CartItem as CartItemType, Size } from '@/types';
import { useCartStore } from '@/lib/cart';
import { Trash2, Plus, Minus } from 'lucide-react';
import { normalizeSizes } from '@/lib/sizes';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { product_id, name, image, size, price, quantity, product } = item;
  const { updateQuantity, removeItem } = useCartStore();

  const stockLimit = product ? (normalizeSizes(product.sizes)[size] || 0) : 10;

  const handleIncrease = () => {
    if (quantity < stockLimit) {
      updateQuantity(product_id, size, quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(product_id, size, quantity - 1);
    }
  };

  const displayImage =
    image || 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e01a?auto=format&fit=crop&w=200&q=80';

  return (
    <div className="flex gap-4 py-4 border-b border-slate-850 last:border-0 items-center">
      {/* Product Image */}
      <div className="relative h-18 w-14 flex-shrink-0 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
        <Image
          src={displayImage}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      {/* Info & Quantity controls */}
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-200 line-clamp-1">
            {name}
          </h4>
          <span className="text-sm font-extrabold text-indigo-400">
            ₹{(price * quantity).toLocaleString('en-IN')}
          </span>
        </div>
        
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Size: <span className="text-slate-300 font-bold">{size}</span>
        </p>

        {/* Action Row */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
            <button
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="px-2.5 py-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-200 select-none">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={quantity >= stockLimit}
              className="px-2.5 py-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => removeItem(product_id, size)}
            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/40 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
