/**
 * Script to fix user ID mismatch between Supabase Auth and users table
 * Run with: node scripts/fix-user-id.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixUserId() {
  const email = 'emmanueldorelien@gmail.com';

  console.log('Fetching user from Supabase Auth...');
  console.log('Note: You need to be logged in for this to work');
  console.log('\nIf this fails, please manually update in Supabase Dashboard:');
  console.log('1. Go to Authentication > Users');
  console.log('2. Copy the User ID for', email);
  console.log('3. Go to Table Editor > users');
  console.log('4. Update the id field with the User ID from step 2');

  // Try to get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('\nError: No user logged in');
    console.log('Please log in first, then run this script again');
    console.log('\nOr manually update the ID in Supabase Dashboard as shown above');
    process.exit(1);
  }

  console.log('\nFound logged in user:');
  console.log('  ID:', user.id);
  console.log('  Email:', user.email);

  if (user.email !== email) {
    console.log('\nWarning: Logged in user email does not match target email');
    console.log('Target:', email);
    console.log('Logged in:', user.email);
  }

  // 2. Update the users table
  console.log('\nUpdating users table...');

  const { error: updateError } = await supabase
    .from('users')
    .update({ id: user.id })
    .eq('email', email);

  if (updateError) {
    console.error('Error updating users table:', updateError);
    process.exit(1);
  }

  console.log('✅ User ID updated successfully!');
  console.log('\nPlease refresh your browser to see the admin dashboard.');
}

fixUserId()
  .then(() => {
    console.log('\n✅ Fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
