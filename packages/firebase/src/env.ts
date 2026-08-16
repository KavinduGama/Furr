// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Environment & Dev Bypass Helper
// ─────────────────────────────────────────────────────────────

export const IS_DEV_BYPASS: boolean =
  typeof process !== 'undefined' &&
  !process.env?.EXPO_PUBLIC_FIREBASE_API_KEY &&
  !process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;
