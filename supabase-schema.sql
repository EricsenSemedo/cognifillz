-- CogniFillz Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (The User's "Brain")
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Basic Info
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  
  -- Links
  linkedin TEXT,
  github TEXT,
  portfolio TEXT,
  
  -- Resume Content
  summary TEXT,
  master_resume_json JSONB, -- Structured data for autofill
  raw_resume_text TEXT,      -- Full text for AI analysis
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- Create applications table (Tracking)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Job Info
  company_name TEXT,
  job_title TEXT,
  job_url TEXT,
  job_description TEXT,
  
  -- Analysis
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  missing_keywords TEXT[],
  tailored_summary TEXT,
  
  -- Tracking
  status TEXT DEFAULT 'applied' CHECK (status IN ('saved', 'applied', 'interviewing', 'rejected', 'accepted')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_field_mappings table (Heuristic Learning)
-- When users teach the extension about unknown fields, store them here
CREATE TABLE IF NOT EXISTS custom_field_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  
  -- Field Info
  field_label TEXT NOT NULL,
  field_name TEXT,
  field_id TEXT,
  field_type TEXT, -- 'firstName', 'lastName', etc.
  
  -- Context
  domain TEXT, -- e.g., 'workday.com', 'greenhouse.io'
  page_title TEXT,
  
  -- Metadata
  confidence FLOAT DEFAULT 1.0,
  use_count INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate mappings
  UNIQUE(user_id, field_label, domain)
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_custom_field_mappings_user_domain ON custom_field_mappings(user_id, domain);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Users can only see and modify their own data

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_mappings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Applications policies
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
  ON applications FOR DELETE
  USING (auth.uid() = user_id);

-- Custom field mappings policies
CREATE POLICY "Users can view their own field mappings"
  ON custom_field_mappings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own field mappings"
  ON custom_field_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own field mappings"
  ON custom_field_mappings FOR UPDATE
  USING (auth.uid() = user_id);

-- Optional: Create a view for quick profile lookup
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  p.*,
  COUNT(a.id) as total_applications,
  COUNT(a.id) FILTER (WHERE a.status = 'applied') as applied_count,
  COUNT(a.id) FILTER (WHERE a.status = 'interviewing') as interviewing_count
FROM profiles p
LEFT JOIN applications a ON p.user_id = a.user_id
GROUP BY p.id;

COMMENT ON TABLE profiles IS 'User profile data for autofilling job applications';
COMMENT ON TABLE applications IS 'Tracking of job applications and their status';
COMMENT ON TABLE custom_field_mappings IS 'User-taught field mappings for improving autofill accuracy';
