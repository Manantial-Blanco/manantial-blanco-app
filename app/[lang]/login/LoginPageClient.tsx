'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Dictionary, Locale } from '@/types';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { useUserProfile, useUserEmail } from '@/lib/services/reown';

interface LoginPageClientProps {
  lang: Locale;
  dict: Dictionary;
}

export default function LoginPageClient({ lang, dict }: LoginPageClientProps) {
  const router = useRouter();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  
  // Get user profile data - ready to use anywhere
  const userProfile = useUserProfile();
  const userEmail = useUserEmail();

  // Handle wallet connection and user creation
  useEffect(() => {
    const handleUserCreation = async () => {
      if (isConnected && address) {
        // Check if user exists in Supabase users table
        if (isSupabaseConfigured()) {
          const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', address)
            .single();

          if (existingUser) {
            // User already exists
          } else {
            // Create new user
            const { data: newUser, error: insertError } = await supabase.from('users').insert({
              wallet_address: address,
              display_name: `User ${address.slice(0, 6)}`,
            }).select().single();
          }
        }

        // Redirect to home page
        router.push(`/${lang}/home`);
      }
    };

    handleUserCreation();
  }, [isConnected, address, lang, router, userEmail, userProfile]);

  const handleConnect = () => {
    open();
  };

  return (
    <>
      <NavigationHeader lang={lang} dict={dict} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-black mb-2">
                {dict.auth.welcome}
              </h1>
              <p className="text-gray-600">
                {dict.auth.getStarted}
              </p>
            </div>

            <button
              onClick={handleConnect}
              className="w-full py-4 px-6 bg-black text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors"
            >
              {dict.auth.connectWallet}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {dict.auth.termsAgreement}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <a
                href={`/${lang}/landing`}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                {dict.auth.backToLanding}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
