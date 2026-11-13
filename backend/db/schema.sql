-- Plain PostgreSQL schema for Selah (no Supabase auth/RLS)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  username text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username text UNIQUE,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  category text NOT NULL DEFAULT 'other',
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  prayed_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  prayed_at timestamptz,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_status_created
  ON prayer_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_created
  ON prayer_requests (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS testimonies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text,
  title text NOT NULL,
  body text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonies_approved_created
  ON testimonies (approved, created_at DESC);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  contact text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_status_created
  ON appointments (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_user_created
  ON appointments (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS priestess_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_priestess_posts_created
  ON priestess_posts (created_at DESC);
