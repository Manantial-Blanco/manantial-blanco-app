'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Globe } from 'lucide-react';
import { Locale } from '@/types';

interface LanguageOption {
  lang: Locale;
  label: string;
  currency: string;
}

const languageOptions: LanguageOption[] = [
  { lang: 'es', label: 'Español', currency: 'MXN' },
  { lang: 'en', label: 'English', currency: 'USD' },
];

export function LanguageDropdown({ currentLang }: { currentLang: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const currentOption = languageOptions.find(opt => opt.lang === currentLang) || languageOptions[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLanguage = (newLang: Locale) => {
    const newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPath);
    setIsOpen(false);
  };

  const handleToggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonRect(rect);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const dropdownContent = isOpen && mounted && buttonRect && (
    <div 
      ref={dropdownRef}
      className="fixed w-48 bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden z-[99999]"
      style={{
        top: buttonRect.bottom + 8,
        right: window.innerWidth - buttonRect.right,
      }}
    >
      {languageOptions.map((option) => (
        <button
          key={option.lang}
          onClick={() => switchLanguage(option.lang)}
          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors ${
            option.lang === currentLang ? 'bg-gray-50 font-medium' : ''
          }`}
        >
          <span className="text-black">
            {option.label} - {option.currency}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        className="flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5" />
      </button>

      {mounted && typeof document !== 'undefined' && createPortal(
        dropdownContent,
        document.body
      )}
    </>
  );
}
