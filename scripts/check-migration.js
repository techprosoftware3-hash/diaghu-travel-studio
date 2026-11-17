/**
 * Script to check if chat_conversations table exists
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

async function checkMigration() {
  console.log('Checking if chat_conversations table exists...');

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('id')
    .limit(1);

  if (error) {
    console.error('❌ Migration not applied. Table does not exist.');
    console.error('Error:', error.message);
    console.log('\n⚠️  Please apply the migration manually:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and execute the content of: supabase/migrations/015_add_chat_conversations.sql');
    process.exit(1);
  }

  console.log('✅ Migration applied successfully! Table exists.');
  process.exit(0);
}

checkMigration().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
