import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing order ID query parameter.' },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching order:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve order details.' },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Order GET API error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error.' },
      { status: 500 }
    );
  }
}
