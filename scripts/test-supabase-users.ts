/**
 * Script to test Supabase users table access
 * Tests if we can read/write to the users table with current RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseAccess() {
  console.log('🔍 Testing Supabase Users Table Access\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Using anon key:', supabaseAnonKey.substring(0, 20) + '...\n');

  // Test 1: Read all users (should work - policy allows SELECT for everyone)
  console.log('Test 1: Reading all users...');
  const { data: allUsers, error: readError } = await supabase
    .from('users')
    .select('*')
    .limit(5);

  if (readError) {
    console.error('❌ Read Error:', readError);
  } else {
    console.log('✅ Read Success - Found', allUsers?.length || 0, 'users');
    if (allUsers && allUsers.length > 0) {
      console.log('Sample user:', JSON.stringify(allUsers[0], null, 2));
    }
  }

  // Test 2: Try to insert a test user (will likely fail due to RLS)
  console.log('\nTest 2: Trying to insert a test user...');
  const testWallet = '0xTEST' + Date.now();
  const { data: insertData, error: insertError } = await supabase
    .from('users')
    .insert({
      wallet_address: testWallet,
      email: `test${Date.now()}@example.com`,
      display_name: 'Test User'
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Insert Error:', insertError.message);
    console.log('Error Code:', insertError.code);
    console.log('Error Details:', insertError.details);
    console.log('Error Hint:', insertError.hint);

    if (insertError.code === '42501' || insertError.message.includes('policy')) {
      console.log('\n⚠️  RLS POLICY ISSUE DETECTED');
      console.log('The current RLS policies require JWT claims with wallet_address.');
      console.log('The anonymous key cannot insert/update users because it lacks these claims.');
      console.log('\nPossible solutions:');
      console.log('1. Modify RLS policies to allow anon inserts/updates');
      console.log('2. Use service role key (server-side only)');
      console.log('3. Implement proper authentication with JWT');
    }
  } else {
    console.log('✅ Insert Success:', insertData);
  }

  // Test 3: Try to update a user (will also likely fail due to RLS)
  if (allUsers && allUsers.length > 0) {
    console.log('\nTest 3: Trying to update an existing user...');
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ display_name: 'Updated Name' })
      .eq('wallet_address', allUsers[0].wallet_address)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update Error:', updateError.message);
    } else {
      console.log('✅ Update Success:', updateData);
    }
  }

  console.log('\n📊 Summary:');
  console.log('- READ access: ' + (readError ? '❌ Failed' : '✅ Working'));
  console.log('- INSERT access: ' + (insertError ? '❌ Failed (RLS policy)' : '✅ Working'));
}

testSupabaseAccess().catch(console.error);
