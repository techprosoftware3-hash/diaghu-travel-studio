-- Add payment support fields to pre_consultations table
ALTER TABLE pre_consultations
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Grant permissions on the bucket
CREATE POLICY "Public read access for payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');

CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Users can only upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update status enum constraint
ALTER TABLE pre_consultations
DROP CONSTRAINT IF EXISTS pre_consultations_status_check;

ALTER TABLE pre_consultations
ADD CONSTRAINT pre_consultations_status_check
CHECK (status IN ('pending', 'approved', 'rejected', 'rescheduled', 'completed'));
