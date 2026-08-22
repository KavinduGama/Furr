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
export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

// ── Typography scale ─────────────────────────────────────────
// One place for type. Spread into Text styles: `...typography.heading`.

export const typography = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -1.2 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.7 },
  heading: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  subheading: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
  micro: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
} as const;

// ── Moment hues ──────────────────────────────────────────────
// Semantic color families for activity surfaces (meal, walk, vet...).
// `icon` is the strong hue for icons/values, `soft` its tinted background.

export const moments = {
  meal:   { icon: '#EA580C', soft: '#FFF7ED' },
  walk:   { icon: '#2563EB', soft: '#EFF6FF' },
  vet:    { icon: '#059669', soft: '#ECFDF5' },
  social: { icon: colors.brand, soft: colors.softBrand },
  health: { icon: '#0E7490', soft: '#ECFEFF' },
  alert:  { icon: colors.accent, soft: '#FEF3C7' },
  adopt:  { icon: '#7E22CE', soft: '#F3E8FF' },
} as const;

export type MomentName = keyof typeof moments;

// ── Gradient stops ───────────────────────────────────────────
// Stop pairs for hero surfaces; usable with expo-linear-gradient or manual layering.

export const gradients = {
  brand: [colors.brand, colors.brandSoft],
  sunset: [colors.brandSoft, '#FDBA74'],
  mint: [colors.success, '#6EE7B7'],
} as const;

// ── Motion presets ───────────────────────────────────────────

export const motion = {
  spring: { damping: 16, stiffness: 220 },
  springSoft: { damping: 20, stiffness: 160 },
  durationFast: 150,
  durationBase: 300,
  durationSlow: 600,
} as const;

export const shadows = {
  none: { elevation: 0, shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
  sm: { elevation: 1, shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 },
  md: { elevation: 2, shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
  lg: { elevation: 3, shadowColor: '#111827', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16 },
  xl: { elevation: 4, shadowColor: '#111827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20 },
} as const;
