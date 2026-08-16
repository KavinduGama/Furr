# FURR Platform — Unimplemented Parts & Issues Report

**Date:** 2026-08-17  
**Scope:** Full monorepo audit across 5 apps, 4 shared packages, and Firebase infrastructure  
**Apps:** furr-owner (mobile), furr-vet (web), furr-admin (web), furr-clinic (web), furr-vet-mobile (mobile)  
**Packages:** @furr/core, @furr/firebase, @furr/ui, @furr/functions

---

## Executive Summary

The FURR platform is an ambitious pet lifestyle super-app with **significant architectural foundations** in place but remains in **early prototype/MVP state**. The platform plan describes 10 major phases — only the medical core (~60%) and UI shells for other features have been implemented. Below is a detailed inventory of what's missing, broken, or stubbed.

**Key Statistics:**
| Metric | Value |
|--------|-------|
| Total planned features (from platform plan) | ~200+ tasks |
| Features with real backend integration | ~15-20% |
| Features operating on mock/hardcoded data | ~80% |
| Test coverage | 0% (zero test files) |
| Cloud Functions implemented | 4 (of ~15+ needed) |
| Planned packages not yet created | 5 (payments, chat, search, location, notifications) |

---

## 1. Entirely Unimplemented Platform Phases

Based on `FURR_FULL_PLATFORM_PLAN.md`, these planned capabilities have **no code at all**:

### Phase 0: Foundation & Payment Infrastructure
| Task | Status |
|------|--------|
| Stripe/PayHere payment gateway integration | Not started |
| `@furr/payments` package | Does not exist |
| Real subscription engine (billing, trials, upgrades) | Fake — `setTimeout` simulates purchase |
| Webhook handlers for payment status | Not started |
| Refund flow | Not started |
| Deep linking for all sections | Not started |
| Feature flags for rollout | Not started |

### Phase 1: Marketplace (E-Commerce)
| Task | Status |
|------|--------|
| Seller/vendor registration & dashboard | Not started |
| Real product CRUD from sellers | Mock data only |
| Inventory tracking (live) | Mock data only |
| Payment processing for orders | Simulated with `setTimeout` |
| Order status tracking (real) | Local state only — lost on refresh |
| Real-time delivery tracking | Not started |
| Return/refund request flow | Not started |
| Review moderation system | Not started |

### Phase 2: Service Bookings
| Task | Status |
|------|--------|
| Provider self-registration | Not started |
| Availability calendar (real) | Mock data only |
| Real booking flow with payment | Simulated — local state only |
| GPS-based live tracking for walks | Not started (walk uses fake distance counter) |
| Post-service reports | Not started |
| Provider payout system | Not started |

### Phase 3: Vet Consultations (Telemedicine)
| Task | Status |
|------|--------|
| Real-time chat backend | Messages stored in local state only |
| Video calling SDK (Agora/Daily.co) | Not started |
| Queue system for instant consultations | Not started |
| Prescription generation | Not started |
| Consultation billing | Not started |

### Phase 4: Community Features
| Task | Status |
|------|--------|
| Real forum/Q&A persistence | Mock data only |
| Event RSVP (real) | Not started |
| Playdate matching | Not started |
| Direct messaging | Not started |

### Phase 5: Pet Care Scheduling
| Task | Status |
|------|--------|
| Real GPS walk tracking | Fake — increments by 0.012km/sec |
| Calorie/nutrition tracking | Not started |
| Walk history with maps | Not started |
| Smart daily care card | Not started |
| Gamification/streaks | Not started |

### Phase 6-10: Remaining Phases
All of these are entirely unimplemented:
- **Phase 6:** Lost & Found matching algorithm, QR tag ordering, social sharing
- **Phase 7:** Insurance marketplace, expense reports with charts, budgeting
- **Phase 8:** Family/household accounts, pet sitter mode, pet transfer
- **Phase 9:** Complete admin/provider/seller portals
- **Phase 10:** Dark mode, offline support, accessibility, performance optimization

