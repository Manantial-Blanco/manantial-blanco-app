'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Locale } from '@/types';

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
            ? 'bg-[#F1E7D3] text-black'
            : 'text-white hover:text-[#F1E7D3]'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('es')}
        className={`text-sm px-2 py-1 rounded transition-colors ${
          currentLang === 'es'
            ? 'bg-[#F1E7D3] text-black'
            : 'text-white hover:text-[#F1E7D3]'
        }`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  );
}
