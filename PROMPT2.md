# B2C Jersey Store MVP - Schema Update Documentation (Prompt 2)

This document highlights the database enhancements and schema evolution from the initial setup described in [PROMPT1.md](file:///d:/B2C/JERSEY/PROMPT1.md) to the newly created [schema.sql](file:///d:/B2C/JERSEY/schema.sql).

---

## Key Enhancements & Schema Changes

Below is a breakdown of what was added, modified, or introduced relative to the original database configuration in Prompt 1.

### 1. Products Table (`products`)
* **ID Default Generation**: Switched to PostgreSQL's native `gen_random_uuid()` (backed by `pgcrypto`), aligning with typical Supabase defaults.
* **Price Decimals**: Explicitly cast pricing fields (`price` and `compare_price`) to `numeric(10,2)` for accurate transaction and monetary representation.
* **Renamed Compare Price**: Changed from `compare_at_price` to `compare_price` for clean database field naming.
* **Tags Array (`tags`)**: Added `tags text[] not null default '{}'` to enable easy search and categorization.
* **Product Status (`is_active`)**: Added `is_active boolean default true` to allow admin soft-disabling of out-of-season jerseys.
* **Sizes Structure**: Modified default and type expectations to support a more flexible size inventory array format: `sizes JSONB NOT NULL DEFAULT '[]'::jsonb` (e.g., `[{"size": "M", "stock": 12}]`).
* **Timestamp Trigger**: Added `updated_at timestamptz default now()` coupled with a database trigger to auto-update the modification timestamp.

### 2. Orders Table (`orders`)
* **Order Number Generator**: Added an auto-incrementing `order_number_seq` sequence starting at `1001` and a custom function `generate_order_number()` to generate human-readable identifiers formatted as `JRS-1001`, `JRS-1002`, etc.
* **Fulfillment Management**: Added `fulfillment_status` (check-constrained to `'processing'`, `'shipped'`, `'delivered'`, or `'cancelled'`) and `tracking_number` to trace shipments.
* **Customer Notes**: Added `notes text` field for delivery/customization instructions.
* **Razorpay Fields separation**: Structured to support separate `payment_id` and `razorpay_order_id` columns.
* **Timestamp Trigger**: Added `updated_at timestamptz default now()` and its corresponding trigger.

### 3. Coupons Table (`coupons`)
* **Standardized Field Names**:
  * Changed `discount_type` to `type` (constrained to `'percent'` and `'flat'`).
  * Changed `discount_value` to `value`.
  * Changed `active` to `is_active`.
  * Changed `expires_at` to `valid_until`.
* **Coupons Validity Range**: Added `valid_from` alongside `valid_until` to support scheduled campaigns.
* **Usage Caps**: Added `max_uses` (usage limit) and `used_count` (running tally) to enforce coupon validation rules.

### 4. Row Level Security (RLS) & Security Policies
* **RLS Enforcement**: Active on all tables (`products`, `orders`, and `coupons`).
* **Public Read Access**: Standardized public access so anyone can read products (`SELECT` allowed for `public`).
* **Service Role Restriction**: No policies are created on `orders` and `coupons` tables. By default, this rejects all client-side requests, securing sensitive invoice data and coupon setups. All orders and coupons operations must be handled on the server side using the Supabase Service Role key (`SUPABASE_SERVICE_ROLE_KEY`).

### 5. Indexing for Performance
Added three high-traffic indexes to improve read efficiency under load:
* `idx_products_slug` on `products(slug)`
* `idx_products_is_active` on `products(is_active)`
* `idx_orders_payment_status` on `orders(payment_status)`

---

## How to Apply

1. Copy the contents of the newly created [schema.sql](file:///d:/B2C/JERSEY/schema.sql) file.
2. Go to the **Supabase Dashboard** -> **SQL Editor** -> **New Query**.
3. Paste and click **Run**.
