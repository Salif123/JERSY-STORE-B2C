# Premium B2C Sports Jersey Store MVP

A high-performance, cinematic, and visually stunning sports jersey e-commerce application tailored for Indian sports enthusiasts. Engineered with a Next.js 14 App Router backend, custom Supabase database integrations, unsigned Cloudinary uploads, a Zustand local cart, Razorpay secure checkouts, and a secure passcode-locked admin panel.

---

## 🚀 Technology Stack

- **Frontend Framework**: Next.js 14 (App Router, Server Components by default, Client Components for interactivity)
- **Styling & Theme**: Tailwind CSS, Next-Themes (complete Light & Dark mode support)
- **Animations**: Framer Motion & native CSS keyframes (smooth transitions, slide-out drawers, infinite marquees, and 3D card tilt)
- **State Management**: Zustand with LocalStorage persistence (flat Cart & Wishlist state)
- **Database**: Supabase PostgreSQL with custom RLS (Row Level Security) and database performance indices
- **Payments Gateway**: Razorpay Checkout SDK (INR transactions)
- **Media CDN**: Cloudinary Media API (Unsigned upload preset for admin product image ingestion)

---

## ✨ Features & Architecture

### 1. Storefront Landing Page
- **Cinematic Hero Banner**: Large ambient sports header background with responsive layout action buttons.
- **Interactive Clubs Showcase**:
  - *Infinite Marquee*: Continuous scrolling apparel brand logos and sports leagues (Nike, Adidas, La Liga, NBA, IPL) which pauses on hover.
  - *3D Parallax Tilt Cards*: Interactive mouse-tilt team banners (CSK, Mumbai Indians, Real Madrid, Manchester United, LA Lakers) radiating brand-specific ambient glows.
  - *Swipe Carousel*: Touch-draggable sliding layouts with snapping alignments on mobile viewports.
- **Home Metrics**: Dynamic statistics (e.g. 15k+ customers, 99.4% rating) and auto-playing fan review sliders.

### 2. Catalog & Product Details
- **Server-Side Catalog (`/products`)**:
  - Live search filters, sorting dropdowns, and category selectors.
  - CSS-pulsing shimmer loader cards (`loading.tsx`) and lowercase category route normalization.
- **Product Detail Page (`/products/[slug]`)**:
  - *Gallery*: Aspect ratio image cards with click-to-zoom (transform scale) and thumbnail rows.
  - *Visual Stock Indicators*: Sizings buttons reflecting real-time stock; automatically disables sold-out sizes and triggers red notices for low quantities (e.g., "Only 3 left!").
  - *Pincode Delivery Check*: Form widget hitting GET `/api/pincode` returning delivery estimation ranges based on the prefix (e.g., Kochi `682016` resolves to 3-5 days).
  - *Policy Accordions*: Collapsible chevron panels for Description copy, Size Guide measurement charts, and Shipping/Refund terms.
  - *Related Items Grid*: Dynamically lists 4 items in the same category, backfilling from other categories if inventory is low.

### 3. Cart, Coupons & Checkout
- **Zustand Flat Cart (`lib/cart.ts`)**: Structured as flat item objects (`{ product_id, name, slug, image, size, price, quantity }`) for payment payload optimization. Includes backward-compatibility fallbacks to support existing database order history.
- **Cart Drawer & Checkout Form (`/checkout`)**: Slide-out drawer displaying item updates, custom coupon validations, client-side address verification forms, and Razorpay script load handlers.

### 4. Admin Management Portal (`/admin`)
- Protected by a secure passcode middleware gate.
- Lists sales analytics and orders matrices.
- Dynamic inventory panels to edit or create products, upload image files to Cloudinary, and generate discount coupon codes.

---

## 🛠️ Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Salif123/JERSY-STORE-B2C.git
cd JERSY-STORE-B2C
npm install
```

### 2. Set Up Environment Variables
Copy `.env.local.example` to `.env.local` and configure your credentials:
```bash
cp .env.local.example .env.local
```
Fill out the variables inside `.env.local`:
- **Supabase credentials** (Project URL, Anon API key, Service role key)
- **Cloudinary account name** and unsigned preset names
- **Razorpay API IDs** and secret keys
- **Admin passcode** used to enter the panel

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Run Production Builds
```bash
npm run build
npm run start
```

---

## 🗄️ Database Architecture
The application runs on a PostgreSQL schema defined in `schema.sql`. It includes:
- **`products`**: Table managing jersey names, slugs, tags, categories, image arrays, and JSONB sizes inventory.
- **`orders`**: Table tracking shipping addresses, ordered items, subtotals, applied discount coupons, and payment statuses.
- **`coupons`**: Table containing percentage/flat discounts, usage counts, and expiry dates.
- **Human-Readable Sequences**: Custom order generator numbering invoices starting at `JRS-1001`.
- **Timestamps Triggers**: Automated trigger updates on modified rows tracking `updated_at` properties.
