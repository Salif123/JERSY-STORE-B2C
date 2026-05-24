import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

function isAdminAuthenticated(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('admin_session');
  return adminCookie?.value === process.env.ADMIN_PASSWORD;
}

// PUT to update a product by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
  }

  const { id } = params;

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
      .update({
        name,
        slug,
        description: description || '',
        price: Number(price),
        compare_at_price: compare_at_price ? Number(compare_at_price) : null,
        images: images || [],
        sizes: sizes,
        category: category,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(product);
  } catch (err: any) {
    console.error('Admin PUT product error:', err);
    return NextResponse.json({ error: err.message || 'Server error.' }, { status: 500 });
  }
}

// DELETE to remove a product by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
  }

  const { id } = params;

  const { error } = await supabaseServer
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
}
