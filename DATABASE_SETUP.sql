-- ============================================
-- CONTACTS TABLE
-- ============================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS contacts CASCADE;

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_is_read ON contacts(is_read);

-- Disable Row Level Security for testing
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- ============================================
-- CERTIFICATE REQUESTS TABLE
-- ============================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS certificate_requests CASCADE;

-- Create certificate_requests table
CREATE TABLE IF NOT EXISTS certificate_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  massar_number TEXT NOT NULL,
  submission_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_cert_requests_massar ON certificate_requests(massar_number);
CREATE INDEX IF NOT EXISTS idx_cert_requests_status ON certificate_requests(status);
CREATE INDEX IF NOT EXISTS idx_cert_requests_date ON certificate_requests(submission_date);

-- Disable Row Level Security for testing
ALTER TABLE certificate_requests DISABLE ROW LEVEL SECURITY;
