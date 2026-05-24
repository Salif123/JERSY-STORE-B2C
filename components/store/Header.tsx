'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart';
import { normalizeSizes } from '@/lib/sizes';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ShieldAlert,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Plus,
  Minus,
  Trash2,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartQuantity = items.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'All Jerseys', href: '/products' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isAdminRoute = pathname.startsWith('/admin');
  if (isAdminRoute) return null;

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-40 w-full transition-all duration-300 border-b',
          isScrolled
            ? 'glass border-slate-200/80 dark:border-navy-800/80 shadow-sm'
            : 'bg-white dark:bg-navy-950 border-slate-100 dark:border-navy-900'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="font-heading text-3xl tracking-wider text-navy-900 dark:text-white uppercase">
                {process.env.NEXT_PUBLIC_STORE_NAME || 'JERSEY STORE'}
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        'text-[11px] font-extrabold uppercase tracking-widest transition-colors duration-150',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white'
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-slate-650 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800/50 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-slate-650 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800/50 transition-colors"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}

              {/* Admin Portal Shortcut */}
              <Link
                href="/admin"
                className="text-slate-650 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800/50 transition-colors"
                title="Admin Dashboard"
              >
                <ShieldAlert className="h-5 w-5" />
              </Link>

              {/* Cart Drawer Toggle */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-650 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800/50 transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartQuantity > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-600 dark:bg-blue-500 text-white font-extrabold text-[9px] h-5 w-5 rounded-full flex items-center justify-center border border-white dark:border-navy-950 animate-pulse">
                    {cartQuantity}
                  </span>
                )}
              </button>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-650 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-navy-800/50"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 dark:bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
              aria-label="Close search"
            >
              <X className="h-6 w-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="SEARCH FOR JERSEYS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-b-2 border-white/30 text-white placeholder-white/40 focus:border-white focus:outline-none py-4 text-2xl font-bold tracking-wider uppercase pl-2 pr-12"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white hover:text-blue-400 transition-colors"
                >
                  <Search className="h-6 w-6" />
                </button>
              </form>
              <p className="text-xs text-white/50 uppercase tracking-widest mt-3 font-semibold text-center">
                Press Enter to search the catalog
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART DRAWER SIDEBAR */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-navy-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-navy-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-navy-900 flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-heading text-2xl tracking-wider text-navy-900 dark:text-white uppercase">Your Bag</h2>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">({cartQuantity} items)</span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-navy-900 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-grow overflow-y-auto p-6 divide-y divide-slate-100 dark:divide-navy-900">
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const displayImage = item.image || 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e01a?auto=format&fit=crop&w=200&q=80';
                    const stockLimit = item.product ? (normalizeSizes(item.product.sizes)[item.size] || 0) : 10;

                    return (
                      <div key={`${item.product_id}-${item.size}`} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                        <div className="relative h-20 w-16 bg-slate-50 dark:bg-navy-900 rounded-lg overflow-hidden border border-slate-150 dark:border-navy-850 flex-shrink-0">
                          <Image src={displayImage} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xs font-bold text-navy-900 dark:text-white truncate pr-2">
                              {item.name}
                            </h3>
                            <span className="text-xs font-black text-navy-900 dark:text-white">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-0.5">
                            Size: {item.size}
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-md">
                              <button
                                onClick={() => item.quantity > 1 && updateQuantity(item.product_id, item.size, item.quantity - 1)}
                                className="px-2 py-1 text-slate-500 hover:text-black dark:hover:text-white transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 text-xs font-extrabold text-navy-900 dark:text-white">{item.quantity}</span>
                              <button
                                onClick={() => item.quantity < stockLimit && updateQuantity(item.product_id, item.size, item.quantity + 1)}
                                className="px-2 py-1 text-slate-500 hover:text-black dark:hover:text-white transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.product_id, item.size)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded-full transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-slate-50 dark:bg-navy-900 p-4 rounded-full text-slate-400 dark:text-slate-650">
                      <ShoppingBag className="h-10 w-10" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider">Your bag is empty</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                        Add jerseys from the catalog to get started.
                      </p>
                    </div>
                    <Link
                      href="/products"
                      onClick={() => setIsCartOpen(false)}
                      className="inline-flex bg-navy-900 hover:bg-navy-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy-900 text-xs font-extrabold px-6 py-3 rounded-lg transition-colors uppercase tracking-wider"
                    >
                      Shop Now
                    </Link>
                  </div>
                )}
              </div>

              {/* Summary and CTAs */}
              {items.length > 0 && (
                <div className="border-t border-slate-100 dark:border-navy-900 p-6 space-y-4 bg-slate-50/50 dark:bg-navy-900/30">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subtotal</span>
                    <span className="text-lg font-black text-navy-900 dark:text-white">
                      ₹{getSubtotal().toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-normal">
                    Shipping is calculated at checkout. Free shipping above ₹999 on all domestic orders.
                  </p>
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <Link
                      href="/checkout"
                      onClick={() => setIsCartOpen(false)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider shadow-md hover:shadow-blue-500/20"
                    >
                      Checkout Securely
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setIsCartOpen(false)}
                      className="border border-slate-200 hover:border-navy-900 dark:border-navy-800 dark:hover:border-slate-300 text-navy-900 dark:text-white hover:bg-slate-50 dark:hover:bg-navy-900 font-extrabold text-xs py-3.5 rounded-lg text-center transition-colors uppercase tracking-wider"
                    >
                      View Cart Details
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/30 dark:bg-black/55 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 w-3/4 max-w-xs bg-white dark:bg-navy-950 z-40 border-r border-slate-200 dark:border-navy-900 flex flex-col p-6 pt-24 md:hidden"
            >
              <div className="flex flex-col gap-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={clsx(
                        'text-sm font-black uppercase tracking-wider py-2.5 border-b border-slate-100 dark:border-navy-900',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-navy-900 dark:text-white'
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-black uppercase tracking-wider py-2.5 text-slate-500 dark:text-slate-400"
                >
                  Admin Portal
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
