-- =============================================
-- Fix User ID for emmanueldorelien@gmail.com
-- =============================================

-- Update the user ID to match Supabase Auth
UPDATE users
SET id = '58da2a89-8f68-427d-9c32-d9c3135b1c2a'
WHERE email = 'emmanueldorelien@gmail.com';
