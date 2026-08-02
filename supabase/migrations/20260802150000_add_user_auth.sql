-- Add user_id to prayer_requests
ALTER TABLE prayer_requests ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add user_id to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Prayer requests: keep existing anon policies, add authenticated user policies
DROP POLICY IF EXISTS "select_own_prayer_requests" ON prayer_requests;
DROP POLICY IF EXISTS "update_own_prayer_requests" ON prayer_requests;

CREATE POLICY "select_own_prayer_requests" ON prayer_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "update_own_prayer_requests" ON prayer_requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (true);

-- Appointments: keep existing anon policies, add authenticated user policies
DROP POLICY IF EXISTS "select_own_appointments" ON appointments;
DROP POLICY IF EXISTS "update_own_appointments" ON appointments;

CREATE POLICY "select_own_appointments" ON appointments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "update_own_appointments" ON appointments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (true);
