-- =============================================
-- Security Improvements for Chat System
-- =============================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can create chat messages" ON chat_messages;

-- Drop existing policies before recreating
DROP POLICY IF EXISTS "Users can view own chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can update own chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON chat_messages;

-- Users can only view their own conversations (by session_id or user_id)
CREATE POLICY "Users can view own chat conversations"
  ON chat_conversations FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM chat_conversations
      WHERE user_id IS NULL
      LIMIT 1
    )
    OR user_id::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'staff')
    )
  );

-- Users can only update their own conversations (for language preference)
CREATE POLICY "Users can update own chat conversations"
  ON chat_conversations FOR UPDATE
  USING (
    user_id::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'staff')
    )
  );

-- Users can only create messages in their own conversations
CREATE POLICY "Users can create messages in own conversations"
  ON chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM chat_conversations
      WHERE user_id::text = auth.uid()::text
      OR (user_id IS NULL AND session_id IN (
        SELECT session_id FROM chat_conversations
        WHERE user_id IS NULL
        LIMIT 1
      ))
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'staff')
    )
  );

-- Users can only view messages in their own conversations
CREATE POLICY "Users can view messages in own conversations"
  ON chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations
      WHERE user_id::text = auth.uid()::text
      OR (user_id IS NULL AND session_id IN (
        SELECT session_id FROM chat_conversations
        WHERE user_id IS NULL
        LIMIT 1
      ))
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'staff')
    )
  );

-- Update payment-proofs bucket policies to be more restrictive
DROP POLICY IF EXISTS "Authenticated users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can only upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload payment proofs to own conversation" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own payment proofs" ON storage.objects;

-- New policy: Users can upload to their conversation folder only
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
        AND user_id::text = auth.uid()::text
      )
    )
  );

-- Keep public read for payment proofs (for staff to download)
CREATE POLICY "Public read access for payment proofs"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'payment-proofs');

-- Users can only delete their own payment proofs
CREATE POLICY "Users can delete own payment proofs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
