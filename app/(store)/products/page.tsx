import React from 'react';
import { supabaseServer } from '@/lib/supabase';
import { ProductsClient } from '@/components/store/ProductsClient';
import { Product } from '@/types';

// Force dynamic rendering to prevent Next.js caching older stock data
export const revalidate = 0;

export const metadata = {
  title: 'All Jerseys - Live Catalog',
  description: 'Browse our full catalog of premium club and international football, cricket, and basketball jerseys.',
};

interface ProductsPageProps {
  searchParams: {
    category?: string;
    sort?: string;
    search?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const categoryParam = searchParams.category || 'all';
  const sortParam = searchParams.sort || 'newest';
  const searchParam = searchParams.search || '';

  // 1. Fetch active products from Supabase
  let dbQuery = supabaseServer
    .from('products')
    .select('*')
    .eq('is_active', true);

  // Apply category filtering
  if (categoryParam !== 'all') {
    dbQuery = dbQuery.eq('category', categoryParam.toLowerCase());
  }

  // Apply search query filter if set
  if (searchParam) {
    dbQuery = dbQuery.ilike('name', `%${searchParam}%`);
  }

  // Apply sorting order
  if (sortParam === 'price-low') {
    dbQuery = dbQuery.order('price', { ascending: true });
  } else if (sortParam === 'price-high') {
    dbQuery = dbQuery.order('price', { ascending: false });
  } else {
    // Default: Sort by newest
    dbQuery = dbQuery.order('created_at', { ascending: false });
  }

  const { data: dbProducts, error } = await dbQuery;

  if (error) {
    console.error('Error fetching catalog products from Supabase:', error);
  }

  const products: Product[] = (dbProducts as Product[]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-background transition-colors duration-300">
      <ProductsClient
        products={products}
        currentCategory={categoryParam}
        currentSort={sortParam}
        currentSearch={searchParam}
      />
    </div>
  );
}
