'use client';

import { User } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

export function WalletUserButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const handleClick = () => {
    open();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-colors"
      aria-label={isConnected ? 'Wallet connected' : 'Connect wallet'}
    >
      {isConnected && address ? (
        // Show a simple avatar when connected (you can enhance this with actual user avatar from Reown)
        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-medium">
          {address.slice(2, 4).toUpperCase()}
        </div>
      ) : (
        <User className="w-5 h-5" />
      )}
    </button>
  );
}
