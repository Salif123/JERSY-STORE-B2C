import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseServer } from '@/lib/supabase';
import { ProductCard } from '@/components/store/ProductCard';
import { HomeInteractive } from '@/components/store/HomeInteractive';
import { Product } from '@/types';
import { Truck, RotateCcw, CreditCard, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { clsx } from 'clsx';

// Always fetch fresh products on load
export const revalidate = 0;

interface HomePageProps {
  searchParams: {
    category?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const activeCategory = searchParams.category || 'all';

  // 1. Fetch featured products based on category search param
  let dbQuery = supabaseServer
    .from('products')
    .select('*')
    .eq('is_active', true);

  if (activeCategory !== 'all') {
    dbQuery = dbQuery.eq('category', activeCategory.toLowerCase());
  }

  // Get the 4 latest active products
  const { data: dbProducts } = await dbQuery
    .order('created_at', { ascending: false })
    .limit(4);

  const featuredProducts: Product[] = (dbProducts as Product[]) || [];

  const categories = [
    { name: 'All', id: 'all' },
    { name: 'Football', id: 'football' },
    { name: 'Cricket', id: 'cricket' },
    { name: 'Basketball', id: 'basketball' },
  ];

  return (
    <div className="space-y-16 pb-20 bg-background transition-colors duration-300">
      
      {/* 1. Immersive Hero Section */}
      <section className="relative bg-slate-900 dark:bg-navy-950 text-white min-h-[550px] sm:min-h-[600px] flex items-center overflow-hidden transition-colors duration-300">
        {/* Background Visual Graphics */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" />
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-3xl -z-0 animate-pulse" />
        
        {/* Immersive background image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=80"
            alt="Premium sports background"
            fill
            priority
            className="object-cover object-center opacity-40 select-none scale-102 transition-transform duration-1000"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-20 w-full">
          <div className="max-w-2xl space-y-6 text-left">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 dark:text-blue-300 font-extrabold text-[10px] sm:text-xs uppercase tracking-widest rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
              Next-Gen Sportswear
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-heading tracking-tight leading-none text-white uppercase">
              WEAR YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">
                PASSION.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-350 leading-relaxed max-w-lg font-medium">
              Premium jerseys. Delivered to your door. Engineered with double-knit dri-fit technology for ultimate comfort on and off the pitch.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/products"
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-8 py-4 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 uppercase tracking-widest"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products?category=football"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-xs px-8 py-4 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
              >
                Explore Football
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Statements / Trust Badges Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-900 p-6 sm:p-8 rounded-2xl shadow-sm transition-colors duration-300">
          
          <div className="flex gap-3.5 items-start">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-600 dark:text-blue-450 flex-shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-navy-900 dark:text-white uppercase tracking-wider">Free Shipping</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Above ₹999 across India</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-600 dark:text-blue-450 flex-shrink-0">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-navy-900 dark:text-white uppercase tracking-wider">Easy Returns</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Hassle-free 7-day policy</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-600 dark:text-blue-450 flex-shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-navy-900 dark:text-white uppercase tracking-wider">Secure Payments</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">UPI, Cards, & Netbanking</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-600 dark:text-blue-450 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-navy-900 dark:text-white uppercase tracking-wider">COD Available</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Pay on delivery option</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Featured Jerseys Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header and Category Pills Row */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-100 dark:border-navy-900 pb-6 transition-colors duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
              TRENDING NOW
            </span>
            <h2 className="text-3xl font-black font-heading tracking-wide text-navy-900 dark:text-white uppercase">
              Featured Jerseys
            </h2>
          </div>

          {/* Categories Navigation Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/?category=${cat.id}`}
                  scroll={false}
                  className={clsx(
                    'px-5 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200',
                    isActive
                      ? 'bg-navy-900 text-white dark:bg-white dark:text-navy-900 shadow-md'
                      : 'bg-slate-100 dark:bg-navy-900 text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800'
                  )}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-slate-200 dark:border-navy-900 rounded-2xl bg-slate-50/50 dark:bg-navy-950/20">
            <p className="text-sm text-slate-500 dark:text-slate-450 font-semibold">
              No products found in this category. Update inventory in the admin dashboard.
            </p>
            <Link
              href="/admin/products/new"
              className="mt-4 inline-flex text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-blue-500/20 dark:border-blue-500/10 px-4 py-2 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-all"
            >
              Go to Admin Creation
            </Link>
          </div>
        )}

        {/* View All Button CTA */}
        {featuredProducts.length > 0 && (
          <div className="text-center pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border border-slate-200 hover:border-navy-900 dark:border-navy-800 dark:hover:border-slate-300 text-navy-900 dark:text-white bg-transparent hover:bg-slate-50 dark:hover:bg-navy-900 font-extrabold text-xs px-8 py-3.5 rounded-xl transition-all uppercase tracking-wider"
            >
              View Full Catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* 4. Client-side Interactive Metrics and Testimonials */}
      <HomeInteractive />

    </div>
  );
}
