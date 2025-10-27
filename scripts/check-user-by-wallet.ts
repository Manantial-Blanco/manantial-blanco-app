/**
 * Script to check if a user exists in Supabase by wallet address
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Wallet address from the screenshot
const walletAddress = '0xf4d58853757F6a140B208b1DC58F1d96af66d70';

async function checkUser() {
  console.log('🔍 Checking user for wallet:', walletAddress);
  console.log('');

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (userError) {
    console.error('❌ Error:', userError.message);
    console.log('This wallet is NOT registered in Supabase');
    console.log('');
    console.log('💡 Solution: User needs to:');
    console.log('1. Connect wallet');
    console.log('2. Complete the registration modal (enter name and email)');
    console.log('3. Then mint the IP Asset again');
  } else if (userData) {
    console.log('✅ User found!');
    console.log('');
    console.log('User data:');
    console.log('  - Display Name:', userData.display_name || '(not set)');
    console.log('  - Email:', userData.email || '(not set)');
    console.log('  - Wallet:', userData.wallet_address);
    console.log('  - Created:', userData.created_at);
  }
}

checkUser().catch(console.error);
