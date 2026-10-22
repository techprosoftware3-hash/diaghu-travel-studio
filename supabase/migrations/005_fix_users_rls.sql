-- =============================================
-- Fix Users Table RLS Policies
-- Add RPC function to get user role
-- =============================================

-- Create RPC function to get user role (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = user_id;

  RETURN COALESCE(user_role, 'client');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
