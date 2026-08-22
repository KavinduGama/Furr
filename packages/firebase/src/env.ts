// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Environment & Dev Bypass Helper (CRIT-006)
// ─────────────────────────────────────────────────────────────

const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';

/**
 * Dev bypass is strictly disabled in production environments (CRIT-006).
 * Fails closed to prevent accidental authentication/mock data bypass in production builds.
 */
export const IS_DEV_BYPASS: boolean =
  !isProduction &&
  typeof process !== 'undefined' &&
  (
    process.env?.EXPO_PUBLIC_DEV_BYPASS === 'true' ||
    process.env?.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    (!process.env?.EXPO_PUBLIC_FIREBASE_API_KEY && !process.env?.NEXT_PUBLIC_FIREBASE_API_KEY)
  );
