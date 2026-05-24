'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart';
import { CartItem } from '@/components/store/CartItem';
import { CouponInput } from '@/components/store/CouponInput';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function CartPage() {
  const { items, getSubtotal, getDiscount, getTotal } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-8">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 border border-slate-900 bg-slate-900/10 rounded-2xl max-w-xl mx-auto space-y-5">
          <div className="bg-slate-950 p-4 rounded-full w-fit mx-auto border border-slate-800">
            <ShoppingBag className="h-8 w-8 text-slate-500" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-350 text-base">Your cart is currently empty</h3>
            <p className="text-xs text-slate-650 font-semibold">Browse our catalog and pick your favorite jerseys!</p>
          </div>
          <Link
            href="/products"
            className="inline-flex bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-3 rounded-lg transition-colors active:scale-95"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-1">
            <h2 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4">
              Items ({items.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
            <div className="divide-y divide-slate-850">
              {items.map((item, idx) => (
                <CartItem key={`${item.product_id}-${item.size}`} item={item} />
              ))}
            </div>
          </div>

          {/* Checkout Summary panel */}
          <div className="space-y-6">
            
            {/* Promo coupon inputs */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Promo Code
              </h3>
              <CouponInput />
            </div>

            {/* Calculations and Actions */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs font-bold text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-extrabold uppercase text-[10px]">Free</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-100 pt-3 border-t border-slate-850">
                  <span>Grand Total</span>
                  <span className="text-indigo-400 text-base">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link href="/checkout" className="block pt-2">
                <Button className="w-full h-11 text-xs font-extrabold flex items-center justify-center gap-1.5">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              {/* Guarantees info */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-extrabold uppercase pt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Secure Payments with Razorpay</span>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
