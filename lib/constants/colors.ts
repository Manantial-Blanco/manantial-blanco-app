/**
 * Brand Color Constants
 * Centralized color definitions for consistent theming across the application
 */

export const BRAND_COLORS = {
  primary: '#486B91',
  primaryHover: '#3a5573',
  secondary: '#F1E7D3',
  black: '#000000',
  white: '#ffffff',
} as const;

// Legacy exports for backward compatibility
export const PRIMARY_COLOR = BRAND_COLORS.primary;
export const PRIMARY_COLOR_HOVER = BRAND_COLORS.primaryHover;
export const SECONDARY_COLOR = BRAND_COLORS.secondary;
