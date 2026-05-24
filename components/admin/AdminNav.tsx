'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { LayoutDashboard, ShoppingBag, Receipt, Tag, ArrowLeft } from 'lucide-react';

export const AdminNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Delete the admin_session cookie by setting its expiry in the past
    document.cookie = 'admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.refresh();
    router.push('/admin');
  };

  const navItems = [
    {
      name: 'Overview',
      href: '/admin',
      icon: <LayoutDashboard className="h-4 w-4" />,
      exact: true,
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: <ShoppingBag className="h-4 w-4" />,
      exact: false,
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: <Receipt className="h-4 w-4" />,
      exact: false,
    },
    {
      name: 'Coupons',
      href: '/admin/coupons',
      icon: <Tag className="h-4 w-4" />,
      exact: false,
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-850 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white font-black text-lg tracking-wider flex items-center gap-1.5">
              <span className="bg-indigo-600 px-2 py-0.5 rounded text-sm">ADMIN</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin');

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors',
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Storefront
            </Link>

            <button
              onClick={handleLogout}
              className="bg-slate-850 hover:bg-slate-800 text-rose-400 hover:text-rose-300 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs font-bold transition-all duration-150"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="md:hidden border-t border-slate-850/60 bg-slate-900 px-4 py-2 flex justify-around">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center gap-1 p-2 text-[10px] font-bold rounded-lg transition-colors',
                isActive ? 'text-indigo-400' : 'text-slate-500'
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
