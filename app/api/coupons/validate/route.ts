import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { validateCoupon } from '@/lib/coupons';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json(
        { error: 'Missing code or subtotal parameter.' },
        { status: 400 }
      );
    }

    // Query coupon from database
    const { data: coupon, error } = await supabaseServer
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .maybeSingle();

    if (error) {
      console.error('Database error validating coupon:', error);
      return NextResponse.json(
        { error: 'Internal database error.' },
        { status: 500 }
      );
    }

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon code not found.' },
        { status: 404 }
      );
    }

    const validation = validateCoupon(coupon, subtotal);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon,
      discountAmount: validation.discountAmount,
    });
  } catch (err: any) {
    console.error('Coupon validation handler error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error.' },
      { status: 500 }
    );
  }
}
