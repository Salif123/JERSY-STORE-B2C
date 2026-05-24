'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/lib/cart';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { ShoppingBag, Lock } from 'lucide-react';

// Form validation schema
const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Full name is required'),
  customerEmail: z.string().email('Enter a valid email address'),
  customerPhone: z
    .string()
    .min(10, 'Enter a valid 10-digit phone number')
    .max(10, 'Enter a valid 10-digit phone number')
    .regex(/^[0-9]+$/, 'Phone number must contain only numbers'),
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z
    .string()
    .min(6, 'Enter a valid 6-digit postal code')
    .max(6, 'Enter a valid 6-digit postal code')
    .regex(/^[0-9]+$/, 'PIN code must contain only numbers'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, coupon, getSubtotal, getDiscount, getTotal, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  // Redirect to cart if empty
  useEffect(() => {
    if (isMounted && items.length === 0) {
      toast.info('Your cart is empty. Add jerseys before checking out.');
      router.push('/cart');
    }
  }, [isMounted, items, router]);

  if (!isMounted || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Load Razorpay script dynamically
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true);
    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay payment SDK. Check your internet connection.');
        setIsProcessing(false);
        return;
      }

      // 2. Call create-order API
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          couponCode: coupon?.code,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          shippingAddress: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
          },
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        toast.error(responseData.error || 'Failed to initialize payment.');
        setIsProcessing(false);
        return;
      }

      const { orderId, razorpayOrderId, amount, currency, keyId, storeName } = responseData;

      // 3. Handle zero cost orders (fully discounted)
      if (amount === 0) {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            razorpay_payment_id: 'FREE_ORDER_' + Math.random().toString(36).substring(2, 9),
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          clearCart();
          router.push(`/order-success?id=${orderId}`);
        } else {
          toast.error(verifyData.error || 'Verification of promo order failed.');
        }
        setIsProcessing(false);
        return;
      }

      // 4. Initialize Razorpay popup
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: storeName,
        description: 'Jersey Store Purchase',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          // Trigger verification route on payment success
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              clearCart();
              router.push(`/order-success?id=${orderId}`);
            } else {
              toast.error(verifyData.error || 'Signature verification failed.');
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toast.error('Connection error verifying signature.');
          }
        },
        prefill: {
          name: data.customerName,
          email: data.customerEmail,
          contact: data.customerPhone,
        },
        theme: {
          color: '#4f46e5', // Brand Indigo
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment window closed.');
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-8">
        Secure Checkout
      </h1>

      <form onSubmit={handleSubmit(handleCheckoutSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Details */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-3">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.customerName?.message}
                {...register('customerName')}
              />
              <Input
                label="Phone Number"
                placeholder="9876543210"
                error={errors.customerPhone?.message}
                {...register('customerPhone')}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Email Address"
                  placeholder="john@example.com"
                  error={errors.customerEmail?.message}
                  {...register('customerEmail')}
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-3">
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <Input
                  label="Street Address"
                  placeholder="Flat No, House Name, Street Name"
                  error={errors.street?.message}
                  {...register('street')}
                />
              </div>
              <Input
                label="City"
                placeholder="Mumbai"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="State"
                placeholder="Maharashtra"
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                label="PIN Code"
                placeholder="400001"
                error={errors.zip?.message}
                {...register('zip')}
              />
            </div>
          </div>

        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-3">
            Checkout Summary
          </h2>

          {/* Items review list */}
          <div className="divide-y divide-slate-850/60 max-h-48 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-semibold">
                <div className="min-w-0 pr-4">
                  <p className="text-slate-300 truncate font-bold">{item.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                    Size: {item.size} | Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-slate-400 font-bold flex-shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-850 pt-4 text-xs font-bold text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
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
              <span>Total Payable</span>
              <span className="text-indigo-400 text-base">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-xs font-extrabold flex items-center justify-center gap-1.5 mt-2"
            isLoading={isProcessing}
          >
            <Lock className="h-3.5 w-3.5" />
            Pay & Confirm Order
          </Button>
        </div>

      </form>
    </div>
  );
}
