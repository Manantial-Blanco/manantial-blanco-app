'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const currentOption = languageOptions.find(opt => opt.lang === currentLang) || languageOptions[0];

  const switchLanguage = (newLang: Locale) => {
    const newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPath);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50">
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
      )}
    </div>
  );
}