### Planned Packages That Don't Exist
```
packages/payments/        # Payment gateway abstraction — NOT CREATED
packages/chat/            # Real-time messaging wrapper — NOT CREATED
packages/search/          # Firestore query builders — NOT CREATED
packages/location/        # Expo location wrappers — NOT CREATED
packages/notifications/   # Push notification service — NOT CREATED
```

---

## 2. Apps Operating Entirely on Mock Data

### apps/furr-admin (Admin Operations Portal)

**Status: UI shell with ZERO real backend integration.**

Every single operation in the admin portal is a `useState` mutation with optional `localStorage` persistence. No Firestore reads or writes occur at runtime.

| Page | Issue | Severity |
|------|-------|----------|
| `src/context/AdminContext.tsx` | All data initialized from hardcoded arrays (vets, clinics, orders, disputes, users, payouts, audit logs) | CRITICAL |
| `src/app/analytics/page.tsx` | Every metric hardcoded (WAU "2,840", AOV "Rs 5,420", etc.) — imports context data but never uses it | HIGH |
| `src/app/finance/page.tsx` | "Export CSV" does `setTimeout(800ms)` + `alert()` — no actual export | HIGH |
| `src/app/finance/page.tsx:61` | MRR "Rs 624,000" and "1,250 Active Paid Members" are hardcoded strings | HIGH |
| All admin pages | Approve/reject/update actions only modify React state — lost on page refresh | CRITICAL |

### apps/furr-clinic (Clinic Operator Portal)

**Status: UI shell with 100% hardcoded data.**

| Page | Issue | Severity |
|------|-------|----------|
| `src/app/page.tsx` | Queue data is a static `useState` array — no Firestore subscription | CRITICAL |
| `src/app/page.tsx:163` | "View Chart" button has no navigation handler | HIGH |
| `src/app/checkin/page.tsx` | Patient check-in form submits to local state only | HIGH |
| `src/app/appointments/page.tsx` | Entire appointment list is hardcoded | HIGH |
| `src/app/records/page.tsx` | Medical records are hardcoded demo data | HIGH |
| `src/app/staff/page.tsx` | Staff roster is a static array | HIGH |
| No `middleware.ts` | No authentication at all — anyone can access | CRITICAL |

### apps/furr-vet-mobile (Vet Mobile App)

**Status: Partially connected — grant redemption works in dev mode only.**

| Feature | Issue | Severity |
|---------|-------|----------|
| `src/context/consults.tsx` | Messages stored in local state only — never persisted to Firebase | CRITICAL |
| `src/context/consults.tsx:24` | Sender name hardcoded as "Dr. Sarah Smith" | HIGH |
| `src/context/grants.tsx:18-49` | Initial grants/pets seeded from hardcoded test data | HIGH |
| `app/(tabs)/scan.tsx` | QR scanner is a visual mock — no camera integration, no `expo-camera` dependency | CRITICAL |
| `src/context/auth.tsx:46-54` | `signIn` catches all errors and falls back to dev profile | HIGH |
| No login screen | App renders tabs unconditionally — no auth gate | CRITICAL |
| `app/(tabs)/index.tsx:57` | "2 triage cases pending" is static text | MEDIUM |
| Duty status toggle | Local state only — resets on app restart | HIGH |

---

## 3. Critical Security Issues

