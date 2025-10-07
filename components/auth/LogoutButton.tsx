'use client';

import { useRouter } from 'next/navigation';
import { useDisconnect } from '@reown/appkit/react';
import { Locale } from '@/types';
import { LogOut } from 'lucide-react';
import { SECONDARY_COLOR } from '@/lib/constants/colors';

interface LogoutButtonProps {
  lang: Locale;
  label?: string;
}

export function LogoutButton({ lang, label = 'Logout' }: LogoutButtonProps) {
  const router = useRouter();
  const { disconnect } = useDisconnect();

  const handleLogout = () => {
    // Disconnect the wallet
    disconnect();
    
    // Redirect to landing page
    router.push(`/${lang}/landing`);
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-white transition-colors"
      aria-label="Logout"
      onMouseEnter={(e) => (e.currentTarget.style.color = SECONDARY_COLOR)}
      onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}
    >
      <LogOut className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
