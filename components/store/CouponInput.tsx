'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/lib/cart';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { Tag, X } from 'lucide-react';

export const CouponInput: React.FC = () => {
  const { coupon, applyCoupon, getSubtotal } = useCartStore();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          subtotal: getSubtotal(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to apply coupon.');
      } else {
        applyCoupon(data.coupon);
        toast.success(`Coupon "${data.coupon.code}" applied successfully!`);
        setCode('');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    applyCoupon(null);
    toast.info('Coupon removed.');
  };

  if (coupon) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-emerald-400" />
          <div className="text-xs">
            <span className="font-extrabold text-emerald-400 mr-1.5">{coupon.code}</span>
            <span className="text-slate-400">
              ({coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} off)
            </span>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-slate-500 hover:text-slate-300 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex gap-2">
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Promo Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isLoading}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold uppercase"
        />
        <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
      </div>
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        isLoading={isLoading}
        disabled={!code.trim()}
      >
        Apply
      </Button>
    </form>
  );
};