| ID | Issue | Location | Severity |
|----|-------|----------|----------|
| SEC-1 | Admin portal auth gate defaults to `'allowed'` — login failures grant access | `furr-admin/src/components/AdminGate.tsx:97,133-135` | CRITICAL |
| SEC-2 | No server-side auth middleware on clinic portal | `furr-clinic/` — no `middleware.ts` exists | CRITICAL |
| SEC-3 | Vet portal uses `<a>` tags instead of `<Link>` — full page reloads destroy auth state | `furr-vet/src/app/layout.tsx:31-35` | HIGH |
| SEC-4 | `Math.random()` used for security-sensitive grant codes | `packages/firebase/src/sharing.ts:22` | HIGH |
| SEC-5 | Firestore rules for care/family/insurance are overly permissive — any authenticated user can read/write any record | `firebase/firestore.rules:143-168` | HIGH |
| SEC-6 | Telemedicine messages rule allows any authenticated user to read any message | `firebase/firestore.rules:237-241` | HIGH |
| SEC-7 | Storage URI not validated — `fetch(input.uri)` could be used to exfiltrate data | `packages/firebase/src/storage.ts:104` | MEDIUM |
| SEC-8 | No CSRF protection on any login form | All apps | HIGH |
| SEC-9 | No rate limiting on grant code redemption — brute-forceable | `packages/firebase/src/sharing.ts` | HIGH |
| SEC-10 | Admin can change any user's role to "admin" via client-side dropdown — no server validation | `furr-admin/src/app/users/page.tsx:88-91` | HIGH |

---

## 4. Critical Bugs

| ID | Bug | Location | Severity |
|----|-----|----------|----------|
| BUG-1 | `subscribeToReminders` returns no-op cleanup — listener never cleaned up (memory leak) | `packages/firebase/src/reminders.ts:145-152` | HIGH |
| BUG-2 | Walk distance tracking increments by fixed amount every second regardless of GPS | `furr-owner/app/care/walk.tsx:29-32` | HIGH |
| BUG-3 | Walk timer has no `clearInterval` on unmount — memory leak and battery drain | `furr-owner/app/care/walk.tsx:28-40` | HIGH |
| BUG-4 | Fallback pet ID `'max'` used when no pet selected — loads data for non-existent pet | `furr-owner/src/context/care.tsx:37`, `family.tsx:36` | HIGH |
| BUG-5 | `consultations[0]` accessed without bounds check — crashes if array is empty | `furr-vet-mobile/app/(tabs)/consults.tsx:20` | HIGH |
| BUG-6 | 70+ `as never` type assertions suppress all route type checking in mobile app | Throughout `furr-owner/app/**/*.tsx` | HIGH |
| BUG-7 | Lost pet reports use hardcoded Unsplash URLs instead of actual image picker | `furr-owner/app/lost-found/report.tsx:53-79` | HIGH |
| BUG-8 | Browser `alert()` used in React Native — won't display on native platforms | `furr-owner/app/community/index.tsx:299` | MEDIUM |
| BUG-9 | OTP auto-verify has stale closure — missing deps in useEffect | `furr-owner/app/auth/otp.tsx:91-95` | MEDIUM |
| BUG-10 | Community forum shows first question when ID doesn't match — wrong content shown | `furr-owner/app/community/forum/[id].tsx:25` | MEDIUM |
| BUG-11 | Feeding log shows success alert before async save completes | `furr-owner/app/care/feeding.tsx:24` | MEDIUM |
| BUG-12 | Phone dialing initiated without user confirmation in Lost & Found | `furr-owner/app/lost-found/index.tsx:16-20` | MEDIUM |
| BUG-13 | Race condition in auth state — async gap between user set and status update | `furr-owner/src/context/auth.tsx:102-124` | MEDIUM |
| BUG-14 | `Invalid Date` rendered when `grantExpiresAt` is null | `furr-vet/src/app/page.tsx:23` | MEDIUM |

---

## 5. Core Feature: Vet-Owner Data Sharing (Non-Functional in Production)

This is the platform's core differentiator and it **cannot work** outside dev mode:

```typescript
// packages/firebase/src/sharing.ts:189
throw new Error('Not implemented for real Firestore yet (requires Cloud Functions)');
```

**Functions that are stubs in production:**
| Function | Behavior in Production |
|----------|----------------------|
| `redeemGrant()` | Throws "Not implemented" error |
| `getVetActiveGrants()` | Returns empty array `[]` |
| `getGrant()` | Returns `null` |

**Required:** A Cloud Function that can query across all users' grant subcollections by redemption code.

---

## 6. Subscription & Payment System (Entirely Fake)

**File:** `apps/furr-owner/src/context/subscription.tsx`

