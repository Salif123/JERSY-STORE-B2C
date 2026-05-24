# B2C Jersey Store MVP - Cumulative Documentation (Prompt 4)

This documentation tracks the features, database architectures, styling guidelines, and animations built across **Prompt 1**, **Prompt 2**, **Prompt 3**, and **Prompt 4** for this premium B2C sports jersey e-commerce store.

---

## Tech Stack Summary
* **Frontend Framework**: Next.js 14 (App Router, Server & Client Components)
* **Design & Styling**: Tailwind CSS, next-themes (Light & Dark Theme toggles)
* **Animations**: Framer Motion (page transitions, drawers, overlays, staggered grids)
* **State Management**: Zustand with local persistence (Flat Cart management)
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

### Phase 4: Product Detail Page, Flat Cart & Pincode Checks (Prompt 4)
* **Active Status Server Routing**: Implemented server-side product queries with immediate `notFound()` 404 triggers for inactive or missing products.
* **Responsive Layout (60% / 40%)**:
  * **Left Column (60% width)**: Rebuilt image gallery utilizing Cloudinary Next.js Image loaders, interactive click-to-zoom (CSS transform scale scale-135 with dynamic cursors), and scrollbar-hidden thumbnail selector rows.
  * **Right Column (40% width)**: Displayed product information, category tag, compare price strikethrough, size selectors, quantity counters, wishlist buttons, checkout buttons, pincode check forms, and accordions.
* **Size Selector Button Grid (`SizeSelector.tsx`)**:
  * Renders size options in a sleek 5-column button grid.
  * Automatically disables buttons with stock = 0 and overlays a subtle "Out of stock" label.
  * Shows stock counts for low inventory (stock ≤ 5) as red text alerts ("Only 3 left!").
* **Dynamic Quantity Adjuster**: Configured increment/decrement buttons clamped to selected size stock limits.
* **Pincode Delivery Check API (`/api/pincode`)**:
  * Developed a GET API handler validating 6-digit PIN codes.
  * Simulates undeliverable zones (prefix starting with `9`).
  * Maps prefixes to delivery estimations, resolving `682016` (and prefix `6`) to the specified `3-5` days delivery range.
- **Product Details Accordion**: Created collapsible accordion panels for **Description**, **Size Guide** (detailed measurements table), and **Shipping & Returns** policies.
- **Related Products recommendations**: Fetches 4 active related products belonging to the same category server-side, backfilling from other categories if required, and rendering them as sportswear cards.
- **Zustand Flat Cart Refactoring (`lib/cart.ts`)**:
  - Migrated the Zustand cart store to a flat `CartItem` schema: `{ product_id, name, slug, image, size, price, quantity }`.
  - Preserved the original nested `product?: Product` field as optional to prevent crashes when processing old orders stored in database history.
  - Refactored storefront and admin layers (`CartItem.tsx`, `Header.tsx`, `/cart`, `/checkout`, `/api/payment/create-order`, `/api/payment/verify`, `OrderTable.tsx`, and `/order-success`) to adapt to flat field reading.
- **Premium Clubs Showcase Upgrade**:
  - **Infinite Marquee**: Built an hardware-accelerated logo marquee showcasing brands (Nike, Adidas, Puma) and leagues (NBA, Premier League, IPL, La Liga) that pauses on cursor hover.
  - **3D Tilt Interaction**: Implemented custom trigonometry coordinates hooks to tilt club cards dynamically relative to cursor hover alignment.
  - **Accent Team Glows**: Renders color shadow boundaries matching team colors (Lakers Purple, CSK Gold, United Red, MI Cobalt, Real Madrid Gold) and radial spotlight coordinates.
  - **Expandable Tagline CTAs**: Smooth CSS height expansions revealing team taglines and action links on hover.
  - **Swipe carousel**: Integrated draggable snap-scroll carousels with dot selectors for swipable mobile usage.

---

## Technical Enhancements & Safety Details

### 1. Flat Schema Cart Structure (`types/index.ts`)
To optimize cart serialization and integration with payments/receipts, we refactored the cart schema from a nested product reference structure to a flat structure. This structure retains compatibility with the original schema through optional typing:
```typescript
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
```

### 2. Pincode Check Delivery Days Prefix Resolver (`app/api/pincode/route.ts`)
The Pin code API validates input length and formats, mapping different prefixes to estimated ranges:
```typescript
let days = '3-5';
if (sanitized === '682016' || prefix === '6') {
  days = '3-5'; // Kerala / South India - matches prompt example
} else if (prefix === '5') {
  days = '2-3'; // Karnataka/Telangana/AP/etc.
} else if (prefix === '3' || prefix === '4') {
  days = '2-4'; // West / Central (Maharashtra, Gujarat, MP)
} else if (prefix === '7' || prefix === '8') {
  days = '4-7'; // East / Northeast
} else {
  days = '3-6'; // North India
}
```
