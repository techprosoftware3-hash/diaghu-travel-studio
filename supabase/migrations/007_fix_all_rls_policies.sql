-- =============================================
-- Fix All RLS Policies to Avoid Infinite Recursion
-- =============================================

-- Drop problematic policies from users table
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Drop problematic policies from pre_consultations table
DROP POLICY IF EXISTS "Admins and staff can view all pre-consultations" ON pre_consultations;
DROP POLICY IF EXISTS "Admins and staff can update pre-consultations" ON pre_consultations;

-- Drop problematic policies from appointments table
DROP POLICY IF EXISTS "Admins and staff can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins and staff can update appointments" ON appointments;

-- Create helper functions (if not exists)
CREATE OR REPLACE FUNCTION is_admin_or_staff(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = user_id;

  RETURN user_role IN ('admin', 'staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_only(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = user_id;

  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin_or_staff(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_only(UUID) TO authenticated;

-- Recreate pre_consultations policies with functions
CREATE POLICY "Admins and staff can view all pre-consultations"
  ON pre_consultations FOR SELECT
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can update pre-consultations"
  ON pre_consultations FOR UPDATE
  USING (is_admin_or_staff(auth.uid()));

-- Recreate appointments policies with functions
CREATE POLICY "Admins and staff can view all appointments"
  ON appointments FOR SELECT
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can update appointments"
  ON appointments FOR UPDATE
  USING (is_admin_or_staff(auth.uid()));