The subscription system is a single `useState` with fake delays:
- `upgradeTier()` — does `setTimeout(1200ms)` then sets local state
- `restorePurchases()` — does `setTimeout(800ms)` then shows alert
- No Stripe integration
- No receipt validation
- No server-side subscription verification
- Subscription state resets to `'free'` on app restart
- No trial period logic
- No paywall enforcement on premium features

---

## 7. Cloud Functions — Implemented vs. Needed

### Implemented (4 functions):
| Function | Trigger | Status |
|----------|---------|--------|
| `onLostPetAlertCreated` | Firestore `onCreate` on `lost_pet_alerts` | Working |
| `onTelehealthMessageSent` | Firestore `onCreate` on `telemedicine_messages` | Working |
| `onOrderStatusUpdated` | Firestore `onUpdate` on `marketplace_orders` | Working |
| `cleanupExpiredGrants` | Scheduled (every 24h) | Working |

### Missing (needed for production):
| Function | Purpose |
|----------|---------|
| `redeemGrantCode` | Cross-user query to find grant by code and update it |
| `verifyVetProfessional` | Process vet verification applications |
| `processPayment` | Stripe payment intent creation and confirmation |
| `createSubscription` | Stripe subscription creation |
| `handleStripeWebhook` | Process payment events |
| `sendReminderNotification` | Scheduled push for health/care reminders |
| `generatePrescriptionPDF` | PDF generation for vet prescriptions |
| `calculateProviderPayouts` | Scheduled payout calculation for service providers |
| `moderateContent` | Auto-flag inappropriate community content |
| `generateHealthReport` | PDF export of pet health timeline |
| `matchLostPets` | Match lost pet alerts against found pet reports |
| `auditLogWriter` | Secure audit trail for admin actions |
| `userDeletion` | GDPR-compliant account deletion cascade |
| `expoPushTokenCleanup` | Remove stale push tokens |

---

## 8. Missing Infrastructure

### No Test Coverage
- Zero test files in the entire repository
- No testing libraries configured in any `package.json`
- No unit tests, integration tests, or E2E tests
- CI pipeline (`ci.yml`) only runs typecheck and build — no test step

### No Error Boundaries
- `furr-clinic` — no `error.tsx`
- `furr-owner` — no React error boundaries
- `furr-vet-mobile` — no error boundaries
- Any unhandled exception crashes the entire app

### No Offline Support
- No Firestore offline persistence configuration for web portals
- No cached data strategy for mobile when network is unavailable
- No empty state messaging for offline scenarios

### No Internationalization
- All strings hardcoded in English
- Target market (Sri Lanka) needs Sinhala/Tamil support

### No Data Validation Layer
- No Zod/Yup schema validation before Firestore writes
- Can submit negative amounts, past dates, empty required fields
- No server-side validation in Cloud Functions

### No Pagination
- All queries load entire collections
- Will fail at scale (all expenses, all products, all alerts loaded at once)

---

## 9. Stub Functions That Don't Actually Write to Firestore

These functions in `@furr/firebase` construct objects locally and return them **without writing to the database**:

| File | Function | What It Does |
|------|----------|--------------|
| `packages/firebase/src/care.ts:169` | `logMealFeed()` | Returns local object — no Firestore write |
| `packages/firebase/src/care.ts:178` | `saveWalkActivity()` | Returns local object — no Firestore write |
| `packages/firebase/src/care.ts:186` | `saveTrainingLog()` | Returns local object — no Firestore write |
| `packages/firebase/src/family.ts:161` | `inviteFamilyMember()` | Returns local object — no Firestore write |
| `packages/firebase/src/family.ts:172` | `submitInsuranceClaim()` | Returns local object — no Firestore write |
| `packages/firebase/src/community.ts:257` | `toggleMeetupRsvp()` | Just `return true` — no Firestore write |
| `packages/firebase/src/community.ts:293` | `addAnswer()` | Returns local object — no Firestore write |

