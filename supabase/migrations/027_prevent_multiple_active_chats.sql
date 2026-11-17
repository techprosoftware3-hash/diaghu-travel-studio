-- =============================================
-- Prevent users from having multiple active conversations
-- =============================================
-- This migration adds a partial unique index to ensure a user can only have
-- one active conversation at a time (status = 'active' or 'escalated')

-- First, clean up existing duplicate active conversations
-- For each user with multiple active conversations, keep only the most recent one
WITH ranked_conversations AS (
  SELECT
    id,
    user_id,
    status,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at DESC
    ) as rn
  FROM chat_conversations
  WHERE user_id IS NOT NULL
  AND status IN ('active', 'escalated')
)
UPDATE chat_conversations
SET status = 'closed'
WHERE id IN (
  SELECT id FROM ranked_conversations WHERE rn > 1
);

-- Create a partial unique index on user_id for active conversations
-- This prevents a user from having multiple conversations with status 'active' or 'escalated'
CREATE UNIQUE INDEX idx_user_active_conversation
  ON chat_conversations (user_id)
  WHERE user_id IS NOT NULL
  AND status IN ('active', 'escalated');

-- Add a comment to explain the purpose
COMMENT ON INDEX idx_user_active_conversation IS 'Prevents users from having multiple active conversations simultaneously';
