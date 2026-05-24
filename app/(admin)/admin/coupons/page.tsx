import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import { AdminNav } from '@/components/admin/AdminNav';
import { CouponsClient } from './CouponsClient';
import { Coupon } from '@/types';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const cookieStore = cookies();
  const adminCookie = cookieStore.get('admin_session');
  const isAuthenticated = adminCookie?.value === process.env.ADMIN_PASSWORD;

  if (!isAuthenticated) {
    redirect('/admin');
  }

  // Fetch coupons from Supabase
  const { data: dbCoupons, error } = await supabaseServer
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin coupons:', error);
  }

  const coupons: Coupon[] = (dbCoupons as Coupon[]) || [];

  return (
    <div className="min-h-screen bg-slate-950 space-y-8 pb-12">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Discount Coupons
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Configure promotional percentage or fixed discounts.
          </p>
        </div>

        <CouponsClient initialCoupons={coupons} />
      </div>
    </div>
  );
}
