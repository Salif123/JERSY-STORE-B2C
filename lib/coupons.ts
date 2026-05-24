import { Coupon } from '@/types';

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  discountAmount: number;
}

export function validateCoupon(
  coupon: Coupon,
  subtotal: number
): CouponValidationResult {
  if (!coupon.active) {
    return { valid: false, error: 'Coupon is inactive', discountAmount: 0 };
  }

  if (coupon.expires_at) {
    const expiry = new Date(coupon.expires_at);
    if (expiry < new Date()) {
      return { valid: false, error: 'Coupon has expired', discountAmount: 0 };
    }
  }

  if (subtotal < coupon.min_order_amount) {
    return {
      valid: false,
      error: `Minimum purchase of ₹${coupon.min_order_amount} required to use this coupon`,
      discountAmount: 0,
    };
  }

  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
  } else if (coupon.discount_type === 'fixed') {
    discountAmount = coupon.discount_value;
  }

  // Discount cannot exceed the subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  return {
    valid: true,
    discountAmount,
  };
}