These are called from the mobile app contexts and appear to "work" but data is never persisted.

---

## 10. Type Mismatches Between Cloud Functions and Core Types

| Issue | Location | Impact |
|-------|----------|--------|
| `OrderStatus` type missing `'out_for_delivery'` | `packages/core/src/marketplace.ts:51` vs `packages/functions/src/triggers/orderDispatchedNotification.ts:29` | Cloud Function references status not in type union |
| `Order` type missing `trackingNumber` field | `packages/core/src/marketplace.ts:62-74` vs `orderDispatchedNotification.ts:30` | Cloud Function accesses undefined field |
| `OwnerProfile` type missing `expoPushToken` | `packages/core/src/index.ts:70-91` vs all Cloud Functions | Functions query `data.expoPushToken` but field is untyped |
| `OwnerProfile` type missing `district` | `packages/core/src/index.ts` vs `lostPetAmberAlert.ts:21` | Function queries by `district` — field untyped |
| Lost pet alert uses `lastSeenCity` but user query uses `district` | `lostPetAmberAlert.ts:15,21` | City and district may not match — no users may receive alerts |

---

## 11. Missing Error Handling in Mobile App Contexts

Every async operation in the mobile app's context providers lacks try/catch:

| Context File | Functions Without Error Handling |
|--------------|-------------------------------|
| `src/context/care.tsx` | `logMeal`, `recordWalk`, `recordTraining` |
| `src/context/community.tsx` | `hostMeetup`, `postQuestion`, `postAnswer`, `upvoteAnswer` |
| `src/context/family.tsx` | `inviteMember`, `fileClaim` |
| `src/context/lostfound.tsx` | `broadcastLostAlert`, `reportFoundPet` |
| `src/context/telemedicine.tsx` | `requestConsultation`, `sendMessage` |
| `src/context/services.tsx` | `bookService`, `cancelBooking` |
| `src/context/marketplace.tsx` | `placeOrder` |

If any Firebase operation fails, the error propagates unhandled with no user feedback.

---

## 12. Auth Bypass: Fallback to 'demo-uid' Without Guard

Multiple contexts allow write operations to proceed when `firebaseUser` is null by using fake UIDs:

```typescript
const ownerUid = firebaseUser?.uid || 'demo-uid';
```

**Affected contexts (13 callsites):**
- `src/context/care.tsx` (lines 51, 66, 80)
- `src/context/community.tsx` (lines 49, 72, 89, 104, 130)
- `src/context/family.tsx` (line 54)
- `src/context/lostfound.tsx` (lines 44, 63)
- `src/context/marketplace.tsx` (line 140)
- `src/context/telemedicine.tsx` (lines 59, 79)
- `src/context/services.tsx` (line 99)

This means data can be submitted with fake ownership in dev-bypass mode and would fail silently in production (Firestore rules would block writes with non-matching `ownerUid`).

---

## 13. Non-Functional Buttons and UI Elements

| App | Location | Element | Issue |
|-----|----------|---------|-------|
| furr-clinic | `src/app/page.tsx:163` | "View Chart" button | No onClick handler |
| furr-clinic | `src/app/appointments/page.tsx:99-104` | "Admit" / "Reschedule" | No onClick handlers |
| furr-clinic | `src/app/records/page.tsx:112` | "Open File" button | No onClick handler |
| furr-clinic | `src/app/staff/page.tsx:52` | "+ Add Staff" button | No onClick handler |
| furr-clinic | `src/app/appointments/page.tsx:56` | "+ Book Walk-in" button | No onClick handler |
| furr-clinic | `src/app/checkin/page.tsx:147` | "Emergency Chart" button | No onClick handler |
| furr-admin | `src/app/vet-desk/page.tsx:235` | "Preview Document" | Styled as clickable but no handler |
| furr-owner | `app/(tabs)/index.tsx:33-35` | Notifications bell | No onPress handler |
| furr-owner | `app/(tabs)/profile.tsx:10-13` | "Account details" / "Help" | Routes are `null` |
| furr-owner | `app/subscription/paywall.tsx:152-155` | "Terms" / "Privacy Policy" | Decorative text — no link |

