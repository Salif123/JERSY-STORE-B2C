import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { CartItem } from '@/types';
import { updateSizeStock } from '@/lib/sizes';


export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
    } = await req.json();

    if (!orderId || !razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Invalid parameters provided for verification.' },
        { status: 400 }
      );
    }

    // 1. Fetch the order from the database
    const { data: order, error: orderErr } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      );
    }

    // 2. Handle verification
    let isValid = false;

    // If order total was 0, no Razorpay transaction occurred
    if (order.total === 0) {
      isValid = true;
    } else {
      if (!razorpay_order_id || !razorpay_signature) {
        return NextResponse.json(
          { error: 'Razorpay parameters are missing.' },
          { status: 400 }
        );
      }
      
      isValid = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
    }

    if (!isValid) {
      // Mark order as failed
      await supabaseServer
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', orderId);

      return NextResponse.json(
        { error: 'Signature verification failed.' },
        { status: 400 }
      );
    }

    // 3. Mark the order as paid in the database
    const { error: updateOrderErr } = await supabaseServer
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id,
      })
      .eq('id', orderId);

    if (updateOrderErr) {
      console.error('Error updating order payment status:', updateOrderErr);
      return NextResponse.json(
        { error: 'Failed to update payment status.' },
        { status: 500 }
      );
    }

    // 4. Reduce product size stocks
    const orderItems = order.items as CartItem[];
    for (const item of orderItems) {
      const productId = item.product_id || item.product?.id;
      try {
        const { data: product, error: fetchErr } = await supabaseServer
          .from('products')
          .select('sizes')
          .eq('id', productId)
          .single();

        if (!fetchErr && product) {
          const updatedSizes = updateSizeStock(product.sizes, item.size, item.quantity);

          await supabaseServer
            .from('products')
            .update({ sizes: updatedSizes })
            .eq('id', productId);
        }
      } catch (stockErr) {
        console.error(`Failed to update stock for product: ${productId}`, stockErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully and stock updated.',
      orderId,
    });
  } catch (err: any) {
    console.error('Payment verify API error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error during verification.' },
      { status: 500 }
    );
  }
}
