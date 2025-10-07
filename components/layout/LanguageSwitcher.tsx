'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Locale } from '@/types';
import { SECONDARY_COLOR } from '@/lib/constants/colors';

export function LanguageSwitcher({ currentLang }: { currentLang: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLang: Locale) => {
    const newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLanguage('en')}
        className={`text-sm px-2 py-1 rounded transition-colors ${
          currentLang === 'en'
            ? 'text-black'
            : 'text-white'
        }`}
        style={{
          backgroundColor: currentLang === 'en' ? SECONDARY_COLOR : undefined,
          color: currentLang === 'en' ? undefined : '#fff',
        }}
        onMouseEnter={(e) => {
          if (currentLang !== 'en') e.currentTarget.style.color = SECONDARY_COLOR;
        }}
        onMouseLeave={(e) => {
          if (currentLang !== 'en') e.currentTarget.style.color = '#fff';
        }}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('es')}
        className={`text-sm px-2 py-1 rounded transition-colors ${
          currentLang === 'es'
            ? 'text-black'
            : 'text-white'
        }`}
        style={{
          backgroundColor: currentLang === 'es' ? SECONDARY_COLOR : undefined,
          color: currentLang === 'es' ? undefined : '#fff',
        }}
        onMouseEnter={(e) => {
          if (currentLang !== 'es') e.currentTarget.style.color = SECONDARY_COLOR;
        }}
        onMouseLeave={(e) => {
          if (currentLang !== 'es') e.currentTarget.style.color = '#fff';
        }}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  );
}
