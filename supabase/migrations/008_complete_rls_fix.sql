-- =============================================
-- Complete RLS Fix - Drop All and Recreate
-- =============================================

-- Drop ALL policies that reference users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

DROP POLICY IF EXISTS "Anyone can create pre-consultations" ON pre_consultations;
DROP POLICY IF EXISTS "Users can view own pre-consultations" ON pre_consultations;
DROP POLICY IF EXISTS "Admins and staff can view all pre-consultations" ON pre_consultations;
DROP POLICY IF EXISTS "Admins and staff can update pre-consultations" ON pre_consultations;

DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins and staff can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins and staff can update appointments" ON appointments;

DROP POLICY IF EXISTS "Anyone can view available slots" ON appointment_slots;
DROP POLICY IF EXISTS "Admins and staff can view all slots" ON appointment_slots;
DROP POLICY IF EXISTS "Admins and staff can insert slots" ON appointment_slots;
DROP POLICY IF EXISTS "Admins and staff can update slots" ON appointment_slots;
DROP POLICY IF EXISTS "Admins can delete slots" ON appointment_slots;

-- Drop old functions
DROP FUNCTION IF EXISTS is_admin_or_staff(UUID);
DROP FUNCTION IF EXISTS is_admin_only(UUID);
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);

-- Create helper functions with SECURITY DEFINER
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

-- Function to check slot availability
CREATE OR REPLACE FUNCTION check_slot_availability(p_slot_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  slot RECORD;
BEGIN
  SELECT * INTO slot
  FROM appointment_slots
  WHERE id = p_slot_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF slot.status != 'available' THEN
    RETURN FALSE;
  END IF;

  IF slot.current_bookings >= slot.max_bookings THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to book a slot (atomic operation)
CREATE OR REPLACE FUNCTION book_slot(p_slot_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  slot RECORD;
  new_status slot_status;
BEGIN
  -- Get current slot state with lock
  SELECT * INTO slot
  FROM appointment_slots
  WHERE id = p_slot_id AND status = 'available'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if still available
  IF slot.current_bookings >= slot.max_bookings THEN
    RETURN FALSE;
  END IF;

  -- Determine new status
  IF slot.current_bookings + 1 >= slot.max_bookings THEN
    new_status := 'booked'::slot_status;
  ELSE
    new_status := 'available'::slot_status;
  END IF;

  -- Increment bookings and update status
  UPDATE appointment_slots
  SET current_bookings = current_bookings + 1,
      status = new_status
  WHERE id = p_slot_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_or_staff(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_only(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_slot_availability(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION book_slot(UUID) TO authenticated;

-- Recreate users table policies (simplified)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Recreate pre_consultations policies
CREATE POLICY "Anyone can create pre-consultations"
  ON pre_consultations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own pre-consultations"
  ON pre_consultations FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins and staff can view all pre-consultations"
  ON pre_consultations FOR SELECT
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can update pre-consultations"
  ON pre_consultations FOR UPDATE
  USING (is_admin_or_staff(auth.uid()));

-- Recreate appointments policies
CREATE POLICY "Anyone can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins and staff can view all appointments"
  ON appointments FOR SELECT
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can update appointments"
  ON appointments FOR UPDATE
  USING (is_admin_or_staff(auth.uid()));

-- Recreate appointment_slots policies
CREATE POLICY "Anyone can view available slots"
  ON appointment_slots FOR SELECT
  USING (status = 'available');

CREATE POLICY "Admins and staff can view all slots"
  ON appointment_slots FOR SELECT
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can insert slots"
  ON appointment_slots FOR INSERT
  WITH CHECK (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can update slots"
  ON appointment_slots FOR UPDATE
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can delete slots"
  ON appointment_slots FOR DELETE
  USING (is_admin_only(auth.uid()));
