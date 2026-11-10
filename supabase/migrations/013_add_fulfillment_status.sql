-- Add fulfillment status to pre_consultations table
-- This will track whether a consultation was fulfilled or unfulfilled

ALTER TABLE pre_consultations
ADD COLUMN fulfillment_status VARCHAR(20) DEFAULT NULL CHECK (fulfillment_status IN ('fulfilled', 'unfulfilled'));

-- Add column to track when fulfillment status was set
ALTER TABLE pre_consultations
ADD COLUMN fulfillment_status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Function to automatically mark consultations as unfulfilled if scheduled date has passed
CREATE OR REPLACE FUNCTION check_unfulfilled_consultations()
RETURNS VOID AS $$
BEGIN
  UPDATE pre_consultations
  SET 
    fulfillment_status = 'unfulfilled',
    fulfillment_status_changed_at = NOW()
  WHERE 
    scheduled_date IS NOT NULL 
    AND scheduled_date < CURRENT_DATE
    AND status IN ('approved', 'rescheduled')
    AND fulfillment_status IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to mark consultation as fulfilled
CREATE OR REPLACE FUNCTION mark_consultation_fulfilled(p_consultation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pre_consultations
  SET 
    fulfillment_status = 'fulfilled',
    fulfillment_status_changed_at = NOW()
  WHERE id = p_consultation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to mark consultation as unfulfilled manually
CREATE OR REPLACE FUNCTION mark_consultation_unfulfilled(p_consultation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pre_consultations
  SET 
    fulfillment_status = 'unfulfilled',
    fulfillment_status_changed_at = NOW()
  WHERE id = p_consultation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
