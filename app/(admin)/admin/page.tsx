import React from 'react';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { AdminNav } from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LayoutDashboard, IndianRupee, ShoppingBag, Receipt, Tag, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

// Client component for the login form inline helper
import { AdminLoginForm } from './AdminLoginForm';

export default async function AdminDashboardPage() {
  const cookieStore = cookies();
  const adminCookie = cookieStore.get('admin_session');
  const isAuthenticated = adminCookie?.value === process.env.ADMIN_PASSWORD;

  // 1. If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <AdminLoginForm adminPassword={process.env.ADMIN_PASSWORD || ''} />;
  }

  // 2. Fetch admin dashboard aggregates from database
  const { data: dbOrders } = await supabaseServer.from('orders').select('*');
  const { data: dbProducts } = await supabaseServer.from('products').select('*');

  const orders = dbOrders || [];
  const products = dbProducts || [];

  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrdersCount = paidOrders.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Find products with low stock (e.g. total stock across all sizes < 5)
  const lowStockProducts = products.filter((prod: any) => {
    const totalStock = Object.values(prod.sizes as Record<string, number>).reduce(
      (sum: number, qty: number) => sum + qty,
      0
    );
    return totalStock < 5;
  });

  return (
    <div className="min-h-screen bg-slate-950 space-y-8 pb-12">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Real-time analytics and inventory alerts.
          </p>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Revenue */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Total Revenue
              </span>
              <p className="text-2xl font-black text-white">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-indigo-500/10 p-3.5 rounded-xl text-indigo-400">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>

          {/* Orders */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Sales Volume
              </span>
              <p className="text-2xl font-black text-white">{totalOrdersCount} paid orders</p>
            </div>
            <div className="bg-emerald-500/10 p-3.5 rounded-xl text-emerald-400">
              <Receipt className="h-6 w-6" />
            </div>
          </div>

          {/* AOV */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Avg Order Value
              </span>
              <p className="text-2xl font-black text-white">
                ₹{aov.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-amber-500/10 p-3.5 rounded-xl text-amber-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Row: Quick Links and Low Stock alert */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Actions */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-350 border-b border-slate-850 pb-2">
              Quick Management
            </h3>
            <div className="grid grid-cols-2 gap-3.5">
              <Link href="/admin/products" className="bg-slate-950 hover:bg-slate-850 border border-slate-850/60 p-4 rounded-xl text-center space-y-1 transition-all">
                <ShoppingBag className="h-5 w-5 text-indigo-400 mx-auto" />
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Products</span>
              </Link>

              <Link href="/admin/orders" className="bg-slate-950 hover:bg-slate-850 border border-slate-850/60 p-4 rounded-xl text-center space-y-1 transition-all">
                <Receipt className="h-5 w-5 text-indigo-400 mx-auto" />
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Orders</span>
              </Link>

              <Link href="/admin/coupons" className="bg-slate-950 hover:bg-slate-850 border border-slate-850/60 p-4 rounded-xl text-center space-y-1 transition-all col-span-2">
                <Tag className="h-5 w-5 text-indigo-400 mx-auto" />
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Manage Coupons</span>
              </Link>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-350 border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Low Stock Alerts
            </h3>
            <div className="divide-y divide-slate-850/60 overflow-y-auto max-h-56 pr-1">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((prod: any) => {
                  const totalStock = Object.values(prod.sizes as Record<string, number>).reduce(
                    (sum: number, q: number) => sum + q,
                    0
                  );
                  return (
                    <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs font-semibold">
                      <div>
                        <p className="text-slate-300">{prod.name}</p>
                        <p className="text-[9px] text-slate-500 font-bold mt-0.5">Category: {prod.category}</p>
                      </div>
                      <Badge variant="warning">{totalStock} Units left</Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 font-semibold py-8 text-center">
                  All jerseys are sufficiently stocked!
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
