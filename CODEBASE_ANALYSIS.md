# FURR Platform - Complete Codebase Analysis

**Date:** 2026-08-16  
**Scope:** Full monorepo audit (147 source files across 4 apps + 3 shared packages)  
**Severity Scale:** CRITICAL > HIGH > MEDIUM > LOW

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Critical Security Vulnerabilities](#critical-security-vulnerabilities)
3. [Bugs](#bugs)
4. [Missing Implementations](#missing-implementations)
5. [Code Quality Issues](#code-quality-issues)
6. [Performance Issues](#performance-issues)
7. [Accessibility Issues](#accessibility-issues)
8. [Testing & CI/CD Gaps](#testing--cicd-gaps)
9. [Firebase-Specific Issues](#firebase-specific-issues)
10. [Recommendations Priority Matrix](#recommendations-priority-matrix)

---

## Architecture Overview

```
FURR-PRODUCT/ (pnpm monorepo)
├── apps/
│   ├── furr-owner/    (Expo/React Native - Pet owner mobile app)
│   ├── furr-vet/      (Next.js 16 - Veterinary portal)
│   ├── furr-admin/    (Next.js 16 - Admin operations portal)
│   └── furr-clinic/   (Placeholder - not implemented)
├── packages/
│   ├── core/          (Domain types, validation, constants)
│   ├── firebase/      (Firebase services, queries, auth)
│   └── ui/            (Shared React Native components)
└── firebase/
    └── firestore.rules
```

---

## Critical Security Vulnerabilities

### SEC-001: 16 Firestore Collections Have NO Security Rules (CRITICAL)

**Impact:** Any authenticated user can read/write ALL data in these collections.  
**Location:** `firebase/firestore.rules` vs `packages/firebase/src/*.ts`

The Firestore rules only protect subcollections under `/users/{uid}/...`. However, the code uses many **root-level collections** with zero protection:

| Collection | File | Risk |
|---|---|---|
| `routines` | `packages/firebase/src/routines.ts:19` | Any user can CRUD any user's routines |
| `expenses` | `packages/firebase/src/expenses.ts:24` | Financial data exposed |
| `community_meetups` | `packages/firebase/src/community.ts:158` | Spam/abuse |
| `community_questions` | `packages/firebase/src/community.ts:198` | Spam/abuse |
| `care_feeding_schedules` | `packages/firebase/src/care.ts:94` | Cross-user data access |
| `care_walk_activities` | `packages/firebase/src/care.ts:137` | Location data exposed |
| `family_members` | `packages/firebase/src/family.ts:87` | Family data exposed |
| `insurance_policies` | `packages/firebase/src/family.ts:130` | Sensitive insurance data |
| `lost_pet_alerts` | `packages/firebase/src/lostfound.ts:79` | PII (phone, address) |
| `found_pet_reports` | `packages/firebase/src/lostfound.ts:118` | PII exposed |
| `marketplace_products` | `packages/firebase/src/marketplace.ts:139` | Price manipulation |
| `marketplace_orders` | `packages/firebase/src/marketplace.ts:200` | Order data exposed |
| `service_providers` | `packages/firebase/src/services.ts:158` | Provider data tampering |
| `service_bookings` | `packages/firebase/src/services.ts:218` | Booking data exposed |
| `telemedicine_consultations` | `packages/firebase/src/telemedicine.ts:93` | Medical data! |
| `telemedicine_messages` | `packages/firebase/src/telemedicine.ts:144` | Private messages |

**Consequence:** Without rules, Firestore's default deny is active (which blocks access). BUT if any admin has toggled "allow all" during development, all data is exposed. The code clearly expects these collections to be accessible, meaning rules MUST be deployed for them to work.

---

### SEC-002: No Server-Side Authentication on Web Portals (CRITICAL)

**Location:** `apps/furr-admin/src/components/AdminGate.tsx`, `apps/furr-vet/src/context/auth.tsx`

**Issue:** Both Next.js apps rely **entirely** on client-side JavaScript for authentication. There is:
- No `middleware.ts` in either app
- No server-side session validation
- No API routes with auth checks
- No cookie-based auth tokens

**Attack Vector:** Disable JavaScript, use curl/Postman, or manipulate React DevTools to bypass all auth checks.

---

### SEC-003: Admin Portal Has No Real Backend (CRITICAL)

**Location:** `apps/furr-admin/src/app/*/page.tsx` (all pages)

**Issue:** The entire admin portal uses hardcoded mock data with local-state-only mutations. Approve/reject vet, manage users, moderate content — all actions only update `useState` and are lost on refresh.

**Risk:** When real backend is wired up, the pattern of "update local state without server validation" will create authorization bypass bugs.

---

### SEC-004: Production-Critical Functions Throw "Not Implemented" (CRITICAL)

**Location:** `packages/firebase/src/sharing.ts:171`

```typescript
export async function redeemGrant(code: string, vetUid: string): Promise<AccessGrant> {
  // ...dev bypass works...
  throw new Error('Not implemented for real Firestore yet (requires Cloud Functions)');
}
```

Also affected:
- `getVetActiveGrants()` at line 174 — returns `[]` in production
- `getGrant()` at line 184 — returns `null` in production

**Impact:** The entire vet-owner data sharing workflow (core feature) is non-functional outside dev mode.

---

### SEC-005: Weak Random Code Generation (HIGH)

**Location:** `packages/firebase/src/sharing.ts:22`

```typescript
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
```

**Issue:** `Math.random()` is NOT cryptographically secure. Access grant codes are predictable.  
**Fix:** Use `crypto.getRandomValues()`.

---

### SEC-006: PII Exposed in Lost & Found Mock Data (HIGH)

**Location:** `packages/firebase/src/lostfound.ts:13-14,57-58`

```typescript
ownerPhone: '+94 77 123 4567',
reporterPhone: '+94 77 444 5555',
```

Hardcoded phone numbers in source code. If these are real numbers, this is a GDPR/privacy violation.

---

### SEC-007: No CSRF Protection on Admin/Vet Login Forms (HIGH)

**Locations:**
- `apps/furr-admin/src/components/AdminGate.tsx:60-71`
- `apps/furr-vet/src/app/page.tsx:91-105`

No CSRF tokens, no SameSite cookies, no rate limiting on authentication endpoints.

---

### SEC-008: Insecure Grant Validation in Vet Portal (HIGH)

**Location:** `apps/furr-vet/src/app/pets/[ownerUid]/[petId]/page.tsx:36-42`

```typescript
const nextGrant = await getGrant(requestedGrantId);
if (!nextGrant || nextGrant.status !== 'redeemed' || nextGrant.redeemedByUid !== viewerUid) {
  throw new Error('...');
}
```

**Missing checks:**
- No verification that `ownerUid` in URL matches `nextGrant.ownerUid`
- No verification that `petId` in URL matches `nextGrant.petId`
- String date comparison instead of proper `Date` objects for expiry

---

### SEC-009: Storage Upload Has No URI Validation (MEDIUM)

**Location:** `packages/firebase/src/storage.ts:104`

```typescript
const blob = await fetch(input.uri).then((r) => r.blob());
```

**Issue:** No validation that the URI is from camera/image picker. Could be used to exfiltrate data by fetching arbitrary URLs from the client.

---

## Bugs

### BUG-001: Memory Leak — subscribeToReminders Never Unsubscribes (HIGH)

**Location:** `packages/firebase/src/reminders.ts:145-152`

```typescript
export function subscribeToReminders(...): () => void {
  if (IS_DEV_BYPASS) { ... }
  void (async () => {
    // onSnapshot is called but return value is LOST inside the async IIFE
    return onSnapshot(q, (snap) => { ... });
  })();
  return () => {};  // <-- Always returns no-op! Listener is never cleaned up
}
```

**Impact:** Every time a user navigates to reminders and back, a new Firestore listener is created but never removed. This accumulates over time, causing memory leaks and unnecessary network traffic.

**Same pattern exists in:** The production path (NOT dev bypass) of this function is the only affected one — `subscribeToGrants`, `subscribeToVaccinations` etc. properly capture `unsubscribe`.

---

### BUG-002: `as never` Type Assertions Hide Navigation Bugs (HIGH)

**Location:** 70+ instances across `apps/furr-owner/app/**/*.tsx`

```typescript
router.push('/auth/phone' as never)
router.push('/pet-detail' as never)
router.push(`/shop/${product.id}` as never)
```

**Issue:** Expo Router provides type-safe routing. Casting to `never` suppresses ALL type checking on routes. If any route name changes, TypeScript won't catch the broken navigation — it will crash at runtime.

**Count:** 70+ occurrences across the entire mobile app.

---

### BUG-003: Hardcoded Active Navigation Link in Admin (MEDIUM)

**Location:** `apps/furr-admin/src/app/layout.tsx:31`

```tsx
className="admin-link active"  // Always "active" regardless of current page
```

**Fix:** Use `usePathname()` to determine active state dynamically.

---

### BUG-004: Full Page Reloads in Vet Portal Navigation (MEDIUM)

**Location:** `apps/furr-vet/src/app/layout.tsx:31-35`

```tsx
<a href="/" className="...">Workspace</a>
<a href="/consults" className="...">Telehealth Desk</a>
```

**Issue:** Using `<a>` instead of Next.js `<Link>` causes full page reloads, destroying all client state (auth, grants, etc.).

---

### BUG-005: Invalid Date Rendered as "Invalid Date" (MEDIUM)

**Location:** `apps/furr-vet/src/app/page.tsx:23`

```typescript
new Date(grant.grantExpiresAt ?? '').toLocaleString()
```

**Issue:** When `grantExpiresAt` is undefined/null, `new Date('')` produces "Invalid Date" visible to users.

---

### BUG-006: Health Timeline `buildTimeline` Can Crash (MEDIUM)

**Location:** `packages/core/src/health.ts:213`

```typescript
...medications.map((m) => ({ kind: 'medication' as const, date: m.startAt.slice(0, 10), plan: m })),
```

**Issue:** If `startAt` is not a standard ISO string or is shorter than 10 characters, `.slice(0, 10)` will produce garbage or crash downstream sorting.

---

### BUG-007: Search Button Does Nothing in Admin Users Page (LOW)

**Location:** `apps/furr-admin/src/app/users/page.tsx:36-38`

The search `<button>` has no `onClick` handler. Filtering happens on keystroke change, making the button misleading UX.

---

### BUG-008: Messages Not Persisted in Vet Consults (HIGH)

**Location:** `apps/furr-vet/src/app/consults/page.tsx:15-31`

```typescript
const handleSendReply = (e: React.FormEvent) => {
  const newMsg = { /* ... */ senderName: "Dr. Sarah Weerasinghe, BVSc" };
  setMessages((prev) => [...prev, newMsg]); // Local state only!
};
```

**Issues:**
1. Messages are never saved to Firebase — lost on page refresh
2. Sender info is hardcoded instead of using the authenticated user's profile

---

### BUG-009: Race Condition in Auth State (MEDIUM)

**Location:** `apps/furr-owner/src/context/auth.tsx:102-124`

```typescript
const unsubscribe = subscribeToAuthState(async (user) => {
  setFirebaseUser(user);
  if (!user) { setStatus('unauthenticated'); return; }
  const fetchedProfile = await getOwnerProfile(user.uid); // <-- async gap
  setStatus('authenticated');
});
```

Between `setFirebaseUser(user)` and `setStatus('authenticated')`, there's an async gap where `firebaseUser` is set but `status` is still `'loading'`. Components checking both could render inconsistently.

---

### BUG-010: Context Provider Pyramid of Doom (MEDIUM)

**Location:** `apps/furr-owner/app/_layout.tsx:38-68`

13 nested context providers! Every state change in ANY provider triggers re-render checks down the entire tree. Even with `useMemo`, this creates unnecessary React reconciliation work.

---

### BUG-011: `as any` on Icon Names Hides Missing Icons (LOW)

**Location:** Multiple files in `apps/furr-owner/`

```typescript
<Ionicons name={cat.icon as any} size={18} color={colors.brand} />
```

If the icon name string doesn't match a valid Ionicons glyph, it renders a blank/missing box with no error.

---

### BUG-012: Incorrect TSConfig JSX Setting in Vet/Admin (LOW)

**Location:** `apps/furr-vet/tsconfig.json:14`, `apps/furr-admin/tsconfig.json:14`

```json
"jsx": "react-jsx"
```

For Next.js App Router, this should be `"preserve"` (Next.js handles JSX transformation).

---

### BUG-013: Hardcoded Fallback Pet ID 'max' (HIGH)

**Location:** `apps/furr-owner/src/context/care.tsx:37`, `apps/furr-owner/src/context/family.tsx:36`

```typescript
const petId = selectedPet?.id || 'max';
```

When no pet is selected, the app loads data for a non-existent pet called 'max'. This will either crash or show stale/wrong data.

---

### BUG-014: Walk Distance Tracking is Completely Fake (HIGH)

**Location:** `apps/furr-owner/app/care/walk.tsx:29-32`

```typescript
setDistanceKm((d) => Math.round((d + 0.012) * 100) / 100);
```

Distance is incremented by a fixed amount every second regardless of actual GPS movement. This is not tracking — it's a counter.

---

### BUG-015: Browser `alert()` Used in React Native (MEDIUM)

**Location:** `apps/furr-owner/app/community/index.tsx:299`

Uses `alert()` (browser API) instead of `Alert.alert()` from React Native. Will not display on native platforms.

---

### BUG-016: Community Forum Shows Wrong Content on Invalid ID (MEDIUM)

**Location:** `apps/furr-owner/app/community/forum/[id].tsx:25`

```typescript
const question = questions.find((q) => q.id === id) || questions[0];
```

If route parameter doesn't match any question, it silently shows the first question instead of an error — user sees completely wrong content.

---

### BUG-017: OTP Auto-Verify Has Stale Closure (MEDIUM)

**Location:** `apps/furr-owner/app/auth/otp.tsx:91-95`

```typescript
useEffect(() => {
  if (code.length === 6 && !loading) { handleVerify(); }
}, [code]);  // Missing handleVerify and loading in deps
```

`handleVerify` and `loading` aren't in the dependency array, causing stale closures.

---

### BUG-018: Lost Pet Report Uses Stock Photos (HIGH)

**Location:** `apps/furr-owner/app/lost-found/report.tsx:53-79`

Lost pet reports use hardcoded Unsplash URLs instead of actual image picker integration. Real reports will have stock dog photos.

---

### BUG-019: Services Default to Colombo Coordinates (LOW)

**Location:** `apps/furr-owner/src/context/services.tsx:76`

```typescript
const defaultCoords = { latitude: 6.9271, longitude: 79.8612 };
```

All distance calculations use Colombo as default, giving wrong distances for users elsewhere.

---

### BUG-020: Unconfirmed Phone Dialing in Lost & Found (MEDIUM)

**Location:** `apps/furr-owner/app/lost-found/index.tsx:16-20`

`Linking.openURL('tel:...')` is called without user confirmation dialog. Accidentally tapping could initiate an unexpected phone call.

---

### BUG-021: Walk Timer Has No Cleanup on Unmount (MEDIUM)

**Location:** `apps/furr-owner/app/care/walk.tsx:28-40`

No `clearInterval` on component unmount or app backgrounding. Causes memory leaks and battery drain.

---

### BUG-022: Feeding Log Shows Success Before API Confirms (LOW)

**Location:** `apps/furr-owner/app/care/feeding.tsx:24`

Alert shown before the async save operation completes. User sees "success" even if the backend write fails.

---

## Missing Implementations

### MISS-001: Zero Test Coverage

**Severity:** HIGH

There are **no test files anywhere** in the project:
- No unit tests
- No integration tests
- No E2E tests
- No testing libraries in any `package.json`

---

### MISS-002: No Error Boundaries

**Severity:** HIGH

**Missing files:**
- `apps/furr-admin/src/app/error.tsx`
- `apps/furr-vet/src/app/error.tsx`
- No React error boundaries in the mobile app

Any unhandled exception crashes the entire app with no recovery UI.

---

### MISS-003: No Loading States (Next.js)

**Severity:** MEDIUM

**Missing files:**
- `apps/furr-admin/src/app/loading.tsx`
- `apps/furr-vet/src/app/loading.tsx`
- `apps/furr-vet/src/app/pets/[ownerUid]/[petId]/loading.tsx`

Users see blank pages during async operations.

---

### MISS-004: No Next.js Middleware for Route Protection

**Severity:** CRITICAL

**Missing files:**
- `apps/furr-admin/src/middleware.ts`
- `apps/furr-vet/src/middleware.ts`

All routes are publicly accessible. Auth is enforced only via client-side JavaScript.

---

### MISS-005: No Security Headers

**Severity:** HIGH

**Location:** `apps/furr-admin/next.config.ts`, `apps/furr-vet/next.config.ts`

Both configs are essentially empty. Missing:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Referrer-Policy
- Permissions-Policy

---

### MISS-006: No Cloud Functions

**Severity:** HIGH

Multiple features require server-side logic that doesn't exist:
- Grant redemption (cross-user query)
- Vet verification workflow
- Push notification triggers
- Audit log writing
- Admin actions (suspend user, etc.)

---

### MISS-007: No Real-Time Updates in Admin/Vet Portals

**Severity:** MEDIUM

Both web portals use static mock data or one-time fetches. No Firestore subscriptions for live updates on:
- New vet applications
- Bookings
- Lost pet alerts
- Consultation messages

---

### MISS-008: No Environment Variable Validation

**Severity:** MEDIUM

No runtime check that required env vars exist. The app can start with missing config and fail mysteriously deep in execution.

---

### MISS-009: No Data Validation Layer Before Writes

**Severity:** MEDIUM

`packages/firebase/src/health.ts` and others write to Firestore with no validation:
- No check that `nextDueOn > administeredOn` for vaccinations
- No check that weight `value > 0`
- No check that observation dates aren't in the future
- No check that `categories` array is non-empty for grants

---

### MISS-010: No Pagination on Any List

**Severity:** MEDIUM

All data fetching loads complete collections:
- All pets, all vaccinations, all expenses, all orders
- Will degrade severely as data grows

---

### MISS-011: No Image Optimization in Admin/Vet Portals

**Severity:** LOW

Using raw `<img>` tags instead of `next/image`:
- No lazy loading
- No responsive sizing
- No format optimization (WebP/AVIF)

---

### MISS-012: No Internationalization (i18n)

**Severity:** LOW

All strings are hardcoded in English. Given the Sri Lankan market focus, Sinhala/Tamil support will be needed.

---

### MISS-013: furr-clinic App is Empty Shell

**Location:** `apps/furr-clinic/package.json`

Only has a placeholder `typecheck` script that echoes "not yet implemented". No source files.

---

### MISS-014: Missing Input Validations in Mobile App (HIGH)

Multiple forms accept invalid data:

| Screen | Issue |
|--------|-------|
| `app/expenses/add.tsx` | No validation preventing negative or zero amounts |
| `app/care/training.tsx:28` | Duration accepts negative/zero/text values |
| `app/health/add-vaccination.tsx` | No validation for unreasonably old dates |
| `app/health/add-medication.tsx:256` | Can submit with zero weekly days selected |
| `app/community/meetup/new.tsx` | Can schedule meetups in the past |
| `app/reminders/add-reminder.tsx:167` | Free text for date (placeholder "YYYY-MM-DDTHH:MM") instead of DateTimePicker |
| `app/pet/add.tsx:83` | Allows birth dates far in past (year 1900) |
| `app/health/upload-document.tsx` | No file size or corruption validation |

---

### MISS-015: No Pull-to-Refresh on List Screens

**Location:** `app/shop/orders.tsx`, `app/services/bookings.tsx`, `app/expenses/index.tsx`

No `RefreshControl` on any ScrollView — users cannot manually refresh stale data.

---

### MISS-016: No Out-of-Stock Handling in Shop

**Location:** `apps/furr-owner/app/shop/[id].tsx:156-164`

Users can add more items to cart than available stock. No `product.stock` check.

---

## Code Quality Issues

### CQ-001: Massive `as never` / `as any` Usage (70+ Instances)

**Location:** Throughout `apps/furr-owner/`

This suppresses TypeScript's entire type system for navigation. Proper fix: configure Expo Router's typed routes or use the correct route types.

---

### CQ-002: IS_DEV_BYPASS Repeated 15+ Times

**Location:** Every file in `packages/firebase/src/`

```typescript
const IS_DEV_BYPASS = typeof process !== 'undefined' 
  && !process.env?.EXPO_PUBLIC_FIREBASE_API_KEY 
  && !process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;
```

Should be extracted to a shared module.

---

### CQ-003: 40+ Console Statements in Production Code

**Location:** Throughout `packages/firebase/src/` and `apps/furr-owner/`

```
32 console.warn instances
9 console.error instances
```

No structured logging. No log levels. No way to disable in production. Use a proper logger.

---

### CQ-004: Code Duplication in Firebase Subscription Pattern

**Location:** Every subscription function in `packages/firebase/src/`

The same async-IIFE-with-unsubscribe pattern is repeated 15+ times:
```typescript
let unsubscribe: (() => void) | undefined;
let active = true;
void (async () => {
  try {
    const { getFirestore, ... } = await import('firebase/firestore');
    // ...
    unsubscribe = onSnapshot(q, ...);
    if (!active && unsubscribe) unsubscribe();
  } catch (e) { console.warn(...); }
})();
return () => { active = false; unsubscribe?.(); };
```

Should be abstracted into a shared helper.

---

### CQ-005: Inconsistent Data Architecture

**Issue:** Some data lives under user subcollections (the secure pattern):
```
users/{uid}/pets/{petId}/vaccinations/{docId}
```

But newer features use root-level collections (insecure, inconsistent):
```
routines/{docId}
expenses/{docId}
community_meetups/{docId}
```

This creates a split architecture that's harder to secure and maintain.

---

### CQ-006: No Separation of Concerns in Admin Pages

**Location:** All `apps/furr-admin/src/app/*/page.tsx`

Each page combines:
- Data fetching (mock)
- Business logic
- State management
- UI rendering
- Event handling

All in a single component with no custom hooks or service layers.

---

### CQ-007: Dead Code — Scratch Files

**Location:** `scratch/fix_commas.js`, `scratch/fix_shadows.js`

Development utility scripts left in the repo.

---

### CQ-008: Inconsistent Package Manager Versions

**Root:** `"packageManager": "pnpm@10.16.1"`  
**furr-admin:** `"packageManager": "pnpm@10.12.1"`  
**furr-vet:** `"packageManager": "pnpm@10.12.1"`

---

### CQ-009: Types Defined in Firebase Package Instead of Core

**Location:** `packages/firebase/src/routines.ts:1-9`, `packages/firebase/src/expenses.ts:1-13`

```typescript
export type RoutineTask = { ... };
export type ExpenseCategory = 'Vet' | 'Food' | ...;
```

Domain types should live in `@furr/core`, not in the Firebase service layer.

---

### CQ-010: Missing Type Exports from @furr/core

Types defined but not properly exported:
- `ProfessionalStatus` from `vet.ts`
- `ExpenseCategory` and `RoutineTask` (defined in wrong package)
- Various intermediate types

---

## Performance Issues

### PERF-001: 13 Nested Context Providers (HIGH)

**Location:** `apps/furr-owner/app/_layout.tsx:38-68`

Every provider potentially triggers re-renders down the entire tree. Consider:
- Combining related providers (e.g., health + care)
- Using Zustand/Jotai for atomic state
- Lazy-loading providers that aren't needed on every screen

---

### PERF-002: No Firestore Query Pagination (MEDIUM)

All subscriptions load full collections. As data grows:
- `subscribeToExpenses` loads ALL expenses ever
- `subscribeToLostAlerts` loads ALL active alerts (could be thousands)
- `subscribeToProducts` loads ALL marketplace products

---

### PERF-003: Dynamic Imports of firebase/firestore on Every Call (MEDIUM)

**Location:** Every function in `packages/firebase/src/`

```typescript
const { getFirestore, collection, ... } = await import('firebase/firestore');
```

The `import()` is resolved from cache after the first call, but the destructuring and module resolution adds overhead on every single operation. Should import once at module level or use a cached lazy init.

---

### PERF-004: No React.memo or Virtualization for Lists (LOW)

Long lists (expenses, vaccinations, products) re-render entirely on any state change. No `React.memo` on list items, no `FlatList` optimization, no virtualization.

---

### PERF-005: Images Not Optimized (LOW)

- Admin/Vet: Using `<img>` instead of `next/image`
- Mobile: No image caching strategy beyond what Expo provides by default
- Mock data references full-size Unsplash images with no size constraints

---

## Accessibility Issues

### A11Y-001: No ARIA Labels on Icon-Only Buttons (HIGH)

**Location:** Throughout all apps

Interactive elements with only icons lack `aria-label`:
```tsx
<Pressable onPress={...}>
  <Ionicons name="add" />  {/* No accessible label */}
</Pressable>
```

---

### A11Y-002: Tables Without Proper Semantics (MEDIUM)

**Location:** Admin portal tables (`users/page.tsx`, `vet-desk/page.tsx`)

Tables use `<div>` grids instead of proper `<table>`, `<thead>`, `<tbody>` elements with ARIA roles.

---

### A11Y-003: No Focus Management (MEDIUM)

- No visible focus indicators on custom-styled elements
- No focus traps in modal-like UIs (bottom sheets)
- No skip-to-content links in web portals

---

### A11Y-004: Color Contrast Issues (LOW)

**Location:** `apps/furr-admin/src/app/globals.css`

`.admin-link` color `#C9D4D6` on dark backgrounds may not meet WCAG AA contrast ratio (4.5:1 for normal text).

---

### A11Y-005: OTP Input Not Screen Reader Friendly (LOW)

**Location:** `packages/ui/src/components/OtpInput.tsx:60-79`

Visual boxes are decorative but not marked as `accessibilityElementsHidden`. Screen readers will read each box as a separate element.

---

## Testing & CI/CD Gaps

### TEST-001: Zero Test Coverage

No test files exist in the entire repository. No testing framework configured.

**Missing:**
- Unit tests for `@furr/core` validation (phone normalization, buildTimeline, etc.)
- Unit tests for `@furr/firebase` service functions
- Component tests for `@furr/ui`
- Integration tests for auth flow
- E2E tests for critical paths

---

### TEST-002: No CI/CD Pipeline

No evidence of:
- GitHub Actions / CI configuration
- Automated builds
- Deployment scripts (beyond manual `next build`)
- Automated security scanning
- Dependency vulnerability checks

---

### TEST-003: No TypeCheck in CI

While `typecheck` scripts exist in `package.json`, there's no CI enforcement. TypeScript errors could be committed without detection.

---

### TEST-004: No Linting Enforcement

ESLint is configured but no pre-commit hooks or CI checks enforce it.

---

## Firebase-Specific Issues

### FB-001: Firestore Rules Don't Match Code Architecture

**Rules protect:** `/users/{uid}/*` subcollection pattern  
**Code uses:** 16 root-level collections with NO rules

---

### FB-002: No Composite Indexes Defined

**Location:** No `firestore.indexes.json` file exists

Complex queries (e.g., filtering by `ownerUid` + ordering by `date`) will fail at runtime without composite indexes.

---

### FB-003: No Cloud Functions Project

The codebase references Cloud Functions in comments but there's no `functions/` directory, no Cloud Functions code, and no deployment configuration.

---

### FB-004: No Firebase Storage Rules

No `storage.rules` file exists. Firebase Storage is likely using default (deny all) or development-mode (allow all) rules.

---

### FB-005: reCAPTCHA Verifier Memory Leak

**Location:** `packages/firebase/src/auth.ts:42-44`

```typescript
'expired-callback': () => {
  recaptchaVerifier = null;  // Sets to null but doesn't call .clear()
},
```

The DOM element created by the verifier is never removed when expired.

---

### FB-006: No Offline Persistence Configuration

Firestore's offline persistence isn't explicitly configured. The default behavior varies by platform:
- Web: No persistence by default (requires `enableIndexedDbPersistence`)
- Mobile (via Expo): Persistence is on by default

This means the web portals will show empty states when offline with no indication of why.

---

### FB-007: Grant Validation in Rules Uses String Concatenation

**Location:** `firebase/firestore.rules:58`

```javascript
exists(/.../grants/$(request.auth.uid + '_' + petId))
```

This hardcodes a grant ID format that must be maintained by all clients. If any client creates a grant with a different ID format, the rule breaks silently.

---

## Recommendations Priority Matrix

### P0 — CRITICAL (Fix Before Any Deployment)

| # | Issue | Category | Effort |
|---|---|---|---|
| 1 | Add Firestore security rules for all 16 unprotected collections | SEC-001 | 4h |
| 2 | Implement Next.js middleware for server-side auth | SEC-002 | 6h |
| 3 | Implement `redeemGrant` for production (Cloud Function) | SEC-004 | 8h |
| 4 | Fix `subscribeToReminders` memory leak | BUG-001 | 30min |
| 5 | Add `middleware.ts` to admin and vet portals | MISS-004 | 4h |
| 6 | Replace `Math.random()` with `crypto.getRandomValues()` | SEC-005 | 30min |

### P1 — HIGH (Fix This Sprint)

| # | Issue | Category | Effort |
|---|---|---|---|
| 7 | Add error boundaries to all apps | MISS-002 | 2h |
| 8 | Add security headers to Next.js configs | MISS-005 | 1h |
| 9 | Fix `as never` type assertions (configure typed routes) | BUG-002 | 4h |
| 10 | Add environment variable validation (zod) | MISS-008 | 2h |
| 11 | Wire admin portal to real Firebase backend | SEC-003 | 16h |
| 12 | Add input validation before all Firestore writes | MISS-009 | 8h |
| 13 | Remove PII from source code mock data | SEC-006 | 1h |
| 14 | Add CSRF protection to login forms | SEC-007 | 2h |
| 15 | Fix vet portal grant validation (verify ownerUid/petId) | SEC-008 | 1h |

### P2 — MEDIUM (Fix Within 2 Weeks)

| # | Issue | Category | Effort |
|---|---|---|---|
| 16 | Add basic test suite for @furr/core | TEST-001 | 8h |
| 17 | Extract IS_DEV_BYPASS to shared module | CQ-002 | 1h |
| 18 | Add pagination to all list queries | MISS-010 | 8h |
| 19 | Unify data architecture (subcollections vs root) | CQ-005 | 16h |
| 20 | Add loading states to Next.js apps | MISS-003 | 2h |
| 21 | Replace `<a>` with `<Link>` in vet portal | BUG-004 | 30min |
| 22 | Add composite Firestore indexes | FB-002 | 2h |
| 23 | Fix admin navigation active state | BUG-003 | 30min |
| 24 | Create Cloud Functions project skeleton | MISS-006 | 4h |
| 25 | Implement audit logging for admin actions | MISS-007 | 8h |
| 26 | Add CI/CD pipeline (GitHub Actions) | TEST-002 | 4h |

### P3 — LOW (Backlog)

| # | Issue | Category | Effort |
|---|---|---|---|
| 27 | Reduce context provider nesting | PERF-001 | 8h |
| 28 | Add image optimization (next/image) | PERF-005 | 2h |
| 29 | Add ARIA labels and focus management | A11Y-001 | 4h |
| 30 | Remove console statements, add structured logging | CQ-003 | 2h |
| 31 | Extract subscription pattern helper | CQ-004 | 4h |
| 32 | Move domain types from firebase to core package | CQ-009 | 2h |
| 33 | Add i18n support | MISS-012 | 16h |
| 34 | Clean up scratch directory | CQ-007 | 5min |
| 35 | Align pnpm version across packages | CQ-008 | 5min |
| 36 | Configure Firestore offline persistence for web | FB-006 | 1h |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total source files analyzed | 147 |
| Critical security vulnerabilities | 9 |
| Bugs found | 22 |
| Missing implementations | 16 |
| Code quality issues | 10 |
| Performance issues | 5 |
| Accessibility issues | 5 |
| Testing gaps | 4 |
| Firebase-specific issues | 7 |
| **Total issues** | **78** |

---

## Overall Assessment

The FURR platform has a solid **architectural foundation** (well-structured monorepo, clean type system, proper separation into apps and packages) but is in an **MVP/prototype stage** with critical gaps that prevent production deployment:

1. **Security is the #1 blocker** — 16 unprotected Firestore collections, no server-side auth, and core features that literally throw "not implemented" in production.

2. **The admin and vet portals are UI shells** — they render nicely but have no real backend integration. All data is mock/hardcoded.

3. **The mobile app is the most complete** — it has real Firebase integration, proper subscription patterns, and working state management, but still relies heavily on dev-bypass mode.

4. **Zero test coverage** means any change risks breaking existing functionality with no safety net.

The path to production requires: security rules, server-side auth middleware, Cloud Functions for cross-user operations, and at minimum smoke tests for critical paths.
