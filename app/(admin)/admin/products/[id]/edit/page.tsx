import React from 'react';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import { AdminNav } from '@/components/admin/AdminNav';
import { ProductForm } from '@/components/admin/ProductForm';
import { Product } from '@/types';

export const revalidate = 0;

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function AdminEditProductPage({
  params,
}: EditProductPageProps) {
  const cookieStore = cookies();
  const adminCookie = cookieStore.get('admin_session');
  const isAuthenticated = adminCookie?.value === process.env.ADMIN_PASSWORD;

  if (!isAuthenticated) {
    redirect('/admin');
  }

  // Fetch product from Supabase by ID
  const { data: dbProduct, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !dbProduct) {
    console.error('Error fetching admin edit product:', error);
    notFound();
  }

  const product: Product = dbProduct as Product;

  return (
    <div className="min-h-screen bg-slate-950 space-y-8 pb-12">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Edit Jersey details
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Modify product copy, adjust pricing, or update size inventory.
          </p>
        </div>

        <div className="max-w-4xl">
          <ProductForm initialProduct={product} />
        </div>
      </div>
    </div>
  );
}
