# FURR Platform - Comprehensive Project Guide

## Table of Contents

- [1. Overview](#1-overview)
- [2. Technology Stack](#2-technology-stack)
- [3. Monorepo Structure](#3-monorepo-structure)
- [4. Applications](#4-applications)
  - [4.1 furr-owner (Mobile)](#41-furr-owner-mobile)
  - [4.2 furr-provider (Mobile)](#42-furr-provider-mobile)
  - [4.3 furr-vet-mobile (Mobile)](#43-furr-vet-mobile-mobile)
  - [4.4 furr-admin (Web)](#44-furr-admin-web)
  - [4.5 furr-vet (Web)](#45-furr-vet-web)
  - [4.6 furr-clinic (Web)](#46-furr-clinic-web)
  - [4.7 furr-marketplace (Web)](#47-furr-marketplace-web)
- [5. Shared Packages](#5-shared-packages)
  - [5.1 @furr/core](#51-furrcore)
  - [5.2 @furr/firebase](#52-furrfirebase)
  - [5.3 @furr/functions](#53-furrfunctions)
  - [5.4 @furr/ui](#54-furrui)
- [6. Firebase Backend](#6-firebase-backend)
  - [6.1 Cloud Functions](#61-cloud-functions)
  - [6.2 Firestore Collections](#62-firestore-collections)
  - [6.3 Security Rules](#63-security-rules)
  - [6.4 Storage Rules](#64-storage-rules)
  - [6.5 Composite Indexes](#65-composite-indexes)
- [7. Authentication & Authorization](#7-authentication--authorization)
- [8. Payment Integrations](#8-payment-integrations)
- [9. Push Notifications](#9-push-notifications)
- [10. Environment Configuration](#10-environment-configuration)
- [11. Development Setup](#11-development-setup)
- [12. CI/CD Pipeline](#12-cicd-pipeline)
- [13. Deployment](#13-deployment)
- [14. Feature Branch History](#14-feature-branch-history)
- [15. Design System](#15-design-system)

---

## 1. Overview

**FURR** is a comprehensive pet care platform targeting the Sri Lankan market. It is a full-stack ecosystem connecting pet owners, veterinary professionals, clinics/hospitals, service providers (groomers, walkers, sitters, trainers), and marketplace vendors through a unified platform.

The platform consists of **7 applications** (3 mobile, 4 web) powered by a shared Firebase backend, organized as a **pnpm monorepo** with 4 shared packages.

### Key Business Features

| Feature | Description |
|---------|-------------|
| Pet Health Records | Digital vaccination, medication, weight, and observation tracking |
| Vet Access Sharing | Time-limited, owner-controlled health record sharing via 6-char codes |
| Telemedicine | Video/chat consultations between owners and vets |
| Marketplace | E-commerce for pet food, medicine, toys, accessories |
| Service Booking | Grooming, walking, sitting, training, transport |
| Lost & Found | Amber alert system with push notifications and pet matching |
| Adoption | Listings, applications, and shelter profiles |
| Community | Forums, meetups, playdates |
| Daily Care | Feeding schedules, walk tracking, training logs |
| Family Sharing | Multi-member household pet access |
| Insurance | Pet insurance policies and claims |
| Clinic Operations | Patient queue, appointments, staff management |

### Target Market

- **Country:** Sri Lanka
- **Currency:** LKR (Sri Lankan Rupee)
- **Vet Council:** SLVC (Sri Lanka Veterinary Council)
- **Locations:** Colombo, Kandy, Galle (pre-configured clinic branches)
- **Phone Format:** +94 (Sri Lanka country code)
- **Timezone:** Asia/Colombo
- **Local Payments:** PayHere (Genie, EzCash, Frimi wallets)
- **SMS:** Dialog/Mobitel gateways

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Mobile Apps | Expo / React Native | SDK 57 / RN 0.86.2 |
| Web Apps | Next.js | 16.3.0 |
| UI Framework (Web) | Tailwind CSS | 4 |
| Language | TypeScript | 5-6 |
| React | React | 19.2.x |
| Backend | Firebase | - |
| Database | Cloud Firestore | - |
| Auth | Firebase Authentication | - |
| File Storage | Firebase Storage | - |
| Cloud Functions | Firebase Functions (Gen 2) | v6.3 |
| Functions Runtime | Node.js | 20 |
| Admin SDK | firebase-admin | ^13.1.0 |
| Client SDK | firebase | 12.16.0 |
| Package Manager | pnpm | 10.16.1 |
| CI/CD | GitHub Actions | - |
| Push Notifications | Expo Push Notification Service | - |
| Payments (International) | Stripe | - |
| Payments (Local) | PayHere Sri Lanka | - |
| Navigation (Mobile) | Expo Router | - |
| Navigation (Web) | Next.js App Router | - |

---

## 3. Monorepo Structure

```
FURR-PRODUCT/
├── .editorconfig                 # Code style (UTF-8, LF, 2-space indent)
├── .env.example                  # Environment variable template
├── .firebaserc                   # Firebase project aliases
├── .github/workflows/ci.yml     # CI pipeline
├── .gitignore
├── firebase.json                 # Firebase services configuration
├── package.json                  # Root workspace scripts
├── pnpm-lock.yaml
├── pnpm-workspace.yaml           # Workspace definition
│
├── apps/
│   ├── furr-owner/               # Pet owner mobile app (Expo)
│   ├── furr-provider/            # Service provider mobile app (Expo)
│   ├── furr-vet-mobile/          # Vet companion mobile app (Expo)
│   ├── furr-admin/               # Internal admin web portal (Next.js)
│   ├── furr-vet/                 # Vet web portal (Next.js)
│   ├── furr-clinic/              # Clinic operations web portal (Next.js)
│   └── furr-marketplace/         # E-commerce web storefront (Next.js)
│
├── packages/
│   ├── core/                     # Domain types, validation, business logic
│   ├── firebase/                 # Firebase client SDK wrapper
│   ├── functions/                # Firebase Cloud Functions
│   └── ui/                       # Shared React Native UI components
│
├── firebase/
│   ├── firestore.rules           # Firestore security rules
│   ├── firestore.indexes.json   # Composite indexes
│   └── storage.rules             # Storage security rules
│
└── docs/
    ├── FIREBASE_SETUP.md         # Firebase setup guide
    ├── PRODUCTION_BUILD.md       # Build & deploy sequence
    ├── design/                   # Design reference assets
    └── qa/                       # QA comparison screenshots
```

### Root Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `pnpm owner` | `pnpm --filter @furr/owner start` | Start owner mobile app |
| `pnpm vet` | `pnpm --filter @furr/vet start` | Start vet web portal |
| `pnpm admin` | `pnpm --filter @furr/admin start` | Start admin portal |
| `pnpm vet:dev` | `pnpm --filter @furr/vet dev` | Vet portal dev mode |
| `pnpm admin:dev` | `pnpm --filter @furr/admin dev` | Admin portal dev mode |
| `pnpm test` | `pnpm -r --if-present test` | Run all tests |
| `pnpm typecheck` | `pnpm -r --if-present typecheck` | Typecheck all packages |
| `pnpm lint` | `pnpm -r --if-present lint` | Lint all packages |

---

## 4. Applications

### 4.1 furr-owner (Mobile)

**Package:** `@furr/owner`
**Framework:** Expo 57 / React Native 0.86.2
**Bundle ID:** `com.furr.owner` | **Scheme:** `furr`
**Dependencies:** `@furr/core`, `@furr/firebase`, `@furr/ui`

The primary consumer app — a comprehensive pet management super-app for pet owners.

#### Features

- Pet profiles (add, edit, archive, restore)
- Health tracking (vaccinations, medications, weight, observations, flags, documents)
- Health timeline view
- Daily care (feeding schedules/logs, walk tracking, training logs)
- Routines & reminders with scheduled push notifications
- Expense tracking with categories
- Marketplace/shop (browse, cart, checkout, order history)
- Service booking (grooming, walking, sitting, training, transport)
- Telemedicine (video/chat consultations with vets)
- Community (forums, meetups, discussion threads)
- Lost & Found (report lost pets, amber alerts, pet ID cards)
- Adoption (browse listings, apply)
- Family sharing (multi-member household access)
- Insurance (policy info, claims)
- Health record sharing (QR codes, access grants for vets)
- Push notifications (expo-notifications, "pet-care" channel)
- Subscription/paywall (premium tiers)

#### Authentication

Phone-based OTP authentication flow:
1. Enter phone number (+94)
2. Receive OTP via SMS
3. Verify OTP
4. Set display name (first-time users)

#### Navigation (Expo Router)

**Tab Bar:** Home, Shop, Services, Care, Profile

**Stack Screens:**
- `auth/` — phone, otp, name
- `health/` — timeline, add-weight, add-medication, add-vaccination, add-observation, add-flag, documents, upload-document
- `sharing/` — manage grants, QR display
- `reminders/` — list, add
- `adoption/` — list, detail, apply
- `care/` — feeding, training, walk
- `community/` — forum, meetup
- `expenses/` — list, add
- `family/`, `insurance/`, `lost-found/`, `notifications/`, `reviews/`, `services/`, `subscription/`, `telemedicine/`, `shop/`

#### Context Providers (13)

Auth, Pets, Health, Subscription, Expenses, Routines, Marketplace, Services, Telemedicine, Community, Care, LostFound, Family

#### Key Libraries

- `expo-notifications` — push notifications
- `expo-location` — location services
- `expo-image-picker` / `expo-image-manipulator` — photo capture & compression
- `expo-document-picker` — file uploads
- `expo-print` / `expo-sharing` — PDF generation & sharing
- `react-native-gifted-charts` — health data visualizations
- `@gorhom/bottom-sheet` — modal sheets

---

### 4.2 furr-provider (Mobile)

**Package:** `@furr/provider`
**Framework:** Expo 57 / React Native 0.86.2
**Bundle ID:** `com.furr.provider` | **Scheme:** `furrprovider`
**Dependencies:** `@furr/core`, `@furr/firebase`, `@furr/ui`

Mobile app for pet service providers and marketplace vendors to manage their business.

#### Features

- Studio dashboard (business overview, metrics)
- Booking management (view, accept, decline, start, complete)
- Product management (add/edit marketplace products — for vendor-enabled providers)
- Earnings tracking (revenue, payouts)
- Chat system (in-app messaging with customers)
- Profile management (services, availability, portfolio)
- Onboarding flow (new provider setup)

#### Navigation

**Tab Bar:** Studio, Bookings (with pending badge), Products (conditional for vendors), Earnings, Profile

**Stack Screens:**
- `bookings/[bookingId]` — booking detail
- `bookings/complete` — completion flow
- `chat/` — messaging
- `onboarding/` — new provider setup
- `products/add` — add product
- `profile/` — edit profile

#### Context Providers (6)

ProviderAuth, ProviderProfile, ProviderBookings, ProviderProducts, ProviderEarnings, ProviderChat

---

### 4.3 furr-vet-mobile (Mobile)

**Package:** `@furr/vet-mobile`
**Framework:** Expo 57 / React Native 0.86.2
**Bundle ID:** `com.furr.vet` | **Scheme:** `furrvet`
**Dependencies:** `@furr/core`, `@furr/firebase`, `@furr/ui`

Mobile companion app for veterinarians — field access to patient records and telehealth.

#### Features

- Duty Desk (daily task dashboard)
- QR/intake scanning (scan pet QR codes for instant record access)
- Telehealth consultations (video/chat management)
- Pet record viewer
- Profile management

#### Navigation

**Tab Bar:** Duty Desk, Intake/QR, Telehealth, Profile

**Stack Screens:**
- `pet/[petId]` — view pet health record

#### Context Providers (3)

VetAuth, VetGrants, VetConsults

---

### 4.4 furr-admin (Web)

**Package:** `@furr/admin`
**Framework:** Next.js 16.3.0 + Tailwind CSS 4
**Port:** 3000
**Dependencies:** `@furr/core`, `@furr/firebase`

Internal administrative operations console — the platform "command center."

#### Features

- Platform overview dashboard
- Vet application verification (SLVC accreditation)
- Clinic/hospital management (registration, accreditation, suspension)
- Marketplace product management (CRUD, stock, featured items)
- Order dispatch and status management
- Service provider verification
- Community content moderation (meetups, forums, lost pet alerts)
- Dispute/refund resolution
- User account management (suspend, role changes)
- Finance/vendor payout settlements
- Audit logging (immutable ledger)
- Analytics/telemetry dashboard
- Database seeding (dev mode)

#### Routes

| Path | Description |
|------|-------------|
| `/` | Platform overview dashboard |
| `/vet-desk` | Vet verification queue |
| `/clinics` | Clinic/hospital management |
| `/marketplace` | Products and orders |
| `/services` | Provider management |
| `/community` | Meetups, forums, lost alerts |
| `/disputes` | Dispute resolution |
| `/finance` | Payouts and settlements |
| `/users` | User support desk |
| `/analytics` | Platform telemetry |
| `/audit-logs` | Security audit trail |

#### Gate

`AdminGate` component restricts access. Middleware enforces security headers (X-Frame-Options: DENY, HSTS, nosniff, referrer-policy, CSP).

---

### 4.5 furr-vet (Web)

**Package:** `@furr/vet`
**Framework:** Next.js 16.3.0 + Tailwind CSS 4
**Port:** 3000
**Dependencies:** `@furr/core`, `@furr/firebase`

Professional vet portal — allows verified veterinarians to access shared pet health records via time-limited owner access codes.

#### Features

- Professional sign-in with SLVC profile validation
- Access code redemption (6-character codes from pet owners)
- Time-limited, owner-controlled record sharing
- Health data viewer component
- Consultation management
- Privacy-first design (owner decides what categories are shared)
- Dev preview mode with mock professional profiles

#### Routes

| Path | Description |
|------|-------------|
| `/` | Dashboard (sign-in panel or workspace view with code redemption + active grants) |
| `/consults` | Consultation queue |
| `/pets/[ownerUid]/[petId]` | Individual pet record viewer (with grant verification) |

#### Gate

`VetGate` component. Must have `ProfessionalProfile` with status "ACTIVE" to access.

---

### 4.6 furr-clinic (Web)

**Package:** `@furr/clinic`
**Framework:** Next.js 16.3.0 + Tailwind CSS 4
**Port:** 3000
**Dependencies:** `@furr/core`, `@furr/firebase`

Clinic/hospital operations system for staff (administrators, triage nurses, reception).

#### Features

- Real-time patient admission queue with triage status
- Patient check-in workflow
- Appointment calendar and scheduling
- Medical records access
- Staff duty allocation
- Multi-branch support (Colombo, Kandy, Galle)
- Live queue sync with Firestore

#### Routes

| Path | Description |
|------|-------------|
| `/` | Today's hospital flow overview (KPIs, live queue table) |
| `/checkin` | Patient intake/admission |
| `/appointments` | Day calendar |
| `/records` | Medical files |
| `/staff` | Practitioners and staff management |

#### Gate

`ClinicGate` component. Operator profiles defined per role.

---

### 4.7 furr-marketplace (Web)

**Package:** `@furr/marketplace`
**Framework:** Next.js 16.3.0 + Tailwind CSS 4
**Port:** 3002
**Dependencies:** `@furr/core`, `@furr/firebase`

Customer-facing e-commerce storefront — "Sri Lanka's #1 Pet Pharmacy & Nutrition Hub."

#### Features

- Product catalog with categories (food, medicine, toys, accessories, hygiene, beds, clothing)
- Species-based filtering (dog, cat, all)
- Search, sort, and category filtering
- Shopping cart with localStorage persistence
- Coupon codes (FURR10 = 10% off, PETLOVE = LKR 500 off)
- Free delivery over LKR 10,000
- Order placement (card, COD, wallet)
- Product detail pages with dynamic routing
- User authentication (email/password)
- Order history
- Responsive design with promotional banners

#### Routes

| Path | Description |
|------|-------------|
| `/` | Homepage (hero, featured products, category grid, promos) |
| `/products` | Full product catalog with filters |
| `/products/[id]` | Product detail page |
| `/cart` | Shopping cart |
| `/orders` | Order history |
| `/auth` | Login/signup |

#### Contexts

- `AuthContext` — Firebase email/password authentication
- `MarketplaceContext` — Products, cart, orders

---

## 5. Shared Packages

### 5.1 @furr/core

**Path:** `packages/core/`
**Entry:** `./src/index.ts`
**Dependencies:** None (pure TypeScript)
**Tests:** 12 test files using `tsx --test`

The domain model layer — all shared types, constants, validation functions, and business logic.

#### Modules

| Module | Exports |
|--------|---------|
| `index.ts` | `AppRole` (7 roles), `RecordProvenance`, `PhoneAuthStep`, `OwnerProfile`, `Pet`, `HealthRecord`, phone utilities (`normalisePhone`, `isValidE164`, `formatPhoneDisplay`), demo data |
| `health.ts` | Vaccination, Medication, Weight, Observation, HealthFlag, PetDocument, `buildTimeline()` |
| `sharing.ts` | AccessGrant types (SHR-001/002), Reminder types |
| `vet.ts` | `ProfessionalProfile` with SLVC registration |
| `marketplace.ts` | Product, CartItem, Order, OrderAddress, ProductReview, `PRODUCT_CATEGORIES` |
| `services.ts` | ServiceProvider, ServiceBooking, ServiceItem, `SriLankaLocations`, `calculateDistanceKm()`, `isProviderAvailable()` |
| `telemedicine.ts` | Consultation, ConsultationMessage, VetPrescriptionItem |
| `community.ts` | PetMeetup, ForumQuestion, ForumAnswer, PlaydateProfile |
| `care.ts` | FeedingSchedule, FeedingLog, WalkActivity, TrainingLog |
| `lostfound.ts` | LostPetAlert, FoundPetReport, PetDigitalId (QR-based) |
| `family.ts` | Household, HouseholdMember, FamilyMember, InsurancePolicy, InsuranceClaim |
| `routines.ts` | RoutineTask |
| `expenses.ts` | Expense (categories: Vet, Food, Grooming, Toys, Other) |
| `payments.ts` | PaymentIntent, BillingHistoryItem, ProviderPayout, `formatCurrency()`, `calculatePlatformCommission()`, `calculateProviderEarnings()` |
| `adoption.ts` | AdoptionListing, AdoptionApplication, ShelterProfile, `validateAdoptionApplication()` |
| `reviews.ts` | UniversalReview, RatingBreakdown, `calculateRatingBreakdown()`, `validateReviewInput()` |

#### AppRole Enum

```
owner | vet | clinic_admin | seller | admin | professional | clinic_operator
```

---

### 5.2 @furr/firebase

**Path:** `packages/firebase/`
**Entry:** `./src/index.ts`
**Dependencies:** `firebase@12.16.0`, `@furr/core`

The Firebase client SDK wrapper — all Firestore, Auth, and Storage operations. No app imports from `firebase/*` directly; everything goes through this package.

#### Key Design Patterns

- **Dev Bypass Mode:** `IS_DEV_BYPASS` flag — when no Firebase API key is present, all repositories use in-memory stores with mock data
- **Dual Env Support:** Handles both `EXPO_PUBLIC_*` and `NEXT_PUBLIC_*` prefixes
- **Lazy Imports:** Firebase SDK modules lazy-loaded to reduce bundle size

#### Source Modules (26)

| Module | Purpose |
|--------|---------|
| `auth.ts` | `sendPhoneOtp()`, `verifyOtp()`, `signInWithEmail()`, `createUserWithEmail()`, `signOut()`, `subscribeToAuthState()` |
| `owner-profile.ts` | `getOwnerProfile()`, `saveOwnerProfile()`, `createOwnerProfile()`, `updateSubscriptionTier()`, `updatePushToken()` |
| `pets.ts` | `subscribeToPets()`, `createPet()`, `updatePet()`, `archivePet()`, `restorePet()` |
| `health.ts` | Vaccination, Medication, Weight, Observation, Flag CRUD with realtime subscriptions |
| `storage.ts` | Document upload (JPEG/PNG/PDF, max 10MB) |
| `sharing.ts` | Grant creation, subscription, revocation, vet redemption (Cloud Function call) |
| `vet.ts` | `getProfessionalProfile()`, dev profiles |
| `marketplace.ts` | Product subscription, order creation (calls `processMarketplaceOrder` function) |
| `telemedicine.ts` | Consultation lifecycle: subscribe, create, update, send messages |
| `admin.ts` | Admin panel repositories with mock data |
| `clinic.ts` | Queue management, appointments, staff tracking |
| `provider.ts` | Provider profile, booking lifecycle, product CRUD, payouts |
| `payments.ts` | `createPaymentIntent()`, `confirmPayment()`, `subscribeToBillingHistory()` |
| `routines.ts` | Routine task CRUD |
| `expenses.ts` | Expense CRUD |
| `community.ts` | Meetups, forums |
| `care.ts` | Feeding schedules, walk activities, training logs |
| `lostfound.ts` | Lost alerts, found reports |
| `family.ts` | Family members, insurance |
| `services.ts` | Service providers, bookings |
| `adoption.ts` | Adoption listings, applications |
| `reviews.ts` | Review CRUD |
| `seed.ts` | Database seeding utilities |
| `reminders.ts` | Reminder management (separate import path) |
| `env.ts` | `IS_DEV_BYPASS` configuration |

---

### 5.3 @furr/functions

**Path:** `packages/functions/`
**Entry:** `lib/index.js` (compiled from TypeScript)
**Runtime:** Node.js 20
**Dependencies:** `firebase-admin@^13.1.0`, `firebase-functions@^6.3.0`, `@furr/core`

All Firebase Cloud Functions deployed to the backend. Uses Gen 2 (v2) APIs.

See [Section 6.1 Cloud Functions](#61-cloud-functions) for detailed breakdown.

---

### 5.4 @furr/ui

**Path:** `packages/ui/`
**Entry:** `./src/index.ts`
**Peer Dependencies:** `react>=19`, `react-native>=0.76`, `expo-haptics`, `react-native-reanimated`

Shared design system — design tokens and React Native components for all mobile apps.

#### Design Tokens

```javascript
colors: {
  ink: '#1A1A2E',        // Primary text
  muted: '#6B7280',      // Secondary text
  canvas: '#FAFAFA',     // Background
  surface: '#FFFFFF',    // Card surface
  line: '#E5E7EB',       // Borders
  brand: '#7B61FF',      // Primary brand (purple)
  brandDark: '#5B3FD9',  // Pressed state
  brandSoft: '#EDE9FE',  // Soft background
  accent: '#F59E0B',     // Amber accent
  success: '#10B981',    // Green success
  danger: '#EF4444',     // Red error
  softBrand: '#F3F0FF',
  pearl: '#FFF7ED',
  mist: '#F0FDF4',
  warm: '#FEF3C7',
  onBrand: '#FFFFFF',
  calm: '#DBEAFE'
}

radius: { sm: 12, md: 16, lg: 24, xl: 32, pill: 999 }
space: { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 }
shadows: { none, sm, md, lg, xl } // 5 elevation levels
```

#### Components

| Component | Description |
|-----------|-------------|
| `Button` | Animated pressable with haptic feedback, 4 variants (primary/secondary/text/danger), loading state, pill-shaped with spring animation |
| `TextInput` | Labeled text input with focus states, error/hint display, brand-colored focus ring |
| `OtpInput` | 6-digit OTP code input with visual digit boxes and cursor animation |
| `KeyboardScreen` | KeyboardAvoidingView + ScrollView wrapper for form screens |
| `ErrorBoundary` | Class-based error boundary with branded fallback UI |
| `EmptyState` | Centered empty state with emoji/icon, title, description, optional action button |
| `SkeletonLoader` / `SkeletonCard` | Pulsing skeleton loading placeholders |
| `ReviewStars` | Star rating display (static or interactive) |

---

## 6. Firebase Backend

### 6.1 Cloud Functions

#### Event Triggers (Firestore Document Listeners)

| Function | Trigger | Collection | Purpose |
|----------|---------|-----------|---------|
| `onLostPetAlertCreated` | `onDocumentCreated` | `lost_pet_alerts/{alertId}` | Sends push notifications to pet owners in same district (capped at 200) |
| `onTelehealthMessageSent` | `onDocumentCreated` | `telemedicine_messages/{msgId}` | Notifies recipient of new telehealth chat message |
| `onOrderStatusUpdated` | `onDocumentUpdated` | `marketplace_orders/{orderId}` | Notifies buyer of order status changes |
| `onVetApplicationStatusChanged` | `onDocumentUpdated` | `admin_vet_applications/{appId}` | On approval: sets `vet` custom claim, creates verified profile |
| `onFoundPetReportCreated` | `onDocumentCreated` | `found_pet_reports/{reportId}` | Matches found pets against active lost alerts (city + species) |
| `onCommunityQuestionCreated` | `onDocumentCreated` | `community_questions/{qId}` | Content moderation (banned patterns, URL shorteners) |
| `onReviewCreatedOrUpdated` | `onDocumentWritten` | `reviews/{reviewId}` | Recalculates average rating for products/providers |

#### Callable Functions (HTTPS onCall)

| Function | Purpose | Security |
|----------|---------|----------|
| `redeemGrantCode` | Vet redeems 6-char access code | Rate limited (10/5min), transactional |
| `writeAdminAuditLog` | Tamper-proof admin audit trail | Admin claim required, `crypto.randomUUID` |
| `deleteUserAccount` | GDPR cascade deletion (pets, subcollections, root docs, auth) | Owner-only |
| `generateHealthReport` | Aggregates pet health records | SHA-256 integrity checksum |
| `handlePaymentWebhook` | Processes Stripe/PayHere payments | HMAC signature verification |
| `processMarketplaceOrder` | Server-side price validation, stock check, atomic inventory decrement | Transactional |

#### Scheduled Maintenance

| Function | Schedule | Purpose |
|----------|----------|---------|
| `cleanupExpiredGrants` | Every 24 hours | Expires access grants past `grantExpiresAt` (batches of 400) |
| `sendReminderNotifications` | Every 1 hour (Asia/Colombo) | Push notifications for due pet care reminders |
| `cleanupStalePushTokens` | Every 24 hours (Asia/Colombo) | Removes invalid Expo push tokens |

---

### 6.2 Firestore Collections

The platform uses **30+ Firestore collections** organized by domain:

#### User & Pet Data

| Collection Path | Description |
|----------------|-------------|
| `users/{uid}` | Owner profiles |
| `users/{uid}/billing_history` | Payment history |
| `users/{uid}/grants` | Access grants issued |
| `users/{uid}/pets/{petId}` | Pet profiles |
| `users/{uid}/pets/{petId}/vaccinations` | Vaccination records |
| `users/{uid}/pets/{petId}/medications` | Medication plans |
| `users/{uid}/pets/{petId}/weights` | Weight entries |
| `users/{uid}/pets/{petId}/observations` | Health observations |
| `users/{uid}/pets/{petId}/flags` | Health flags (allergies, conditions) |
| `users/{uid}/pets/{petId}/documents` | Medical documents |
| `users/{uid}/pets/{petId}/reminders` | Scheduled reminders |

#### Care & Routines

| Collection | Description |
|-----------|-------------|
| `routines` | Daily routine tasks |
| `expenses` | Pet expense records |
| `care_feeding_schedules` | Feeding schedules |
| `care_walk_activities` | Walk activity logs |

#### Social & Community

| Collection | Description |
|-----------|-------------|
| `family_members` | Family sharing members |
| `insurance_policies` | Pet insurance |
| `lost_pet_alerts` | Lost pet reports (public read) |
| `found_pet_reports` | Found pet reports (public read) |
| `community_meetups` | Pet meetups (public read) |
| `community_questions` | Forum questions (public read) |

#### Commerce

| Collection | Description |
|-----------|-------------|
| `marketplace_products` | Product catalog (public read) |
| `marketplace_orders` | Purchase orders |
| `service_providers` | Provider profiles (public read) |
| `service_bookings` | Service bookings |
| `adoption_listings` | Adoption listings (public read) |
| `adoption_applications` | Adoption applications |
| `reviews` | Product/provider reviews (public read) |
| `payment_intents` | Payment processing |

#### Telehealth

| Collection | Description |
|-----------|-------------|
| `telemedicine_consultations` | Consultation sessions |
| `telemedicine_messages` | Chat messages |

#### Admin & Clinic Operations

| Collection | Description |
|-----------|-------------|
| `clinics` | Registered clinics (public read) |
| `vets` | Verified vets (public read) |
| `professionals` | Professional profiles |
| `disputes` | Dispute tickets |
| `admin_vet_applications` | Vet verification queue |
| `admin_clinics` | Admin clinic registry |
| `admin_disputes` | Admin dispute management |
| `admin_audit_logs` | Immutable audit trail |
| `admin_payouts` | Admin payout records |
| `provider_payouts` | Provider earnings/payouts |
| `clinic_queue` | Patient queue |
| `clinic_appointments` | Clinic appointments |
| `clinic_staff` | Staff roster |

---

### 6.3 Security Rules

Located at `firebase/firestore.rules`. Production-hardened with role-based access control.

#### Helper Functions

| Function | Purpose |
|----------|---------|
| `isSignedIn()` | Verifies Firebase Auth token present |
| `isOwner(uid)` | Matches request.auth.uid to document owner |
| `hasRole(role)` | Checks custom claim on auth token |
| `isAdmin()` | Checks admin custom claim |
| `isClinicStaff()` | clinic_admin OR vet OR admin |
| `hasActiveGrant(ownerUid, petId)` | Validates vet access grant (checks status + expiry) |

#### Roles (Custom Claims)

| Role | Permissions |
|------|------------|
| `admin` | Full platform access, all collections |
| `clinic_admin` | Clinic operations, patient records |
| `vet` | Patient records (via grants), telehealth |
| `seller` | Marketplace product management |

---

### 6.4 Storage Rules

Located at `firebase/storage.rules`.

| Path | Read | Write | Constraints |
|------|------|-------|-------------|
| `users/{uid}/pets/{petId}/documents/{file}` | Owner only | Owner only | Images + PDF, max 10MB |
| `users/{uid}/pets/{petId}/avatars/{file}` | Any signed-in user | Owner only | Images, max 10MB |
| `lostfound/{uid}/{file}` | Public | Owner | Images, max 10MB |
| `products/{file}` | Public | Admin or seller | Images, max 10MB |
| `reviews/{uid}/{file}` | Public | Owner | Images, max 10MB |

---

### 6.5 Composite Indexes

13 composite indexes defined in `firebase/firestore.indexes.json`:

- `expenses` — (ownerUid ASC, date DESC)
- `routines` — (ownerUid ASC, time ASC)
- `care_walk_activities` — (petId ASC, startTime DESC)
- `care_feeding_schedules` — (petId ASC, time ASC)
- `lost_pet_alerts` — (status ASC, createdAt DESC)
- `found_pet_reports` — (status ASC, createdAt DESC)
- `marketplace_orders` — (ownerUid ASC, createdAt DESC)
- `service_bookings` — (ownerUid ASC, createdAt DESC), (providerId ASC, date DESC)
- `telemedicine_consultations` — (ownerUid ASC, createdAt DESC), (vetUid ASC, createdAt DESC)
- `reminders` (collectionGroup) — (petId ASC, scheduledAt ASC)
- `grants` (collectionGroup) — (status ASC, grantExpiresAt ASC)

---

## 7. Authentication & Authorization

### Authentication Methods

| App | Method |
|-----|--------|
| furr-owner | Phone + OTP (SMS) |
| furr-marketplace | Email + Password |
| furr-vet | Firebase Auth + Professional Profile verification |
| furr-admin | Internal access (AdminGate) |
| furr-clinic | Internal access (ClinicGate) |
| furr-provider | Provider auth flow |
| furr-vet-mobile | Vet auth flow |

### Custom Claims (Set by Cloud Functions)

| Claim | Set By | Purpose |
|-------|--------|---------|
| `admin: true` | Manual / admin tools | Full admin access |
| `vet: true` | `onVetApplicationStatusChanged` | Verified vet access |
| `clinic_admin: true` | Manual | Clinic staff access |
| `seller: true` | Manual / admin tools | Marketplace vendor |

### Access Grant System (Vet Record Sharing)

1. **Owner generates** a 6-character access code (SHR-001/002)
2. **Code has expiry** (time-limited, owner-controlled)
3. **Owner selects** which health categories to share
4. **Vet redeems** code via `redeemGrantCode` callable function
5. **Rate limiting** prevents brute-force (10 attempts per 5 minutes)
6. **Automatic cleanup** via `cleanupExpiredGrants` scheduled function

---

## 8. Payment Integrations

### Stripe (International)

- Card payments
- Subscription management
- Webhook processing with HMAC signature verification
- Idempotent payment confirmation

### PayHere (Sri Lanka Local)

- Local wallets: Genie, EzCash, Frimi
- Merchant ID/Secret authentication
- Sri Lankan mobile payment integration

### Payment Flow

1. Client calls `createPaymentIntent()` 
2. Server validates stock and calculates price server-side
3. Payment processed via Stripe/PayHere
4. `handlePaymentWebhook` confirms payment
5. Post-payment automations (subscription upgrade, order confirmation, booking payment)

### Platform Commission

Calculated via `calculatePlatformCommission()` and `calculateProviderEarnings()` in `@furr/core`.

---

## 9. Push Notifications

**Service:** Expo Push Notification Service
**Endpoint:** `https://exp.host/--/api/v2/push/send`

### Notification Triggers

| Event | Recipients | Message |
|-------|-----------|---------|
| Lost pet alert created | Owners in same district (max 200) | "Lost Pet Alert in [district]" |
| Telehealth message received | Owner or vet (recipient) | "New message from [sender]" |
| Order status updated | Buyer | "Order out for delivery" / "Order delivered" |
| Found pet matches lost alert | Lost pet owner | "Potential match for [pet name]" |
| Reminder due | Pet owner | Reminder content |

### Token Management

- Tokens stored in user profile (`pushToken` field)
- `cleanupStalePushTokens` runs daily to remove invalid tokens
- Token registration via `updatePushToken()` in `@furr/firebase`

---

## 10. Environment Configuration

### Required Environment Variables

```bash
# Firebase Configuration (Expo Mobile Apps)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Firebase Configuration (Next.js Web Apps)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Stripe (International Payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# PayHere (Sri Lanka Local Payments)
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
PAYHERE_APP_ID=
PAYHERE_APP_SECRET=

# SMS Gateway (OTP & Notifications)
SMS_API_KEY=
SMS_SENDER_ID=FURR_CARE

# Expo Push Notifications
EXPO_ACCESS_TOKEN=
```

### Dev Bypass Mode

When `IS_DEV_BYPASS=true` (or no Firebase API key is present), all Firebase repositories switch to in-memory mock stores. This allows development without a live Firebase project.

---

## 11. Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10.16.1+
- Expo CLI (for mobile apps)
- Firebase CLI (for emulators & deployment)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd FURR-PRODUCT

# Install dependencies
pnpm install

# Start Firebase emulators (optional, for local backend)
firebase emulators:start
```

### Running Applications

```bash
# Mobile Apps
pnpm owner                    # Start owner app (Expo)
pnpm --filter @furr/provider start   # Start provider app
pnpm --filter @furr/vet-mobile start # Start vet mobile app

# Web Apps
pnpm admin:dev               # Admin portal (dev mode)
pnpm vet:dev                 # Vet portal (dev mode)
pnpm --filter @furr/clinic dev       # Clinic portal
pnpm --filter @furr/marketplace dev  # Marketplace storefront
```

### Firebase Emulators

| Service | Port |
|---------|------|
| Auth | 9099 |
| Functions | 5001 |
| Firestore | 8080 |
| Storage | 9199 |
| Emulator UI | 4000 |

### Running Tests

```bash
pnpm test          # Run all tests across monorepo
pnpm typecheck     # TypeScript validation across all packages
pnpm lint          # Lint all packages
```

---

## 12. CI/CD Pipeline

**File:** `.github/workflows/ci.yml`
**Trigger:** Push to `main`, Pull Requests to `main`
**Runner:** ubuntu-latest

### Pipeline Steps

1. **Checkout** — Clone repository
2. **Setup** — Node.js 20, pnpm 10.16.1 with store caching
3. **Install** — `pnpm install --frozen-lockfile`
4. **Test** — `pnpm test` (unit tests via `tsx --test`)
5. **Typecheck** — `pnpm -r typecheck` (monorepo-wide TypeScript)
6. **Build** — Builds `@furr/admin`, `@furr/vet`, `@furr/clinic`, `@furr/functions`

### What CI Does NOT Do

- No automated deployment (deployment is manual)
- No E2E tests
- No mobile app builds (EAS Build handled separately)

---

## 13. Deployment

### Firebase Projects

| Alias | Project ID | Purpose |
|-------|-----------|---------|
| `default` | `furr-prod` | Production |
| `staging` | `furr-staging` | Staging/QA |

### Deployment Commands

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules    # Security rules
firebase deploy --only storage            # Storage rules
firebase deploy --only functions          # Cloud Functions
firebase deploy --only firestore:indexes  # Indexes

# Deploy to staging
firebase use staging
firebase deploy
```

### Web App Deployment

Web apps (Next.js) do **not** have Firebase Hosting configured in `firebase.json`. They are likely deployed to:
- Vercel (no config file present — may use Vercel's auto-detection)
- Or self-hosted / separately configured Firebase Hosting

### Mobile App Deployment

Mobile apps (Expo) are built and deployed via:
- **EAS Build** (Expo Application Services) for iOS/Android binary compilation
- **EAS Submit** for App Store / Google Play submission
- **EAS Update** for OTA JavaScript bundle updates

### Cloud Functions Deployment

```bash
# From project root
firebase deploy --only functions

# Functions are built via predeploy hook:
# cd packages/functions && npm run build
```

---

## 14. Feature Branch History

The project was developed in phased feature branches:

| Branch | Phase | Scope |
|--------|-------|-------|
| `feature/phase-0-navigation-foundation` | 0 | Base navigation, auth, Expo Router setup |
| `feature/phase-1-marketplace` | 1 | E-commerce, products, cart, orders |
| `feature/phase-2-services-booking` | 2 | Service providers, booking flow |
| `feature/phase-3-telemedicine-consults` | 3 | Video/chat consultations |
| `feature/phase-4-utility-social-community` | 4 | Forums, meetups, community features |
| `feature/phase-5-daily-care-feeding-activity` | 5 | Feeding, walks, training tracking |
| `feature/phase-6-lost-found-id` | 6 | Lost pet alerts, found reports, pet ID |
| `feature/phase-7-family-insurance` | 7 | Family sharing, insurance policies |
| `feature/phase-8-admin-provider-portal` | 8 | Admin dashboard, provider app |
| `feature/phase-9-polish-performance-testing` | 9 | Polish, performance, testing |
| `fix/codebase-analysis-fixes` | - | Security & audit remediation |

---

## 15. Design System

### Brand Colors

- **Primary:** `#7B61FF` (Purple)
- **Accent:** `#F59E0B` (Amber)
- **Success:** `#10B981` (Green)
- **Danger:** `#EF4444` (Red)

### Typography & Layout

- 2-space indentation
- UTF-8 encoding
- LF line endings
- Mobile-first responsive design
- Pill-shaped buttons with spring animations
- Haptic feedback on interactive elements

### Web Security Headers (All Next.js Apps)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: (restricts to Firebase/Google domains)
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FURR PLATFORM                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MOBILE APPS (Expo/React Native)                        │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Owner   │  │   Provider   │  │   Vet Mobile     │  │
│  │  (iOS/   │  │   (iOS/      │  │   (iOS/          │  │
│  │  Android)│  │   Android)   │  │   Android)       │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬─────────┘  │
│       │                │                    │            │
│  WEB APPS (Next.js)                                     │
│  ┌────────┐ ┌───────┐ ┌────────┐ ┌─────────────────┐   │
│  │ Admin  │ │  Vet  │ │ Clinic │ │  Marketplace    │   │
│  │ Portal │ │Portal │ │ Portal │ │  Storefront     │   │
│  └───┬────┘ └───┬───┘ └───┬────┘ └───────┬─────────┘   │
│      │          │          │              │             │
├──────┼──────────┼──────────┼──────────────┼─────────────┤
│      │          │          │              │             │
│  SHARED PACKAGES                                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │  @furr/core    │  @furr/firebase  │  @furr/ui   │    │
│  │  (Types &      │  (Client SDK     │  (React     │    │
│  │   Logic)       │   Wrapper)       │   Native)   │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                              │
├──────────────────────────┼──────────────────────────────┤
│                          │                              │
│  FIREBASE BACKEND        ▼                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Cloud Functions (Gen 2, Node 20)               │    │
│  │  ├── Callable (6 functions)                     │    │
│  │  ├── Triggers (7 event listeners)               │    │
│  │  └── Scheduled (3 maintenance jobs)             │    │
│  ├─────────────────────────────────────────────────┤    │
│  │  Cloud Firestore (30+ collections)              │    │
│  ├─────────────────────────────────────────────────┤    │
│  │  Firebase Auth (Phone OTP + Email + Claims)     │    │
│  ├─────────────────────────────────────────────────┤    │
│  │  Firebase Storage (Documents, Avatars, Images)  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  EXTERNAL SERVICES                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ ┌────────┐  │
│  │  Stripe  │  │ PayHere  │  │ Expo Push │ │SMS GW  │  │
│  │(Payments)│  │(LK Wallets│  │(Notifs)   │ │(OTP)   │  │
│  └──────────┘  └──────────┘  └───────────┘ └────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Package Dependency Graph

```
@furr/core       → (standalone, zero deps)
@furr/firebase   → @furr/core
@furr/functions  → @furr/core
@furr/ui         → (standalone, peer deps only)

All apps → @furr/core + @furr/firebase
Mobile apps → + @furr/ui
```

### Port Assignments

| App | Port |
|-----|------|
| furr-admin | 3000 |
| furr-vet | 3000 |
| furr-clinic | 3000 |
| furr-marketplace | 3002 |
| Emulator UI | 4000 |
| Functions Emulator | 5001 |
| Firestore Emulator | 8080 |
| Auth Emulator | 9099 |
| Storage Emulator | 9199 |

### Key Commands Cheatsheet

```bash
# Development
pnpm install                  # Install all deps
pnpm owner                    # Run owner mobile app
pnpm admin:dev                # Run admin portal
pnpm vet:dev                  # Run vet portal
firebase emulators:start      # Start local backend

# Quality
pnpm test                     # Run unit tests
pnpm typecheck                # TypeScript check
pnpm lint                     # Lint all packages

# Deployment
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase use staging          # Switch to staging
firebase use default          # Switch to production
```

---

*Last updated: August 2026*
