import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

function isAdminAuthenticated(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('admin_session');
  return adminCookie?.value === process.env.ADMIN_PASSWORD;
}

// GET all products for the admin panel
export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
  }

  const { data: products, error } = await supabaseServer
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin GET products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
  }

  return NextResponse.json(products);
}

// POST to create a new product
export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
  }

  try {
    const {
      name,
      slug,
      description,
      price,
      compare_at_price,
      images,
      sizes,
      category,
    } = await req.json();

    if (!name || !slug || !price || !category || !sizes) {
      return NextResponse.json(
        { error: 'Missing required parameters (name, slug, price, sizes, or category).' },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabaseServer
      .from('products')
      .insert({
        name,
        slug,
        description: description || '',
        price: Number(price),
        compare_at_price: compare_at_price ? Number(compare_at_price) : null,
        images: images || [],
        sizes: sizes,
        category: category,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting product:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(product);
  } catch (err: any) {
    console.error('Admin POST product error:', err);
    return NextResponse.json({ error: err.message || 'Server error.' }, { status: 500 });
  }
}
