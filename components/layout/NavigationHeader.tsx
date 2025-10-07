'use client';

import { Search, X, ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Dictionary, Locale } from '@/types';
import { useAppKitAccount } from '@reown/appkit/react';
import { LanguageDropdown } from '@/components/layout/LanguageDropdown';
import { WalletUserButton } from '@/components/layout/WalletUserButton';

interface NavigationHeaderProps {
  dict: Dictionary;
  lang: Locale;
  showPromoBar?: boolean;
  onClosePromoBar?: () => void;
}

export function NavigationHeader({ 
  dict, 
  lang, 
  showPromoBar = false, 
  onClosePromoBar 
}: NavigationHeaderProps) {
  const { isConnected } = useAppKitAccount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  return (
    <>
      <style jsx>{`
        .nav-link {
          font-weight: 500;
          font-size: 15px;
          line-height: 20px;
          letter-spacing: 0%;
        }
        .promo-banner-text {
          font-weight: 500;
          font-size: 13px;
          line-height: 16px;
          letter-spacing: 0;
          text-align: center;
        }
      `}</style>
      {/* Promo Banner */}
      {showPromoBar && (
        <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2" style={{ backgroundColor: '#F1E7D3' }}>
          <p className="promo-banner-text text-accent-foreground">
            {dict.landing.promoBanner}
          </p>
          <button
            onClick={onClosePromoBar}
            className="absolute right-4 sm:right-6 lg:right-8 w-6 h-6 flex items-center justify-center cursor-pointer"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Header Navigation */}
      <header className="bg-black text-white sticky top-0 z-50 w-full max-w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="flex items-center justify-between h-16 w-full max-w-full">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo */}
            <Link href={`/${lang}/landing`} className="flex items-center">
              <Image
                src="/images/MB-logo-01.png"
                alt="Manantial Blanco Logo"
                width={32}
                height={32}
              />
            </Link>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <Link href={isConnected ? `/${lang}/home` : `/${lang}/login`} className="nav-link flex items-center gap-1 hover:text-accent transition-colors">
                {dict.landing.registerCTA}
                <ChevronDown className="w-4 h-4" />
              </Link>
              <a href="#catalog" className="nav-link flex items-center gap-1 hover:text-accent transition-colors">
                {dict.landing.exploreCTA}
                <ChevronDown className="w-4 h-4" />
              </a>
              <Link href="#" className="nav-link flex items-center gap-1 hover:text-accent transition-colors">
                {dict.common.about}
                <ChevronDown className="w-4 h-4" />
              </Link>
              <Link href="#" className="nav-link flex items-center gap-1 hover:text-accent transition-colors">
                {dict.common.contact}
              </Link>
            </nav>

            {/* Icons - Search, User, Globe */}
            <div className="flex items-center gap-2">
              <button
                className="hidden lg:flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <div className="hidden lg:block">
                <WalletUserButton dict={dict} lang={lang} />
              </div>
              <div className="hidden lg:block">
                <LanguageDropdown currentLang={lang} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile menu content */}
            <div className="lg:hidden relative z-50 bg-black border-t border-white/10 transform transition-all duration-200 ease-in-out">
              <div className="container mx-auto px-4 py-4">
                <nav className="flex flex-col gap-4">
                  <Link 
                    href={isConnected ? `/${lang}/home` : `/${lang}/login`} 
                    className="nav-link flex items-center gap-1 hover:text-accent transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {dict.landing.registerCTA}
                    <ChevronDown className="w-4 h-4" />
                  </Link>
                  <a 
                    href="#catalog" 
                    className="nav-link flex items-center gap-1 hover:text-accent transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {dict.landing.exploreCTA}
                    <ChevronDown className="w-4 h-4" />
                  </a>
                  <Link 
                    href="#" 
                    className="nav-link flex items-center gap-1 hover:text-accent transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {dict.common.about}
                    <ChevronDown className="w-4 h-4" />
                  </Link>
                  <Link 
                    href="#" 
                    className="nav-link flex items-center gap-1 hover:text-accent transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {dict.common.contact}
                  </Link>
                </nav>
                
                {/* Mobile Menu Footer with Search, User, Language */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                  <button
                    className="flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <WalletUserButton dict={dict} lang={lang} />
                    <LanguageDropdown currentLang={lang} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
