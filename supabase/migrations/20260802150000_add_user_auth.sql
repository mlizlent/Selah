-- Add user_id to prayer_requests
ALTER TABLE prayer_requests ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add user_id to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Drop existing policies
DROP POLICY IF EXISTS "anon_select_prayer_requests" ON prayer_requests;
DROP POLICY IF EXISTS "anon_insert_prayer_requests" ON prayer_requests;
DROP POLICY IF EXISTS "anon_update_prayer_requests" ON prayer_requests;

DROP POLICY IF EXISTS "anon_select_appointments" ON appointments;
DROP POLICY IF EXISTS "anon_insert_appointments" ON appointments;
DROP POLICY IF EXISTS "anon_update_appointments" ON appointments;

-- Prayer requests: anon can insert; users can select/update their own
CREATE POLICY "anon_insert_prayer_requests" ON prayer_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_own_prayer_requests" ON prayer_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "update_own_prayer_requests" ON prayer_requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (true);

-- Appointments: anon can insert; users can select/update their own
CREATE POLICY "anon_insert_appointments" ON appointments
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_own_appointments" ON appointments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "update_own_appointments" ON appointments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (true);
