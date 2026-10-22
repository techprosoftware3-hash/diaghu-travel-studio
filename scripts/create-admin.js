/**
 * Script to create admin user in Supabase Auth
 * Run with: node scripts/create-admin.js
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

async function createAdminUser() {
  const adminEmail = 'admin@diaghu.com';
  const adminPassword = 'Diaghu2024!'; // Change this to a secure password
  const adminName = 'DIAGHU Administrator';

  console.log('Creating admin user...');

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
  });

  if (authError) {
    // User might already exist, try to sign in instead
    console.log('User might already exist, checking...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (signInError) {
      console.error('Error signing in:', signInError.message);
      console.log('Please manually create the admin user in Supabase Dashboard > Authentication');
      process.exit(1);
    }

    console.log('Admin user already exists in Supabase Auth');
    const userId = signInData.user.id;

    // 2. Update or create user record in users table
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: adminEmail,
        password_hash: '', // Auth handles password
        full_name: adminName,
        phone: '+593 98 963 23 49',
        role: 'admin',
      });

    if (dbError) {
      console.error('Error updating users table:', dbError);
      process.exit(1);
    }

    console.log('Admin user updated successfully');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('⚠️  IMPORTANT: Change the password immediately after first login!');
  } else {
    console.log('Admin user created in Supabase Auth');
    const userId = authData.user.id;

    // 2. Create user record in users table
    const { error: dbError } = await supabase.from('users').insert({
      id: userId,
      email: adminEmail,
      password_hash: '', // Auth handles password
      full_name: adminName,
      phone: '+593 98 963 23 49',
      role: 'admin',
    });

    if (dbError) {
      console.error('Error creating user record:', dbError);
      process.exit(1);
    }

    console.log('Admin user created successfully');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('⚠️  IMPORTANT: Change the password immediately after first login!');
  }
}

createAdminUser()
  .then(() => {
    console.log('\n✅ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