---

## 14. Unused Dependencies

### apps/furr-vet-mobile
| Package | Listed | Actually Used |
|---------|--------|---------------|
| `expo-haptics` | Yes | Never imported |
| `expo-linear-gradient` | Yes | Never imported |
| `expo-secure-store` | Yes | Never imported |
| `react-native-svg` | Yes | Never imported |
| `react-native-reanimated` | Yes | Only for unused bottom-sheet |

### apps/furr-clinic
| Package | Listed | Actually Used |
|---------|--------|---------------|
| `@furr/core` | Yes | Never imported in any source file |
| `@furr/firebase` | Yes | Never imported in any source file |

### packages/ui
| Package | Used in Source | Listed in package.json |
|---------|---------------|----------------------|
| `react-native-reanimated` | Yes (`Button.tsx`) | **Missing from dependencies** |
| `expo-haptics` | Yes (`Button.tsx`) | **Missing from dependencies** |

---

## 15. Form Validation Gaps (Detailed)

| Screen | Missing Validation |
|--------|-------------------|
| `furr-owner/app/expenses/add.tsx` | No check for negative/zero amounts |
| `furr-owner/app/care/training.tsx:28` | Duration accepts negative/zero/text |
| `furr-owner/app/health/add-vaccination.tsx` | No validation for unreasonably old dates |
| `furr-owner/app/health/add-medication.tsx:256` | Can submit with zero weekly days |
| `furr-owner/app/community/meetup/new.tsx` | Can schedule meetups in the past |
| `furr-owner/app/reminders/add-reminder.tsx:167` | Free text for date instead of DateTimePicker |
| `furr-owner/app/pet/add.tsx:83` | Allows birth dates in year 1900 |
| `furr-owner/app/shop/[id].tsx:156` | No stock check before add to cart |
| `furr-admin/src/app/clinics/page.tsx:33-35` | Only validates 3 of 10+ fields |
| `furr-admin/src/app/marketplace/page.tsx:47-48` | Price can be negative, rating > 5 |
| `furr-vet-mobile/app/(tabs)/scan.tsx:66` | Redemption code: maxLength=10 but expects 6 chars |

---

## 16. Code Quality Issues

### IS_DEV_BYPASS Pattern Duplication
The same env-check pattern is **redefined in 10+ files** instead of importing from `packages/firebase/src/env.ts`:
```typescript
// Defined separately in: vet.ts, pets.ts, owner-profile.ts, health.ts, 
// reminders.ts, sharing.ts, storage.ts, and more
const IS_DEV_BYPASS = typeof process !== 'undefined' 
  && !process.env?.EXPO_PUBLIC_FIREBASE_API_KEY 
  && !process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;
```
A shared `env.ts` export exists but isn't used by most files.

### Unused Dependencies (furr-vet-mobile)
| Package | Status |
|---------|--------|
| `expo-haptics` | Listed but never imported |
| `expo-linear-gradient` | Listed but never imported |
| `expo-secure-store` | Listed but never imported |
| `react-native-svg` | Listed but never imported |
| `react-native-reanimated` | Required by unused bottom-sheet |

### 40+ Console Statements in Production Code
- 32 `console.warn` instances
- 9 `console.error` instances
- No structured logging system
- No way to disable in production builds

### 13 Nested Context Providers
`apps/furr-owner/app/_layout.tsx` wraps the app in 13 providers, causing unnecessary re-render cascades.

### Inconsistent Package Manager Versions
- Root: `pnpm@10.16.1`
- furr-admin: `pnpm@10.12.1`
- furr-vet: `pnpm@10.12.1`

---

## 17. Accessibility Issues

