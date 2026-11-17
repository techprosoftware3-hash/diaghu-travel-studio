-- Add intake answers and payment proof to chat conversations
ALTER TABLE chat_conversations
ADD COLUMN IF NOT EXISTS intake_answers JSONB,
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Update RLS policies to allow staff to view intake and payment info
DROP POLICY IF EXISTS "Staff and admin can view all chat conversations" ON chat_conversations;

CREATE POLICY "Staff and admin can view all chat conversations"
  ON chat_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );

-- Allow staff to update intake and payment info
DROP POLICY IF EXISTS "Staff and admin can update chat conversations" ON chat_conversations;

CREATE POLICY "Staff and admin can update chat conversations"
  ON chat_conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );
