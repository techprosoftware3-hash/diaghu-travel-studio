-- Add DELETE policy for pre_consultations table
-- This allows admins to delete rejected consultations

CREATE POLICY "Admins can delete pre-consultations"
  ON pre_consultations FOR DELETE
  USING (is_admin_only(auth.uid()));
