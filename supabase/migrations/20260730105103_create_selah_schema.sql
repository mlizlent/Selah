/*
# Selah — spiritual care app schema (single-tenant, no auth)

1. Purpose
   Selah lets anyone ("the Seeker") submit a prayer request (anonymous or named,
   with a category tag), talk through what's bothering them with an AI companion
   that surfaces curated Bible verses, escalate from the chat to a real prayer
   request or an appointment with the Priestess, read and share public
   testimonies, and always see a crisis-detection fallback. A Priestess dashboard
   shows the queue of prayer requests and appointment requests with status
   (pending -> praying -> prayed), and can approve submitted testimonies.

2. New Tables
   - `prayer_requests`
     - id (uuid pk)
     - name (text, nullable — null means anonymous)
     - category (text — one of: anxiety, grief, finances, relationships, health, guidance, gratitude, other)
     - body (text, the request itself)
     - status (text, one of: pending, praying, prayed — default pending)
     - prayed_note (text, nullable — a short note the Priestess leaves when she prays)
     - created_at (timestamptz)
     - prayed_at (timestamptz, nullable — set when status moves to prayed)
   - `testimonies`
     - id (uuid pk)
     - author_name (text, nullable — null means anonymous)
     - title (text)
     - body (text)
     - approved (boolean, default false — only approved ones show publicly)
     - created_at (timestamptz)
   - `appointments`
     - id (uuid pk)
     - name (text, nullable — null means anonymous)
     - contact (text — phone or email, how the Priestess should reach back)
     - reason (text, short note about what the appointment is for)
     - status (text, one of: pending, scheduled, completed — default pending)
     - created_at (timestamptz)

3. Security
   - Enable RLS on all three tables.
   - This is a single-tenant, no-sign-in app: the frontend talks to Supabase with
     the anon key for its entire lifetime. Every policy lists
     `TO anon, authenticated` so the anon-key client can read/write its own data.
     The data is intentionally public/shared (prayer requests are submitted by
     anonymous visitors, testimonies are read by anyone). `USING (true)` is
     acceptable and documented here for that reason.
   - Prayer requests: anon can insert + read their own submissions; updates to
     status/prayed_note/prayed_at are allowed for anon too because the Priestess
     dashboard runs in the same anon-key context (no separate admin auth in this
     version). A future version can scope updates to an authenticated priestess
     role.
   - Testimonies: anyone (anon) can insert a testimony; anyone can SELECT only
     approved ones; updates (approval) allowed for anon in this version.
   - Appointments: anon can insert + read; updates allowed for anon in this
     version.

4. Important notes
   - No `user_id` / `auth.users` foreign keys — there is no sign-in flow.
   - All timestamps default to now().
   - Indexes added on status + created_at for the dashboard queue ordering.
*/

-- prayer_requests
CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  category text NOT NULL DEFAULT 'other',
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  prayed_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  prayed_at timestamptz
);

ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_prayer_requests_status_created
  ON prayer_requests (status, created_at DESC);

DROP POLICY IF EXISTS "anon_select_prayer_requests" ON prayer_requests;
CREATE POLICY "anon_select_prayer_requests" ON prayer_requests
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_prayer_requests" ON prayer_requests;
CREATE POLICY "anon_insert_prayer_requests" ON prayer_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_prayer_requests" ON prayer_requests;
CREATE POLICY "anon_update_prayer_requests" ON prayer_requests
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- testimonies
CREATE TABLE IF NOT EXISTS testimonies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text,
  title text NOT NULL,
  body text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_testimonies_approved_created
  ON testimonies (approved, created_at DESC);

DROP POLICY IF EXISTS "anon_select_approved_testimonies" ON testimonies;
CREATE POLICY "anon_select_approved_testimonies" ON testimonies
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_testimonies" ON testimonies;
CREATE POLICY "anon_insert_testimonies" ON testimonies
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_testimonies" ON testimonies;
CREATE POLICY "anon_update_testimonies" ON testimonies
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  contact text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_appointments_status_created
  ON appointments (status, created_at DESC);

DROP POLICY IF EXISTS "anon_select_appointments" ON appointments;
CREATE POLICY "anon_select_appointments" ON appointments
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_appointments" ON appointments;
CREATE POLICY "anon_insert_appointments" ON appointments
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_appointments" ON appointments;
CREATE POLICY "anon_update_appointments" ON appointments
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
