# B2C Jersey Store MVP - Cumulative Documentation (Prompt 3)

This documentation tracks the features, database architectures, styling guidelines, and animations built across **Prompt 1**, **Prompt 2**, and **Prompt 3** for this premium B2C sports jersey e-commerce store.

---

## Tech Stack Summary
* **Frontend Framework**: Next.js 14 (App Router, Server & Client Components)
* **Design & Styling**: Tailwind CSS, next-themes (Light & Dark Theme toggles)
* **Animations**: Framer Motion (page transitions, drawers, overlays, staggered grids)
* **State Management**: Zustand with local persistence (Cart & Bag management)
* **Backend Database**: Supabase PostgreSQL with custom RLS & performance indexes
* **Payments Gateway**: Razorpay Checkout SDK (INR payments)
* **Media Optimization**: Cloudinary unsigned upload preset (admin panel) + optimized Next.js `Image` loaders

---

## Feature Roadmap & Deliverables Completed

### Phase 1: Core Scaffolding (Prompt 1)
* **Core Store Layout**: Implemented root layout, navigation header, global footer, and custom Toast notification system.
* **Storefront Routing**:
  * Homepage (`/`): Implemented hero sections, value badges, and featured jersey grid.
  * Products listing (`/products`): Developed grid catalog of products.
  * Details page (`/products/[slug]`): Displayed image galleries, active size stock listings, and cart controls.
  * Cart details (`/cart`): Created items summary, quantity managers, and coupon calculators.
  * Checkout (`/checkout`): Created shipping address collection, Razorpay script load, and payment initiation.
  * Success invoice (`/order-success`): Showed post-payment invoice details and gateways confirmation.
* **Admin Portal Gate**: Custom passcode lock at `/admin` displaying metrics, inventory counts, new products form, order processing details, and active promo coupon creator.
* **Integration API Endpoints**:
  * `/api/payment/create-order`: Formulated secure totals calculation, validated stock, registered orders on Razorpay.
  * `/api/payment/verify`: Performed signature verification, reduced inventory stock quantities, updated statuses.
  * `/api/admin/products` & `/api/admin/products/[id]`: Handled safe CRUD actions.
  * `/api/coupons/validate`: Evaluated coupon codes.

### Phase 2: Schema Evolution & Performance (Prompt 2)
* **UUID generation**: Switched ID generation in SQL to native `gen_random_uuid()` (pgcrypto).
* **Price precision**: Cast pricing fields to `numeric(10,2)` to safeguard decimal values.
* **Database column rename**: Adjusted `compare_at_price` to `compare_price` inside database schema.
* **Tags mapping**: Added `tags text[]` arrays for search efficiency.
* **Human-readable order sequence**: Configured sequence generator starting orders at `JRS-1001`.
* **RLS Policies**: Restructured Row-Level Security restricting order/coupon reads to the service role, while allowing public read access to products.
* **Database modification triggers**: Added `updated_at` timestamps auto-triggers for tracking record modifications.

### Phase 3: Premium Sportswear Brand Redesign (Prompt 3)
* **Aesthetic Refactor**: Styled a high-end, clean sportswear brand aesthetic (inspired by Nike / Adidas / JD Sports / Culture Circle):
  * **Light mode**: Pure white backgrounds (`#ffffff`), dark navy text/accents (`#0f172a`), soft gray borders (`#e5e7eb`).
  * **Dark mode**: Sleek deep navy background (`#090d16`), white text, and rich navy cards (`#0f172a`).
  * **Typography**: Clean heading system using `Bebas Neue` uppercase layouts with tight tracking, and `Inter` for general body texts.
* **Interactive Navigation & Layout**:
  * Glassmorphism sticky header that adds blur and shadow effects on scroll.
  * Full-screen Search Overlay modal with Framer Motion entry animations.
  * Cart Sidebar Drawer sliding in from the right to update quantities, remove items, display subtotals, and link to checkout securely.
  * Responsive Mobile Drawer menu for small viewports.
* **Sportswear Product Card (`ProductCard.tsx`)**:
  * Large image focus with scale hover zoom.
  * Hover-sensitive wishlist toggle (saved client-side with notifications).
  * Available sizes badges (stock > 0) normalized using a fail-safe utility.
  * Compare price strikethrough handling both database column revisions (`compare_price` / `compare_at_price`).
  * Quick "Add to Bag" shortcut button selecting the default size in stock.
* **Sportswear Homepage (`page.tsx`)**:
  * Immersive cinematic background hero banner.
  * Active Category filter pills mapping to server query filters (`/products?category=...`).
  * Value statements grid showing shipping/COD trust marks.
  * Brand metrics showcase (e.g. 15k+ shipments, 99.4% rating).
  * Customer testimonial slider carousel with autoplay and manual overrides.
* **Server-Rendered Catalog (`/products/page.tsx`)**:
  * Fully server-side data loading based on search parameters (`category`, `sort`, `search`).
  * Database lowercase queries normalization avoiding crashes.
  * Staggered entrance animations on products grid card display.
  * Clean empty states and CSS pulsing shimmer loading templates (`loading.tsx`).

---

## Technical Enhancements & Safety Details

### 1. Sizes Schema Mismatch Fail-Safe (`lib/sizes.ts`)
To bridge database JSONB structures (e.g., arrays vs. objects) without code disruption, we created the `normalizeSizes` utility. This guarantees the application safely resolves size inventory in either format:
```typescript
export function normalizeSizes(sizesData: any): Record<Size, number> {
  // Gracefully converts [{"size": "S", "stock": 10}] or {"S": 10} to a unified key-value object.
}
```

### 2. Category Normalization
To conform to Supabase CHECK constraints:
- Input categories are mapped to lowercase values (`football`, `cricket`, `basketball`) during query building.
- UI elements display clean, capitalized labels (`Football`, `Cricket`, etc.) for users.
