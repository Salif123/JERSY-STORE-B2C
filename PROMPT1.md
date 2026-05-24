# B2C Jersey Store MVP - Scaffold Documentation (Prompt 1)

This project is a high-performance, mobile-first B2C Jersey E-commerce store built for sports fans in India. It integrates **Supabase** (database), **Razorpay** (payments in INR), and **Cloudinary** (product images).

## Tech Stack
* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **State Management**: Zustand (with LocalStorage persistence for Cart)
* **Database & Auth**: Supabase PostgreSQL
* **Gateway**: Razorpay Checkout SDK
* **Media**: Cloudinary Unsigned Upload Preset

---

## Folders & File Overview

### 1. Root Layout & Storefront Routes (`/app`)
* **`layout.tsx`**: Sets font family (Plus Jakarta Sans), header navigation, footer, and Toast container.
* **`page.tsx`**: Homepage featuring a sport-accented hero banner, value statements, and trending jerseys.
* **`(store)/products/page.tsx`**: Lists all jerseys with client-side category and price filtering.
* **`(store)/products/[slug]/page.tsx`**: Details a specific jersey, manages active galleries, sizes stock availability, and cart actions.
* **`(store)/cart/page.tsx`**: Aggregates selected jerseys, handles quantity adjusting, and displays discount codes.
* **`(store)/checkout/page.tsx`**: Collects shipping addresses, imports Razorpay Checkout, and processes transactions.
* **`(store)/order-success/page.tsx`**: Displays invoice details and verification confirmation.

### 2. Admin Dashboard Portal (`/(admin)`)
* **`admin/page.tsx`**: Admin portal login gate and overview dashboard showing aggregates (Revenue, Orders, AOV, Low Stock Alerts).
* **`admin/products/page.tsx`**: Product table listing with options to update or delete inventory.
* **`admin/products/new/page.tsx`**: Blank container for product creation.
* **`admin/products/[id]/edit/page.tsx`**: Preloads data for updating existing jerseys.
* **`admin/orders/page.tsx`**: Table view to search customer orders and view shipping details.
* **`admin/coupons/page.tsx`**: Admin coupon panel driven by server actions.

### 3. Utility helpers (`/lib` & `/types`)
* **`lib/supabase.ts`**: Connects browser and server clients with build-time environment fallbacks.
* **`lib/cart.ts`**: Persistent Zustand cart store.
* **`lib/coupons.ts`**: Logic calculating percentage/fixed promo discounts.
* **`lib/cloudinary.ts`**: Handles direct uploader actions client-side.
* **`lib/razorpay.ts`**: Generates order tokens and verifies gateway signatures.
* **`types/index.ts`**: Types for `Product`, `Order`, `Coupon`, `Size`, `CartItem`, and `Address`.

### 4. API Endpoints (`/app/api`)
* **`/api/payment/create-order`**: Validates stock, calculates totals, inserts pending invoice, and registers order on Razorpay.
* **`/api/payment/verify`**: Verifies signature, updates order to `paid`, and reduces size stocks.
* **`/api/coupons/validate`**: Verifies promo eligibility server-side.
* **`/api/orders`**: Retrieves invoice details by ID.
* **`/api/admin/products` & `/api/admin/products/[id]`**: Protected CRUD API for products.

---

## Database Configuration

Execute this SQL schema inside your Supabase project SQL Editor to create the necessary tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Products Table
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric not null check (price >= 0),
  compare_at_price numeric check (compare_at_price >= price),
  images text[] not null default '{}',
  sizes jsonb not null default '{"S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0}'::jsonb,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Coupons Table
create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  min_order_amount numeric not null default 0 check (min_order_amount >= 0),
  active boolean not null default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Orders Table
create table orders (
  id uuid primary key default uuid_generate_v4(),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  subtotal numeric not null check (subtotal >= 0),
  discount numeric not null default 0 check (discount >= 0),
  total numeric not null check (total >= 0),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## Local Setup & Environment Keys

1. Copy `.env.local.example` into a new file `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Populate the keys with your credentials:
   - **Supabase**: URL and Service Role Key (to perform server-side database mutations bypassing RLS).
   - **Cloudinary**: Cloud name and **unsigned upload preset** (configured in Cloudinary console settings -> upload).
   - **Razorpay**: Key ID and Key Secret (from Razorpay Developer Settings -> API Keys).
   - **Admin Password**: Set a secret passcode for admin routes.

3. Start the Next.js local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to manage products and coupons.
