-- Add authenticated user tracking to prayer requests so sign-in users can view their own request status.

ALTER TABLE prayer_requests
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_prayer_requests" ON prayer_requests;
CREATE POLICY "anon_select_prayer_requests" ON prayer_requests
  FOR SELECT TO anon, authenticated
  USING (
    user_id IS NULL
    OR auth.uid() IS NULL
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "anon_insert_prayer_requests" ON prayer_requests;
CREATE POLICY "anon_insert_prayer_requests" ON prayer_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    user_id IS NULL
    OR auth.uid() IS NULL
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "anon_update_prayer_requests" ON prayer_requests;
CREATE POLICY "anon_update_prayer_requests" ON prayer_requests
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);
