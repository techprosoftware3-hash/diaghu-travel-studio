-- =============================================
-- Add Appointment Slots (Turnos) Table
-- =============================================

-- Appointment slots status enum
CREATE TYPE slot_status AS ENUM ('available', 'booked', 'cancelled');

-- Appointment slots table
CREATE TABLE appointment_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  status slot_status DEFAULT 'available',
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for querying available slots
CREATE INDEX idx_appointment_slots_date ON appointment_slots(slot_date);
CREATE INDEX idx_appointment_slots_status ON appointment_slots(status);
CREATE INDEX idx_appointment_slots_date_status ON appointment_slots(slot_date, status);

-- Add trigger for updated_at
CREATE TRIGGER update_appointment_slots_updated_at
  BEFORE UPDATE ON appointment_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin or staff (bypasses RLS)
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

-- Create function to check if user is admin (bypasses RLS)
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

-- RLS policies for appointment slots
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

-- Add slot_id to pre_consultations table
ALTER TABLE pre_consultations
ADD COLUMN IF NOT EXISTS slot_id UUID REFERENCES appointment_slots(id) ON DELETE SET NULL;

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
BEGIN
  -- Get current slot state
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

  -- Increment bookings and update status
  UPDATE appointment_slots
  SET current_bookings = current_bookings + 1,
      status = CASE
        WHEN current_bookings + 1 >= max_bookings THEN 'booked'
        ELSE 'available'
      END
  WHERE id = p_slot_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_slot_availability(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION book_slot(UUID) TO authenticated;
