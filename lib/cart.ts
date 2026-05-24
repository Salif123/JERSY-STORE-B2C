import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Size, Coupon } from '@/types';
import { validateCoupon } from './coupons';
import { normalizeSizes } from './sizes';

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  addItem: (product: Product, size: Size, quantity?: number) => void;
  removeItem: (productId: string, size: Size) => void;
  updateQuantity: (productId: string, size: Size, quantity: number) => void;
  applyCoupon: (coupon: Coupon | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, size, quantity = 1) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (item) => item.product_id === product.id && item.size === size
        );

        const sizesStock = normalizeSizes(product.sizes);
        const stockAvailable = sizesStock[size] || 0;

        if (existingItemIndex > -1) {
          const newItems = [...items];
          const currentQty = newItems[existingItemIndex].quantity;
          newItems[existingItemIndex].quantity = Math.min(
            currentQty + quantity,
            stockAvailable
          );
          set({ items: newItems });
        } else {
          const displayImage =
            product.images && product.images.length > 0
              ? product.images[0]
              : 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e01a?auto=format&fit=crop&w=400&q=80';

          const newItem: CartItem = {
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            image: displayImage,
            size,
            price: product.price,
            quantity: Math.min(quantity, stockAvailable),
            product, // For backward compatibility
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            (item) => !(item.product_id === productId && item.size === size)
          ),
        });
      },

      updateQuantity: (productId, size, quantity) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (item) => item.product_id === productId && item.size === size
        );

        if (existingItemIndex > -1) {
          const newItems = [...items];
          const item = newItems[existingItemIndex];
          const stockAvailable = item.product
            ? (normalizeSizes(item.product.sizes)[size] || 0)
            : 10; // Fallback stock limit
          newItems[existingItemIndex].quantity = Math.max(
            1,
            Math.min(quantity, stockAvailable)
          );
          set({ items: newItems });
        }
      },

      applyCoupon: (coupon) => {
        set({ coupon });
      },

      clearCart: () => {
        set({ items: [], coupon: null });
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getDiscount: () => {
        const coupon = get().coupon;
        if (!coupon) return 0;
        const subtotal = get().getSubtotal();
        const { discountAmount } = validateCoupon(coupon, subtotal);
        return discountAmount;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount);
      },
    }),
    {
      name: 'jersey-store-cart',
    }
  )
);
