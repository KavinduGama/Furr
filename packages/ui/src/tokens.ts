export const colors = {
  ink: '#111827',
  muted: '#6B7280',
  canvas: '#F9FAFB',
  surface: '#FFFFFF',
  line: '#E5E7EB',
  brand: '#7B61FF',
  brandDark: '#5A3EE5', // Darker purple for pressed states
  brandSoft: '#876EFA', // Lighter purple for gradients/secondary
  accent: '#F59E0B',    // Orange/yellow from the image
  success: '#22C55E',   // Green from the image
  danger: '#EF4444',    // Standard red
  softBrand: '#F0EDFF', // Very light purple for backgrounds/tags
  pearl: '#F3F4F6',     // Light gray for neutral backgrounds
  mist: '#F9FAFB',      // Same as canvas, for subtle backgrounds
  warm: '#FFFBEB',      // Soft yellow background for notes
  onBrand: '#FFFFFF',
  calm: '#E0FAEB',      // Soft green background
} as const;

export const radius = { sm: 12, md: 16, lg: 24, xl: 32, pill: 999 } as const;
export const space = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
