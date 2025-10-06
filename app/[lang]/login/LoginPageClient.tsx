'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPageClient({ lang }: { lang: string }) {
  const router = useRouter();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  // Handle wallet connection and user creation
  useEffect(() => {
    const handleUserCreation = async () => {
      if (isConnected && address) {
        // Create or update user profile in Supabase
        if (isSupabaseConfigured()) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', address)
            .single();

          if (!existingUser) {
            // Create new user with default role 'creative'
            await supabase.from('users').insert({
              wallet_address: address,
              role: 'creative',
              display_name: `User ${address.slice(0, 6)}`,
            });
          }
        }

        // Redirect to home page
        router.push(`/${lang}/home`);
      }
    };

    handleUserCreation();
  }, [isConnected, address, lang, router]);

  const handleConnect = () => {
    open();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">
              Welcome to Manantial Blanco
            </h1>
            <p className="text-gray-600">
              Connect your wallet to get started
            </p>
          </div>

          <button
            onClick={handleConnect}
            className="w-full py-4 px-6 bg-black text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors"
          >
            Connect Wallet
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By connecting, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href={`/${lang}/landing`}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              ← Back to Landing Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
