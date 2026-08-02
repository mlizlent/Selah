-- Create a simple priestess post feed for announcements and community messages.

CREATE TABLE IF NOT EXISTS priestess_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE priestess_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_priestess_posts" ON priestess_posts;
CREATE POLICY "anon_select_priestess_posts" ON priestess_posts
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_priestess_posts" ON priestess_posts;
CREATE POLICY "anon_insert_priestess_posts" ON priestess_posts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_priestess_posts" ON priestess_posts;
CREATE POLICY "anon_update_priestess_posts" ON priestess_posts
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_priestess_posts" ON priestess_posts;
CREATE POLICY "anon_delete_priestess_posts" ON priestess_posts
  FOR DELETE TO anon, authenticated USING (true);
