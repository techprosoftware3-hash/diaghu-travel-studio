-- Add rejection_reason field to pre_consultations table
ALTER TABLE pre_consultations
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
