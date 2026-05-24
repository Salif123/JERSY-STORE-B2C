-- ==========================================
-- B2C JERSEY STORE - SUPABASE DATABASE SCHEMA
-- ==========================================

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. ORDER NUMBER GENERATION SETUP
-- ==========================================

-- Sequence for human-readable order numbers starting at 1001
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- Function to automatically generate order numbers (e.g., JRS-1001, JRS-1002, ...)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'JRS-' || nextval('order_number_seq')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 2. PRODUCTS TABLE
-- ==========================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    compare_price NUMERIC(10,2) CHECK (compare_price IS NULL OR compare_price >= price),
    images TEXT[] NOT NULL DEFAULT '{}',
    sizes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Expected structure: [{"size": "M", "stock": 12}]
    category TEXT CHECK (category IN ('football', 'cricket', 'basketball')),
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. ORDERS TABLE
-- ==========================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL DEFAULT generate_order_number(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address JSONB NOT NULL, -- Expected structure: { line1, city, state, pincode }
    items JSONB NOT NULL,            -- Expected structure: [{ product_id, name, size, qty, price }]
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(10,2) DEFAULT 0 CHECK (discount >= 0),
    coupon_code TEXT,
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    payment_id TEXT,                 -- Razorpay payment_id after success
    razorpay_order_id TEXT,
    fulfillment_status TEXT DEFAULT 'processing' CHECK (fulfillment_status IN ('processing', 'shipped', 'delivered', 'cancelled')),
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. COUPONS TABLE
-- ==========================================
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percent', 'flat')),
    value NUMERIC(10,2) NOT NULL CHECK (value > 0),
    min_order_amount NUMERIC(10,2) DEFAULT 0 CHECK (min_order_amount >= 0),
    max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
    used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: Readable by all (anonymous and authenticated users)
CREATE POLICY "Allow public read access to products" 
ON products 
FOR SELECT 
TO public 
USING (true);

-- ORDERS & COUPONS: Only accessible by the service role.
-- Enabling RLS without defining any policies defaults to rejecting all non-superuser/non-service_role access.
-- Since Supabase Service Role Key bypasses RLS, server actions and route handlers using it will have full access.

-- ==========================================
-- 6. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);

-- ==========================================
-- 7. TIMESTAMPTZ UPDATE TRIGGERS
-- ==========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Products
CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for Orders
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
