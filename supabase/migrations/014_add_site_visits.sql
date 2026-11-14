-- Create table for tracking site visits
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_country ON site_visits(country);
CREATE INDEX IF NOT EXISTS idx_site_visits_session_id ON site_visits(session_id);

-- Enable RLS
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from public (for tracking visits)
CREATE POLICY "Allow public inserts" ON site_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow admin/staff to read all visits
CREATE POLICY "Allow admin/staff to read visits" ON site_visits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'staff')
    )
  );
