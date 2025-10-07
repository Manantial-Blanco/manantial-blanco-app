'use client';

import { User, ChevronDown } from 'lucide-react';
import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Dictionary, Locale } from '@/types';

interface WalletUserButtonProps {
  dict: Dictionary;
  lang?: Locale;
}

export function WalletUserButton({ dict, lang = 'en' }: WalletUserButtonProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when opened
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    disconnect();
    setIsDropdownOpen(false);
    router.push(`/${lang}/landing`);
  };

  const handleMyWallet = () => {
    setIsDropdownOpen(false);
    open();
  };

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        aria-label={dict.auth.connectWallet}
      >
        <User className="w-5 h-5" />
      </button>
    );
  }

  const dropdownContent = isDropdownOpen && mounted && (
    <div 
      ref={dropdownRef}
      className="fixed w-48 bg-white rounded-lg shadow-lg overflow-hidden z-[100]"
      style={{
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
      }}
    >
      <Link
        href={`/${lang}/home`}
        onClick={() => setIsDropdownOpen(false)}
        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        {dict.auth.myAccount}
      </Link>
      <button
        onClick={handleMyWallet}
        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        {dict.auth.myWallet}
      </button>
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-200 cursor-pointer"
      >
        {dict.common.logout}
      </button>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-center gap-2 w-auto h-10 px-3 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        aria-label={dict.auth.walletConnected}
        aria-expanded={isDropdownOpen}
      >
        <User className="w-5 h-5" />
        {address && (
          <span className="text-sm font-medium">
            {address.slice(0, 4)}...{address.slice(-4)}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {mounted && typeof document !== 'undefined' && createPortal(
        dropdownContent,
        document.body
      )}
    </>
  );
}
