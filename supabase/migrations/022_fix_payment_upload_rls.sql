-- =============================================
-- Fix Payment Upload RLS Policy
-- =============================================

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own chat conversations" ON chat_conversations;

-- Recreate with session_id support for claiming ownership
CREATE POLICY "Users can update own chat conversations"
  ON chat_conversations FOR UPDATE
  USING (
    user_id::text = auth.uid()::text
    OR (
      user_id IS NULL
      AND session_id IN (
        SELECT session_id FROM chat_conversations
        WHERE user_id IS NULL
        LIMIT 1
      )
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'staff')
    )
  );

-- Update storage policy to allow users to upload to conversation folder
-- even if conversation doesn't have user_id yet (session-based)
DROP POLICY IF EXISTS "Users can upload payment proofs to own conversation" ON storage.objects;

CREATE POLICY "Users can upload payment proofs to own conversation"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM chat_conversations
        WHERE id::text = (storage.foldername(name))[1]
        AND (
          user_id::text = auth.uid()::text
          OR (
            user_id IS NULL
            AND session_id IN (
              SELECT session_id FROM chat_conversations
              WHERE user_id IS NULL
              LIMIT 1
            )
          )
        )
      )
    )
  );
