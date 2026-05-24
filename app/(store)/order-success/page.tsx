import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import { CartItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Check, ShoppingBag, Receipt, Home } from 'lucide-react';

export const revalidate = 0;

interface SuccessPageProps {
  searchParams: {
    id?: string;
  };
}

export default async function OrderSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const orderId = searchParams.id;

  if (!orderId) {
    notFound();
  }

  // Fetch verified order details from database
  const { data: order, error } = await supabaseServer
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error || !order) {
    console.error('Error fetching success order details:', error);
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-xl font-bold text-rose-500">Order Verification Error</h1>
        <p className="text-sm text-slate-400">
          We could not locate details for this transaction. If you were charged, please contact support.
        </p>
        <Link href="/" className="inline-block text-xs font-bold text-indigo-400 border border-slate-800 px-4 py-2 rounded-lg bg-slate-900">
          Go to Homepage
        </Link>
      </div>
    );
  }

  const items = order.items as CartItem[];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* 1. Animation & Thank you banner */}
      <div className="text-center space-y-4.5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-bounce">
          <Check className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
            Order confirmed
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Thank you, {order.customer_name}!
          </h1>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
            Your payment was verified, and your items are being prepared. A receipt has been generated.
          </p>
        </div>
      </div>

      {/* 2. Order Summary details card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Invoice Items */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-4.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-850 pb-3">
            <Receipt className="h-4 w-4 text-indigo-400" />
            Receipt Details
          </h3>

          <div className="divide-y divide-slate-850/60 max-h-80 overflow-y-auto">
            {items.map((item, idx) => {
              const name = item.name || item.product?.name || 'Jersey';
              const price = item.price || item.product?.price || 0;
              return (
                <div key={idx} className="py-3 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <p className="text-slate-200 font-bold">{name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Size: {item.size} | Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-slate-300 font-bold">
                    ₹{(price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 border-t border-slate-850 pt-4 text-xs font-bold text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-350">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-rose-450">
                <span>Discount</span>
                <span>-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-100 text-sm font-extrabold pt-2 border-t border-slate-855">
              <span>Grand Total Paid</span>
              <span className="text-indigo-400">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Meta and Shipping details */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-xs font-bold text-slate-400 space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Order Details
            </h4>
            <div className="space-y-1.5">
              <p>
                ID:{' '}
                <span className="font-mono text-[10px] text-indigo-400 select-all block">
                  {order.id}
                </span>
              </p>
              {order.razorpay_payment_id && (
                <p>
                  Payment ID:{' '}
                  <span className="font-mono text-[10px] text-slate-300 select-all block">
                    {order.razorpay_payment_id}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Shipping Card */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-2.5">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Shipping Address
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              {order.shipping_address.street},<br />
              {order.shipping_address.city}, {order.shipping_address.state} -{' '}
              {order.shipping_address.zip}
            </p>
          </div>
        </div>

      </div>

      {/* 3. Actions Row */}
      <div className="flex justify-center gap-4 border-t border-slate-900 pt-8">
        <Link href="/">
          <Button variant="secondary" className="text-xs font-bold flex items-center gap-1.5">
            <Home className="h-3.5 w-3.5" />
            Home
          </Button>
        </Link>
        <Link href="/products">
          <Button className="text-xs font-bold flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" />
            Shop More Jerseys
          </Button>
        </Link>
      </div>

    </div>
  );
}
