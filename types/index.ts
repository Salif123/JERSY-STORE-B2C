export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  sizes: Record<Size, number>; // Maps size to stock quantity
  category: string;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  slug: string;
  image: string;
  size: Size;
  price: number;
  quantity: number;
  product?: Product; // for backward compatibility
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}
