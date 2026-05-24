import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminProductsTable } from '@/components/admin/AdminProductsTable';
import { Product } from '@/types';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const cookieStore = cookies();
  const adminCookie = cookieStore.get('admin_session');
  const isAuthenticated = adminCookie?.value === process.env.ADMIN_PASSWORD;

  // Protect route
  if (!isAuthenticated) {
    redirect('/admin');
  }

  // Fetch all products
  const { data: dbProducts, error } = await supabaseServer
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin products:', error);
  }

  const products: Product[] = (dbProducts as Product[]) || [];

  return (
    <div className="min-h-screen bg-slate-950 space-y-8 pb-12">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Manage Jerseys
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Add, update inventory, or delete products.
          </p>
        </div>

        <AdminProductsTable initialProducts={products} />
      </div>
    </div>
  );
}
