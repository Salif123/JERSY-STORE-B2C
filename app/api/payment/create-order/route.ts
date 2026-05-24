import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { razorpayInstance } from '@/lib/razorpay';
import { validateCoupon } from '@/lib/coupons';
import { CartItem, Product, Size } from '@/types';
import { normalizeSizes } from '@/lib/sizes';



export async function POST(req: NextRequest) {
  try {
    const {
      items,
      couponCode,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
    } = await req.json();

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !shippingAddress
    ) {
      return NextResponse.json(
        { error: 'Required fields are missing or invalid.' },
        { status: 400 }
      );
    }

    // 1. Recalculate subtotal using DB prices to prevent tampering
    let subtotal = 0;
    const validatedItems: CartItem[] = [];

    for (const item of items) {
      const productId = item.product_id || item.product?.id;
      const itemName = item.name || item.product?.name || 'Jersey';

      const { data: dbProduct, error: fetchErr } = await supabaseServer
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (fetchErr || !dbProduct) {
        return NextResponse.json(
          { error: `Product not found: ${itemName}` },
          { status: 400 }
        );
      }

      // Check stock availability
      const normalizedProductSizes = normalizeSizes(dbProduct.sizes);
      const sizeStock = normalizedProductSizes[item.size as Size] || 0;
      if (sizeStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${dbProduct.name} (Size: ${item.size}). Available: ${sizeStock}` },
          { status: 400 }
        );
      }

      const displayImage =
        dbProduct.images && dbProduct.images.length > 0
          ? dbProduct.images[0]
          : 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e01a?auto=format&fit=crop&w=400&q=80';

      subtotal += Number(dbProduct.price) * item.quantity;
      validatedItems.push({
        product_id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        image: displayImage,
        size: item.size,
        price: Number(dbProduct.price),
        quantity: item.quantity,
        product: dbProduct as Product,
      });
    }

    // 2. Validate Coupon server-side
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const { data: dbCoupon, error: couponErr } = await supabaseServer
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .maybeSingle();

      if (!couponErr && dbCoupon) {
        const validation = validateCoupon(dbCoupon, subtotal);
        if (validation.valid) {
          discount = validation.discountAmount;
          appliedCoupon = dbCoupon;
        }
      }
    }

    const total = Math.max(0, subtotal - discount);

    // 3. Create a pending order in Supabase to get an ID
    const { data: dbOrder, error: orderCreateErr } = await supabaseServer
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        items: validatedItems,
        subtotal,
        discount,
        total,
        payment_status: 'pending',
      })
      .select('*')
      .single();

    if (orderCreateErr || !dbOrder) {
      console.error('Database error creating pending order:', orderCreateErr);
      return NextResponse.json(
        { error: 'Failed to record the order details.' },
        { status: 500 }
      );
    }

    // 4. Create order on Razorpay
    // Razorpay accepts amounts in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(total * 100);
    
    // Handle the case where total is 0 (fully discounted order)
    let razorpayOrderId = null;
    if (amountInPaise > 0) {
      try {
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: dbOrder.id,
        });
        razorpayOrderId = razorpayOrder.id;

        // Update database order with Razorpay Order ID
        const { error: updateErr } = await supabaseServer
          .from('orders')
          .update({ razorpay_order_id: razorpayOrderId })
          .eq('id', dbOrder.id);

        if (updateErr) {
          console.error('Error updating order with Razorpay ID:', updateErr);
        }
      } catch (rzpErr: any) {
        console.error('Razorpay order creation error:', rzpErr);
        return NextResponse.json(
          { error: 'Failed to initiate gateway payment.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      orderId: dbOrder.id,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'Jersey Store',
    });
  } catch (err: any) {
    console.error('Create-order API route error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error.' },
      { status: 500 }
    );
  }
}
