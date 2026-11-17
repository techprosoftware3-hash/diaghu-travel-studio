/**
 * Script to create staff user in Supabase Auth
 * Run with: node scripts/create-staff.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createStaffUser() {
  const staffEmail = 'staff@diaghu.com';
  const staffPassword = 'Staff2024!'; // Change this to a secure password
  const staffName = 'DIAGHU Staff';

  console.log('Creating staff user...');

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: staffEmail,
    password: staffPassword,
  });

  if (authError) {
    // User might already exist, try to sign in instead
    console.log('User might already exist, checking...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: staffEmail,
      password: staffPassword,
    });

    if (signInError) {
      console.error('Error signing in:', signInError.message);
      console.log('Please manually create the staff user in Supabase Dashboard > Authentication');
      process.exit(1);
    }

    console.log('Staff user already exists in Supabase Auth');
    const userId = signInData.user.id;

    // 2. Update or create user record in users table
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: staffEmail,
        password_hash: '', // Auth handles password
        full_name: staffName,
        phone: '+593 98 963 23 50',
        role: 'staff',
      });

    if (dbError) {
      console.error('Error updating users table:', dbError);
      process.exit(1);
    }

    console.log('Staff user updated successfully');
    console.log('Email:', staffEmail);
    console.log('Password:', staffPassword);
    console.log('⚠️  IMPORTANT: Change the password immediately after first login!');
  } else {
    console.log('Staff user created in Supabase Auth');
    const userId = authData.user.id;

    // 2. Create user record in users table
    const { error: dbError } = await supabase.from('users').insert({
      id: userId,
      email: staffEmail,
      password_hash: '', // Auth handles password
      full_name: staffName,
      phone: '+593 98 963 23 50',
      role: 'staff',
    });

    if (dbError) {
      console.error('Error creating user record:', dbError);
      process.exit(1);
    }

    console.log('Staff user created successfully');
    console.log('Email:', staffEmail);
    console.log('Password:', staffPassword);
    console.log('⚠️  IMPORTANT: Change the password immediately after first login!');
  }
}

createStaffUser()
  .then(() => {
    console.log('\n✅ Staff user setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
