import type { FirebaseOptions } from 'firebase/app';

export const requiredFirebaseKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

export function firebaseOptionsFromEnvironment(environment: Record<string, string | undefined>): FirebaseOptions | null {
  const values = requiredFirebaseKeys.map((key) => environment[key]);
  if (values.some((value) => !value)) return null;

  return {
    apiKey: environment.EXPO_PUBLIC_FIREBASE_API_KEY!,
    authDomain: environment.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: environment.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: environment.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    appId: environment.EXPO_PUBLIC_FIREBASE_APP_ID!,
  };
}
