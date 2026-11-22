-- =============================================================================
-- STOCKWISE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) MIGRATION
-- Target Database: PostgreSQL 15+ (Supabase Free Tier Compatible)
-- Version: 1.0.0
-- Created: 2026-11-22
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. BUSINESSES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Retail store',
    phone_number TEXT,
    email TEXT,
    country TEXT NOT NULL DEFAULT 'Ghana',
    region TEXT,
    city TEXT NOT NULL DEFAULT 'Accra',
    address TEXT,
    logo_url TEXT,
    currency TEXT NOT NULL DEFAULT 'GH₵',
    currency_code TEXT NOT NULL DEFAULT 'GHS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. USER PROFILES TABLE (Linked to Supabase auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. PRODUCTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    sku TEXT NOT NULL,
    barcode TEXT,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'pcs',
    low_stock_threshold NUMERIC(12, 2) NOT NULL DEFAULT 5,
    expiry_date DATE,
    manufacturing_date DATE,
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for instant barcode lookups in the scanner engine
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_expiry ON public.products(expiry_date);

-- =============================================================================
-- 4. PRODUCT BATCHES TABLE (Multi-batch tracking with distinct expiry dates)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_batches (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    expiry_date DATE,
    manufacturing_date DATE,
    received_date TIMESTAMPTZ DEFAULT NOW(),
    supplier TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batches_product ON public.product_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON public.product_batches(expiry_date);

-- =============================================================================
-- 5. STOCK MOVEMENTS TABLE (Audit trail for in/out/adjustment/sales)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id TEXT PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('add', 'remove', 'adjustment', 'sale')),
    quantity_change NUMERIC(12, 2) NOT NULL,
    previous_quantity NUMERIC(12, 2) NOT NULL,
    new_quantity NUMERIC(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    cost_price NUMERIC(12, 2),
    batch_id TEXT,
    employee_name TEXT NOT NULL DEFAULT 'System',
    employee_id TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_business ON public.stock_movements(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON public.stock_movements(created_at DESC);

-- =============================================================================
-- 6. SALES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'momo', 'card', 'other')),
    payment_notes TEXT,
    sold_by TEXT NOT NULL,
    sold_by_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_business ON public.sales(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON public.sales(created_at DESC);

-- =============================================================================
-- 7. SALE ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id TEXT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    sku TEXT,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pcs',
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);

-- =============================================================================
-- 8. EMPLOYEES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
    pin TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_business ON public.employees(business_id);

-- =============================================================================
-- 9. NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('stock', 'sale', 'system', 'sync', 'expiry', 'employee')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_business ON public.notifications(business_id);

-- =============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to retrieve the user's business_id
CREATE OR REPLACE FUNCTION public.get_auth_business_id()
RETURNS UUID AS $$
    SELECT business_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can view & update their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Businesses: Users can access their assigned business
CREATE POLICY "Users can view assigned business"
    ON public.businesses FOR SELECT
    USING (id = public.get_auth_business_id());

CREATE POLICY "Users can update assigned business"
    ON public.businesses FOR UPDATE
    USING (id = public.get_auth_business_id());

CREATE POLICY "Users can create a business"
    ON public.businesses FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Products: Scoped to user's business
CREATE POLICY "Users can view business products"
    ON public.products FOR SELECT
    USING (business_id = public.get_auth_business_id() OR business_id IS NULL);

CREATE POLICY "Users can manage business products"
    ON public.products FOR ALL
    USING (business_id = public.get_auth_business_id() OR business_id IS NULL);

-- Product Batches: Scoped to user's business
CREATE POLICY "Users can view product batches"
    ON public.product_batches FOR SELECT
    USING (business_id = public.get_auth_business_id() OR business_id IS NULL);

CREATE POLICY "Users can manage product batches"
    ON public.product_batches FOR ALL
    USING (business_id = public.get_auth_business_id() OR business_id IS NULL);

-- Stock Movements: Scoped to user's business
CREATE POLICY "Users can view stock movements"
    ON public.stock_movements FOR SELECT
    USING (business_id = public.get_auth_business_id() OR business_id IS NULL);

CREATE POLICY "Users can record stock movements"
    ON public.stock_movements FOR INSERT
    WITH CHECK (business_id = public.get_auth_business_id() OR business_id IS NULL);

-- Sales & Sale Items: Scoped to user's business
CREATE POLICY "Users can view business sales"
    ON public.sales FOR SELECT
    USING (business_id = public.get_auth_business_id() OR business_id IS NULL);

CREATE POLICY "Users can record sales"
    ON public.sales FOR INSERT
    WITH CHECK (business_id = public.get_auth_business_id() OR business_id IS NULL);

CREATE POLICY "Users can view sale items"
    ON public.sale_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.sales
        WHERE sales.id = sale_items.sale_id
        AND (sales.business_id = public.get_auth_business_id() OR sales.business_id IS NULL)
    ));

CREATE POLICY "Users can insert sale items"
    ON public.sale_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.sales
        WHERE sales.id = sale_items.sale_id
        AND (sales.business_id = public.get_auth_business_id() OR sales.business_id IS NULL)
    ));

-- Employees: Scoped to user's business
CREATE POLICY "Users can view employees"
    ON public.employees FOR SELECT
    USING (business_id = public.get_auth_business_id() OR business_id IS NULL);

CREATE POLICY "Users can manage employees"
    ON public.employees FOR ALL
    USING (business_id = public.get_auth_business_id() OR business_id IS NULL);

-- Notifications: Scoped to user's business
CREATE POLICY "Users can view notifications"
    ON public.notifications FOR SELECT
    USING (business_id = public.get_auth_business_id() OR business_id IS NULL);

CREATE POLICY "Users can manage notifications"
    ON public.notifications FOR ALL
    USING (business_id = public.get_auth_business_id() OR business_id IS NULL);

-- =============================================================================
-- 11. AUTOMATIC PROFILE CREATION TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone_number, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Stockwise User'),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.phone),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger hook on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 12. STORAGE BUCKET CONFIGURATION
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for images
CREATE POLICY "Public image view access"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('product-images', 'business-logos'));

-- Authenticated upload access
CREATE POLICY "Authenticated user image uploads"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('product-images', 'business-logos') AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated user image updates"
    ON storage.objects FOR UPDATE
    USING (bucket_id IN ('product-images', 'business-logos') AND auth.uid() IS NOT NULL);
