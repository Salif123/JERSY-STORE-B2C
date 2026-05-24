import React from 'react';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import { ProductDetailsClient } from '@/components/store/ProductDetailsClient';
import { ProductCard } from '@/components/store/ProductCard';
import { Product } from '@/types';
import { Metadata } from 'next';

export const revalidate = 0;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Generate dynamic metadata for SEO mapping
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { data: product } = await supabaseServer
    .from('products')
    .select('name, description, is_active')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!product || !product.is_active) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} online at the best prices.`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  // Query product by slug
  const { data: dbProduct, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  if (error || !dbProduct || !dbProduct.is_active) {
    console.error('Error fetching jersey details:', error || 'Product not found or inactive');
    notFound();
  }

  const product: Product = dbProduct as Product;

  // Query related products from same category, active, excluding current product, limit 4
  const { data: relatedDbProducts } = await supabaseServer
    .from('products')
    .select('*')
    .eq('category', dbProduct.category)
    .neq('id', dbProduct.id)
    .eq('is_active', true)
    .limit(4);

  let relatedProducts: Product[] = (relatedDbProducts || []) as Product[];

  // Backfill if we have fewer than 4 related products
  if (relatedProducts.length < 4) {
    const excludeIds = [dbProduct.id, ...relatedProducts.map((p) => p.id)];
    const { data: backfillDbProducts } = await supabaseServer
      .from('products')
      .select('*')
      .eq('is_active', true)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(4 - relatedProducts.length);

    if (backfillDbProducts) {
      relatedProducts = [...relatedProducts, ...(backfillDbProducts as Product[])];
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProductDetailsClient product={product} />
      
      {/* Related Products Grid */}
      <div className="mt-20 border-t border-slate-100 dark:border-navy-900 pt-16">
        <h2 className="text-2xl sm:text-3xl font-heading text-navy-900 dark:text-white uppercase tracking-wider mb-8">
          Related jerseys
        </h2>
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProd) => (
              <ProductCard key={relatedProd.id} product={relatedProd} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-550 dark:text-slate-500 font-semibold">No related products found.</p>
        )}
      </div>
    </div>
  );
}
