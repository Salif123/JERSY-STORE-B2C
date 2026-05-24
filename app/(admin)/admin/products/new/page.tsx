import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function AdminNewProductPage() {
  const cookieStore = cookies();
  const adminCookie = cookieStore.get('admin_session');
  const isAuthenticated = adminCookie?.value === process.env.ADMIN_PASSWORD;

  if (!isAuthenticated) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-slate-950 space-y-8 pb-12">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Add New Jersey
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Configure metadata, upload pictures, and define stock levels.
          </p>
        </div>

        <div className="max-w-4xl">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}
