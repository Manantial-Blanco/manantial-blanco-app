'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { connect } from '@/lib/services/reown';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPageClient({ lang }: { lang: string }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { walletAddress } = await connect();

      // Create or update user profile in Supabase
      if (isSupabaseConfigured()) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single();

        if (!existingUser) {
          // Create new user with default role 'creative'
          await supabase.from('users').insert({
            wallet_address: walletAddress,
            role: 'creative',
            display_name: `User ${walletAddress.slice(0, 6)}`,
          });
        }
      }

      // Redirect to home page
      router.push(`/${lang}/home`);
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full py-4 px-6 bg-black text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
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
