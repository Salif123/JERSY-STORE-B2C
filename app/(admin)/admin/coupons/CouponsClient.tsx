'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coupon } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { createCouponAction, deleteCouponAction } from './actions';
import { format } from 'date-fns';
import { Tag, Trash2, Calendar, Percent, Landmark } from 'lucide-react';

interface CouponsClientProps {
  initialCoupons: Coupon[];
}

export const CouponsClient: React.FC<CouponsClientProps> = ({
  initialCoupons,
}) => {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [expiry, setExpiry] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue <= 0) {
      toast.error('Please enter a valid coupon code and discount value.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCouponAction({
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: discountValue,
        min_order_amount: minOrder,
        active,
        expires_at: expiry || null,
      });

      if (!res.success) {
        toast.error(res.error || 'Failed to create coupon.');
      } else {
        toast.success(`Coupon "${code.toUpperCase()}" created successfully.`);
        // Reset form fields
        setCode('');
        setDiscountValue(0);
        setMinOrder(0);
        setExpiry('');
        
        // Refresh page to load updated coupons list
        router.refresh();
        // Just add to local array for instant response
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error creating coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, promoCode: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${promoCode}"?`)) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await deleteCouponAction(id);
      if (!res.success) {
        toast.error(res.error || 'Failed to delete coupon.');
      } else {
        toast.success(`Coupon "${promoCode}" deleted.`);
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error deleting coupon.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* 1. Coupon Form */}
      <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4 h-fit">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
          Create Promo Coupon
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Coupon Code"
            placeholder="e.g. FLAT20, JERSEY100"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="uppercase"
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-350 mb-1.5">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value as any);
                  setDiscountValue(0);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed INR (₹)</option>
              </select>
            </div>

            <Input
              label={discountType === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
              type="number"
              placeholder={discountType === 'percentage' ? '15' : '150'}
              value={discountValue || ''}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              disabled={isSubmitting}
            />
          </div>

          <Input
            label="Min Purchase Amount (₹)"
            type="number"
            placeholder="0"
            value={minOrder || ''}
            onChange={(e) => setMinOrder(Number(e.target.value))}
            disabled={isSubmitting}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-350 mb-1.5">
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 bg-slate-950 border-slate-800 rounded text-indigo-650 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <label htmlFor="active" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
              Coupon is Active
            </label>
          </div>

          <Button type="submit" className="w-full h-11 text-xs font-extrabold" isLoading={isSubmitting}>
            Generate Coupon
          </Button>
        </form>
      </div>

      {/* 2. Coupon Table */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
          Promotional Coupons
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-350">
            <thead className="bg-slate-950/60 border-b border-slate-850 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Value</th>
                <th className="p-4">Min Spend</th>
                <th className="p-4">Status</th>
                <th className="p-4">Expires</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 font-semibold text-xs">
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-850/20 transition-colors">
                    <td className="p-4 font-mono font-extrabold text-indigo-400 select-all">
                      {coupon.code}
                    </td>
                    <td className="p-4 text-slate-200">
                      {coupon.discount_type === 'percentage' ? (
                        <span className="flex items-center gap-1">
                          <Percent className="h-3.5 w-3.5 text-slate-500" />
                          {coupon.discount_value}% Off
                        </span>
                      ) : (
                        <span>₹{coupon.discount_value.toLocaleString('en-IN')} Off</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">
                      ₹{coupon.min_order_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      {coupon.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Disabled</Badge>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 font-medium">
                      {coupon.expires_at ? (
                        format(new Date(coupon.expires_at), 'dd MMM yyyy')
                      ) : (
                        <span className="text-slate-600 font-extrabold">Never</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        isLoading={isDeletingId === coupon.id}
                        className="h-8 w-8 p-0 text-rose-400 hover:bg-slate-800"
                        title="Delete Coupon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No promo codes generated.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
