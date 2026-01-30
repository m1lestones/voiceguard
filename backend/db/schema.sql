-- Run this in Supabase SQL Editor to create tables
-- https://supabase.com/dashboard/project/_/sql

-- Users (for auth - we store our own so we control JWT)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrolled family members (voice prints + security questions)
CREATE TABLE IF NOT EXISTS enrolled_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  voice_prints JSONB NOT NULL DEFAULT '[]',
  security_questions JSONB NOT NULL DEFAULT '[]',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_enrolled_members_user_id ON enrolled_members(user_id);

-- Row Level Security (optional - we use service key in backend so not required for MVP)
-- ALTER TABLE enrolled_members ENABLE ROW LEVEL SECURITY;
