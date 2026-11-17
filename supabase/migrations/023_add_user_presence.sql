-- =============================================
-- Add User Presence System
-- =============================================

-- Add last_seen column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_seen timestamptz;

-- Create function to check if user is online (last_seen within last 5 minutes)
CREATE OR REPLACE FUNCTION is_user_online(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND last_seen > NOW() - INTERVAL '5 minutes'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update last_seen timestamp
CREATE OR REPLACE FUNCTION update_user_presence(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET last_seen = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