| Issue | Location | Impact |
|-------|----------|--------|
| No ARIA labels on icon-only buttons | All apps | Screen readers cannot identify actions |
| Tables use `<div>` grids instead of `<table>` | Admin portal | Breaks table navigation in assistive tech |
| No visible focus indicators | Custom-styled elements | Keyboard users can't see what's focused |
| Color contrast issues | Admin links `#C9D4D6` on dark bg | May fail WCAG AA 4.5:1 |
| OTP input not screen-reader friendly | `packages/ui/src/components/OtpInput.tsx` | Each box read as separate element |
| No skip-to-content links | Web portals | Cannot skip navigation |

---

## 18. Firebase/Firestore Issues

| Issue | Details | Severity |
|-------|---------|----------|
| Overly permissive rules on care/family/insurance collections | Any authenticated user can CRUD any user's data | HIGH |
| `telemedicine_messages` readable by any authenticated user | Should restrict to consultation participants | HIGH |
| No composite indexes defined for complex queries | Queries will fail at runtime without indexes | MEDIUM |
| reCAPTCHA verifier memory leak | DOM element never removed on expiry | LOW |
| String date comparison for grant expiry in rules | `grantExpiresAt > request.time` compares string to timestamp | MEDIUM |
| Grant ID format hardcoded in rules | `request.auth.uid + '_' + petId` must be maintained by all clients | MEDIUM |
| No Firestore offline persistence for web | Web portals show empty states when offline | MEDIUM |

---

## 19. CI/CD Pipeline Gaps

The CI pipeline (`.github/workflows/ci.yml`) only does:
1. Install dependencies
2. Run typecheck
3. Build web portals and functions

**Missing from CI:**
- No test execution step (no tests exist)
- No linting enforcement
- No security scanning (npm audit, Snyk)
- No Firestore rules validation/testing
- No deployment automation
- No preview deployments for PRs
- No environment variable validation
- No build for mobile apps (Expo EAS)

---

## 20. Priority Roadmap (Suggested Fix Order)

### P0 — Block Deployment (Must Fix)
1. Implement `redeemGrant` Cloud Function (core feature is broken)
2. Add real auth middleware to admin, clinic, vet portals
3. Fix admin gate that grants access on auth failure
4. Fix Firestore rules for care/family/insurance/messages collections
5. Replace `Math.random()` with `crypto.getRandomValues()` for grant codes
6. Fix `subscribeToReminders` memory leak

### P1 — Required for Any User-Facing Launch
7. Integrate Stripe for real payments and subscriptions
8. Wire admin portal to real Firestore backend
9. Implement real telemedicine messaging (persist to Firestore)
10. Add QR code scanning to vet mobile app
11. Add error boundaries to all apps
12. Add input validation on all forms
13. Fix walk distance tracking (use real GPS)
14. Add auth gate to vet mobile app

### P2 — Production Quality
15. Add test suite (at minimum for @furr/core and payment flows)
16. Add pagination to all list queries
17. Implement offline support for mobile
18. Add composite Firestore indexes
19. Replace `as never` with typed routes
20. Consolidate `IS_DEV_BYPASS` to use shared env module
21. Add security headers to all Next.js apps
22. Implement audit logging

### P3 — Scale & Polish
23. Create missing packages (payments, chat, search, location, notifications)
24. Add i18n (Sinhala/Tamil)
25. Performance optimization (reduce context providers, add virtualization)
26. Accessibility audit and fixes
27. Dark mode support
28. E2E testing suite

---

## Summary

The FURR platform has a **well-structured monorepo architecture** and good type system foundations, but is fundamentally a **working prototype** with extensive UI work and minimal backend integration. The gap between the visual completeness of the apps and their actual functionality is significant:

- **What looks done:** Navigation, screens, forms, styling, layout
- **What's actually working:** Basic auth, pet CRUD (dev mode), health record viewing (dev mode), push notifications via Cloud Functions
- **What's completely missing:** Payments, real-time messaging, video calls, GPS tracking, search, marketplace transactions, service bookings, insurance, analytics, admin operations

Estimated effort to reach production for core features (health records + vet sharing + basic marketplace): **8-12 developer weeks**.  
Estimated effort for full platform plan: **6-9 developer months**.
