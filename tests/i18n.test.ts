import { describe, it, expect } from 'vitest';
import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';

describe('i18n', () => {
  it('should return English dictionary for "en" locale', () => {
    const dict = getDictionary('en');
    expect(dict.common.home).toBe('Home');
    expect(dict.landing.heroTitle).toBe('Register, remix and monetize your art');
  });

  it('should return Spanish dictionary for "es" locale', () => {
    const dict = getDictionary('es');
    expect(dict.common.home).toBe('Inicio');
    expect(dict.landing.heroTitle).toBe('Registra, remezcla y monetiza tu arte');
  });

  it('should validate locale correctly', () => {
    expect(isValidLocale('en')).toBe(true);
    expect(isValidLocale('es')).toBe(true);
    expect(isValidLocale('fr')).toBe(false);
    expect(isValidLocale('invalid')).toBe(false);
  });

  it('should fallback to English for invalid locale', () => {
    const dict = getDictionary('invalid' as any);
    expect(dict.common.home).toBe('Home');
  });
});
