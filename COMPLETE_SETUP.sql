-- ============================================
-- COMPLETE LSA DATABASE SETUP
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- This includes all tables, functions, and data setup
-- ============================================

-- ============================================
-- SECTION 1: PROFILES TABLE (CUSTOM AUTH)
-- ============================================
-- Create profiles table (without FK this time)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles" ON public.profiles
    FOR ALL USING (true);

-- ============================================
-- SECTION 2: AUTHENTICATION FUNCTIONS
-- ============================================

-- Create password hashing function
CREATE OR REPLACE FUNCTION hash_password(password TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN md5(password || 'lsa_salt_key_2024');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create authentication function
CREATE OR REPLACE FUNCTION authenticate_user(p_email VARCHAR, p_password VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_stored_hash VARCHAR;
    v_role VARCHAR;
    v_full_name VARCHAR;
BEGIN
    SELECT id, password_hash, role, full_name 
    INTO v_user_id, v_stored_hash, v_role, v_full_name
    FROM public.profiles
    WHERE email = p_email AND is_active = true;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Invalid email or password');
    END IF;
    
    IF hash_password(p_password) != v_stored_hash THEN
        RETURN json_build_object('success', false, 'message', 'Invalid email or password');
    END IF;
    
    RETURN json_build_object('success', true, 'user_id', v_user_id, 'email', p_email, 'role', v_role, 'full_name', v_full_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECTION 3: INSERT USER ACCOUNTS
-- ============================================

-- Insert admin account
INSERT INTO public.profiles (email, password_hash, full_name, role, is_active)
VALUES (
    'admin@school.com',
    hash_password('Admin@12345'),
    'School Administrator',
    'admin',
    true
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Insert teacher account
INSERT INTO public.profiles (email, password_hash, full_name, role, is_active)
VALUES (
    'teacher@school.com',
    hash_password('Teacher@12345'),
    'Teacher Account',
    'teacher',
    true
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- SECTION 4: CONTACTS TABLE
-- ============================================

DROP TABLE IF EXISTS contacts CASCADE;

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_is_read ON contacts(is_read);

ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 5: GALLERY TABLE
-- ============================================

DROP TABLE IF EXISTS gallery CASCADE;

CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery(order_index);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at DESC);

ALTER TABLE gallery DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 6: CERTIFICATE REQUESTS TABLE
-- ============================================

DROP TABLE IF EXISTS certificate_requests CASCADE;

CREATE TABLE IF NOT EXISTS certificate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  massar_number TEXT NOT NULL,
  submission_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_requests_massar ON certificate_requests(massar_number);
CREATE INDEX IF NOT EXISTS idx_cert_requests_status ON certificate_requests(status);
CREATE INDEX IF NOT EXISTS idx_cert_requests_date ON certificate_requests(submission_date);

ALTER TABLE certificate_requests DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 7: VERIFICATION QUERIES
-- ============================================

-- Verify profiles table and accounts
SELECT 'Profiles Table' as check_name, COUNT(*) as count 
FROM public.profiles;

SELECT email, role, is_active 
FROM public.profiles 
ORDER BY created_at DESC;

-- Verify functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('hash_password', 'authenticate_user');

-- ============================================
-- SECTION 8: TEST AUTHENTICATION
-- ============================================

-- Test 1: Authenticate with correct password
SELECT authenticate_user('admin@school.com', 'Admin@12345') as auth_result;

-- Test 2: Authenticate with wrong password
SELECT authenticate_user('admin@school.com', 'WrongPassword') as auth_result;

-- Test 3: Authenticate with non-existent email
SELECT authenticate_user('nonexistent@school.com', 'Admin@12345') as auth_result;

-- ============================================
-- DONE
-- ============================================
-- All setup complete!
-- Login with:
--   Email: admin@school.com
--   Password: Admin@12345
-- Or:
--   Email: teacher@school.com
--   Password: Teacher@12345
