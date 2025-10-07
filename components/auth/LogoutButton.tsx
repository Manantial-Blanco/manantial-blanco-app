'use client';

import { useRouter } from 'next/navigation';
import { useDisconnect } from '@reown/appkit/react';
import { Locale } from '@/types';
import { LogOut } from 'lucide-react';

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
      className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#F1E7D3] transition-colors"
      aria-label="Logout"
    >
      <LogOut className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
