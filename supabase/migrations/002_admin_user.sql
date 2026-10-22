-- =============================================
-- Create Default Admin User
-- =============================================

-- Note: Replace the password_hash with a properly hashed password
-- Use bcrypt or similar to hash the password before inserting
-- Default password should be changed immediately after first login

INSERT INTO users (email, password_hash, full_name, phone, role)
VALUES (
  'admin@diaghu.com',
  '$2b$12$placeholder_hash_replace_with_actual_bcrypt_hash',
  'DIAGHU Administrator',
  '+593 98 963 23 49',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Instructions for password hashing:
-- 1. Install bcrypt: npm install bcryptjs
-- 2. Use the following code to hash your password:
-- 
-- const bcrypt = require('bcryptjs');
-- const password = 'your_secure_password';
-- const hash = bcrypt.hashSync(password, 12);
-- console.log(hash);
-- 
-- 3. Replace the placeholder_hash above with the generated hash
-- 4. Change the default password immediately after first login
