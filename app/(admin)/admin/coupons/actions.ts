'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase';

export async function createCouponAction(formData: {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  active: boolean;
  expires_at: string | null;
}) {
  const { code, discount_type, discount_value, min_order_amount, active, expires_at } = formData;

  if (!code || !discount_type || discount_value <= 0) {
    return { success: false, error: 'Invalid coupon inputs.' };
  }

  const { error } = await supabaseServer.from('coupons').insert({
    code: code.toUpperCase().trim(),
    discount_type,
    discount_value: Number(discount_value),
    min_order_amount: Number(min_order_amount),
    active,
    expires_at: expires_at ? new Date(expires_at).toISOString() : null,
  });

  if (error) {
    console.error('Error creating coupon action:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function deleteCouponAction(id: string) {
  const { error } = await supabaseServer.from('coupons').delete().eq('id', id);

  if (error) {
    console.error('Error deleting coupon action:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/coupons');
  return { success: true };
}
