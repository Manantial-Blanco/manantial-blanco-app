import { Locale, Dictionary } from '@/types';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';

const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}

export function isValidLocale(locale: string): locale is Locale {
  return locale === 'en' || locale === 'es';
}
