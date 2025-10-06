'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { Locale } from '@/types';

interface WalletAuthRedirectProps {
  lang: Locale;
}

export function WalletAuthRedirect({ lang }: WalletAuthRedirectProps) {
  const { isConnected } = useAppKitAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      // Redirect to home page when wallet is connected
      router.push(`/${lang}/home`);
    }
  }, [isConnected, lang, router]);

  return null; // This component doesn't render anything
}
