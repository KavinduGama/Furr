# Furr Full Platform — Accelerated Build Plan

**Document type:** Accelerated full-platform implementation plan  
**Date:** 16 August 2026  
**Goal:** Ship a complete pet lifestyle platform (not just medical records) as fast as possible  
**Revenue model:** Multi-stream — subscriptions, marketplace commission, service booking fees, premium features  
**Current state:** Medical core ~60% built (auth, pets, vaccinations, medications, health timeline, documents, sharing, reminders)

---

## Strategy

Medical records alone won't generate revenue fast enough. Furr becomes a **full pet lifestyle super-app**: health records are the trust anchor, but revenue comes from marketplace, services, subscriptions, and community. Every pet owner interaction — feeding, grooming, walking, buying, socialising — flows through Furr.

---

## Revenue Streams

| Stream | Model | Priority |
|--------|-------|----------|
| **Furr Premium** (subscription) | Monthly/annual — unlimited pets/exports, family sharing, priority vet access, no ads | P0 |
| **Marketplace** | Commission on pet food, medicine, accessories, toys sold through in-app shop | P0 |
| **Service bookings** | Booking fee/commission on grooming, boarding, sitting, training, transport | P0 |
| **Vet consultations** | Platform fee on video/chat consultations | P1 |
| **Promoted listings** | Service providers pay for visibility | P1 |
| **Insurance referrals** | Referral commission from pet insurance partners | P2 |
| **Advertising** | Targeted pet-relevant ads (non-medical screens only) | P3 |

---

## Architecture Changes Required

### Current Stack (Keep)
- Monorepo: pnpm workspaces
- Owner app: Expo/React Native
- Vet/Admin portals: Next.js
- Shared packages: @furr/core, @furr/ui, @furr/firebase

### New Infrastructure Needed (Zero-Budget Optimized)
- **Payment gateway** — Stripe (No monthly fee, takes % of transaction only)
- **Real-time messaging** — Firebase Realtime DB (Generous free tier, 100 simultaneous connections)
- **Video calling** — Skipped for Day 1. (Too expensive/risky for free tier. Text-only consults instead).
- **Search/discovery** — Client-side Firestore queries with composite indexes (Free, no Algolia needed)
- **Maps & location** — Expo Location API + basic distance math (Free, avoids Google Maps API billing risk)
- **Push notifications** — Expo Notifications + Firebase Cloud Messaging (100% Free)
- **Cloud Functions** — Firebase Blaze Plan with strict $10 budget cap (Required for Stripe, but effectively free at low scale)
- **Storage/Images** — Firebase Storage with aggressive client-side compression via `expo-image-manipulator` to stay under 5GB free limit.
- **Admin dashboard** — Full admin for managing providers, orders, disputes

### New Packages to Create
```
packages/
  payments/        # Payment gateway abstraction
  chat/            # Real-time DB messaging wrapper
  search/          # Firestore query builders
  location/        # Expo location wrappers
  notifications/   # Push notification service (extract from reminders)
```

### New Firebase Collections
```
firestore/
  marketplace/
    products/
    categories/
    orders/
    reviews/
    sellers/
  services/
    providers/
    bookings/
    service-types/
    availability/
    reviews/
  social/
    posts/
    comments/
    likes/
    follows/
  chat/
    conversations/
    messages/
  subscriptions/
    plans/
    user-subscriptions/
  lost-found/
    reports/
  adoption/
    listings/
    applications/
  insurance/
    quotes/
    policies/
```

---

## Phase 0: Foundation & Payment Infrastructure
**Duration:** 1 week  
**Goal:** Payment system, subscription engine, and app architecture ready for all phases

### Task 0.1: Payment Gateway Integration
- [ ] Integrate Stripe (international) + PayHere (local Sri Lanka)
- [ ] Create `@furr/payments` package with unified payment abstraction
- [ ] Implement payment method management (cards, bank, mobile wallets)
- [ ] Build payment confirmation/receipt screens
- [ ] Webhook handlers for payment status updates
- [ ] Refund flow infrastructure

### Task 0.2: Subscription Engine
- [ ] Define subscription tiers:
  - **Free** — 1 pet, basic records, limited reminders, ads
  - **Furr+** (LKR 499/mo) — Unlimited pets, PDF exports, advanced analytics, priority support, no ads
  - **Furr Family** (LKR 799/mo) — Everything in Plus + family sharing (up to 5 members), vet video calls (2/mo), insurance discounts
- [ ] Firestore subscription model (plans, user_subscriptions, billing_history)
- [ ] Paywall screens with feature comparison
- [ ] Trial period logic (7-day free trial for Plus)
- [ ] Upgrade/downgrade/cancel flows
- [ ] Receipt and invoice generation
- [ ] Subscription status middleware (gate premium features)

### Task 0.3: App Navigation Restructure
- [ ] Redesign tab bar for full platform:
  - **Home** (dashboard + feed)
  - **Shop** (marketplace)
  - **Services** (grooming, boarding, etc.)
  - **Health** (existing medical records)
  - **Profile** (settings, subscription, pets)
- [ ] Deep linking for all new sections
- [ ] Feature flags for gradual rollout
- [ ] Update onboarding flow to showcase full platform

### Task 0.4: Notification Infrastructure
- [ ] Complete push notification system (FCM + Expo)
- [ ] Notification categories: health, orders, bookings, social, promotions
- [ ] In-app notification center with filters
- [ ] Notification preferences per category
- [ ] Rich notifications with images and actions

### Task 0.5: Location Services (Zero-Cost Approach)
- [ ] Integrate Expo Location API (Device GPS only, no paid map tiles)
- [ ] User location permission flow
- [ ] Saved addresses (home, work, custom) stored as lat/long in Firestore
- [ ] Basic Haversine distance calculation to sort nearby services
- [ ] Simple list view of services sorted by distance (avoids Google Maps API billing)

---

## Phase 1: Marketplace (E-Commerce)
**Duration:** 2 weeks  
**Goal:** Pet owners can browse and buy pet products in-app

### Task 1.1: Seller/Vendor Backend
- [ ] Seller registration and verification flow
- [ ] Seller dashboard (web portal — extend furr-admin or new app)
- [ ] Product CRUD for sellers (name, description, images, price, stock, variants)
- [ ] Category management (food, medicine, accessories, toys, hygiene, beds, clothing)
- [ ] Inventory tracking
- [ ] Seller payout/settlement system

### Task 1.2: Product Catalog & Discovery
- [ ] Product listing with images, ratings, price
- [ ] Category browsing with basic Firestore filters
- [ ] Text search using simple string matching or client-side filtering (no Algolia)
- [ ] Product detail screen (gallery, description, reviews, seller info)
- [ ] "Recommended for your pet" based on species/breed/age
- [ ] Recently viewed / wishlist
- [ ] Flash deals / promotions section
- [ ] Sort: price, popularity, rating, newest

### Task 1.3: Shopping Cart & Checkout
- [ ] Add to cart with quantity and variant selection
- [ ] Cart screen with edit/remove
- [ ] Address selection (saved addresses)
- [ ] Delivery method selection
- [ ] Coupon/promo code application
- [ ] Order summary and payment
- [ ] Order confirmation with tracking info

### Task 1.4: Order Management
- [ ] Order status tracking (placed → confirmed → shipped → delivered)
- [ ] Order history with reorder option
- [ ] Real-time delivery tracking (if delivery partner supports)
- [ ] Delivery notifications at each stage
- [ ] Return/refund request flow
- [ ] Order dispute resolution

### Task 1.5: Reviews & Ratings
- [ ] Product review with star rating + text + photos
- [ ] Review moderation (admin)
- [ ] Helpful/unhelpful votes
- [ ] Seller rating aggregation
- [ ] Review prompts after delivery

### Task 1.6: Marketplace Admin
- [ ] Product approval queue
- [ ] Seller verification and management
- [ ] Category/brand management
- [ ] Promotion/deal configuration
- [ ] Commission and payout reporting
- [ ] Flagged content and dispute resolution

---

## Phase 2: Service Bookings
**Duration:** 2 weeks  
**Goal:** Pet owners can discover and book grooming, boarding, sitting, training, transport

### Task 2.1: Service Provider Onboarding
- [ ] Provider registration (business or individual)
- [ ] Provider profile: name, photos, bio, certifications, services offered
- [ ] Service area definition (location radius)
- [ ] Operating hours and availability calendar
- [ ] Pricing: fixed, hourly, per-session, package deals
- [ ] Portfolio/gallery of past work
- [ ] Provider verification (identity, certifications, background)

### Task 2.2: Service Types & Catalog
- [ ] **Grooming** — Bath, haircut, nail trim, full groom, breed-specific styling
- [ ] **Boarding/Daycare** — Overnight stay, day boarding, home boarding
- [ ] **Pet Sitting** — In-home visits, overnight sitting
- [ ] **Dog Walking** — Single walk, daily pack, group walks
- [ ] **Training** — Obedience, behaviour, puppy, agility
- [ ] **Pet Transport** — Airport, vet visits, general transport
- [ ] **Pet Ambulance** — Emergency transport to nearest vet
- [ ] Service packages and bundles
- [ ] Species/breed-specific service variants

### Task 2.3: Discovery & Search (Zero-Cost)
- [ ] List view sorted by distance (calculated locally), price, rating
- [ ] Filter: service type, price range, rating
- [ ] Provider profile with reviews, portfolio, availability
- [ ] "Top rated" and "Near you" sections
- [ ] Featured/promoted providers

### Task 2.4: Booking Flow
- [ ] Select service type and options
- [ ] Select pet (pre-fill species/breed/weight for pricing)
- [ ] Date/time picker (show provider availability)
- [ ] Add special instructions/notes
- [ ] Price breakdown (service + add-ons + platform fee)
- [ ] Payment and booking confirmation
- [ ] Booking reference and calendar integration
- [ ] Rebooking from past bookings

### Task 2.5: Booking Management
- [ ] Upcoming bookings list with countdown
- [ ] Booking status: pending → confirmed → in-progress → completed
- [ ] Reschedule/cancel with cancellation policy
- [ ] Provider chat (pre-booking questions + day-of communication)
- [ ] Live tracking for walks/transport (GPS)
- [ ] Post-service report (groomer notes, walk stats, photos)
- [ ] Tip option after completion

### Task 2.6: Provider Dashboard (Web)
- [ ] Calendar with all bookings
- [ ] Accept/decline incoming requests
- [ ] Manage availability and blocked dates
- [ ] Client pet profiles (allergies, notes from owner)
- [ ] Service completion reports
- [ ] Earnings and payout history
- [ ] Respond to reviews

### Task 2.7: Reviews & Trust
- [ ] Post-service rating prompt (1-5 stars + text + photos)
- [ ] Provider response to reviews
- [ ] Trust badges: verified, top-rated, certified
- [ ] Background check integration (future)
- [ ] Complaint and dispute flow

---

## Phase 3: Vet Consultations (Telemedicine)
**Duration:** 1.5 weeks  
**Goal:** Pet owners can consult with vets on-demand (prioritizing low-cost chat, with video as a premium option).

### Task 3.1: Telemedicine Infrastructure (Budget-Conscious)
- [ ] Integrate Firebase Realtime DB for async text/photo chat (Free Tier)
- [ ] Integrate video SDK (Agora/Daily.co) *only* for paid premium consults (Warning: these charge per minute)
- [ ] Call timer and strict billing integration (must charge user before video starts)
- [ ] Fallback to audio/text if connection is poor or user has low balance

### Task 3.2: Consultation Types
- [ ] **Chat-only (Primary)** — Async text consultation (Zero infrastructure cost, highly scalable)
- [ ] **Instant Video (Premium)** — Connect to next available vet (High margin required to cover SDK costs)
- [ ] **Scheduled** — Book a specific vet at a specific time
- [ ] **Follow-up** — Free/discounted text follow-up within 48hrs
- [ ] **Emergency triage** — Quick text assessment with escalation to physical vet

### Task 3.3: Vet Availability & Matching
- [ ] Vet availability calendar and status (online/offline/busy)
- [ ] Specialisation tags (dermatology, ortho, dental, internal medicine)
- [ ] Auto-match based on pet species + concern category
- [ ] Queue system for instant consultations
- [ ] Vet profile with credentials, experience, languages, ratings

### Task 3.4: Consultation Flow
- [ ] Pre-consultation form (pet, symptoms, duration, severity, photos)
- [ ] Waiting room with estimated wait time
- [ ] Video call screen (pet camera view, vet view, chat panel)
- [ ] During-call: vet can add notes, prescriptions, recommendations
- [ ] Post-call: summary, prescription PDF, follow-up scheduling
- [ ] Auto-link consultation record to pet health timeline
- [ ] Payment charge after completion

### Task 3.5: Prescription & Recommendations
- [ ] Digital prescription generation (vet-authored)
- [ ] Link to marketplace: "Buy prescribed medication"
- [ ] Dosage reminders auto-created from prescription
- [ ] Referral to physical clinic if needed
- [ ] Consultation history and vet notes in health timeline

---

## Phase 4: Utility Social & Community (Budget-Conscious)
**Duration:** 1 week  
**Goal:** Drive daily app opens and retention through high-value, low-database-cost community features (avoiding infinite-scroll photo feeds).

### Task 4.1: Local Meetups & Events
- [ ] Create/join local pet events (e.g. "Saturday Corgi Walk")
- [ ] RSVP system ("I'm going")
- [ ] Integration with Marketplace for sponsored events (e.g. Pet Cafe meetups)
- [ ] Event chat room (temporary Realtime DB channel)

### Task 4.2: Community Q&A & Forums
- [ ] Text-based local forums (e.g. "Best vet for anxious cats in downtown?")
- [ ] Upvote/downvote answers
- [ ] Expert AMAs (vets, trainers answer questions)
- [ ] Categorized discussion boards (Health, Training, Diet)

### Task 4.3: Playdate / Pet Matching
- [ ] "Find playmates nearby" with species/breed/size filters
- [ ] Playdate request and basic chat
- [ ] Playdate scheduling with location suggestion
- [ ] Compatibility suggestions based on pet personality

### Task 4.4: Local Pet Alerts (Lost & Found)
- [ ] Broadcast a "Lost Pet" alert to all users within a 5-mile radius
- [ ] Found pet reporting system
- [ ] Generates immense community goodwill and retention

### Task 4.5: Direct Messaging (Lean)
- [ ] 1-on-1 text chat between pet owners (Firebase Realtime DB for zero cost)
- [ ] Message requests (non-followers)
- [ ] Block/report functionality
---

## Phase 5: Pet Care Scheduling & Tracking
**Duration:** 1 week  
**Goal:** Complete daily pet care management — the "home screen" of pet ownership

### Task 5.1: Feeding Management
- [ ] Create feeding schedule (breakfast/lunch/dinner + snacks)
- [ ] Food type/brand tracking per meal
- [ ] Portion size tracking (cups, grams, cans)
- [ ] Feeding log with who fed and when
- [ ] Low food inventory alerts
- [ ] "Reorder food" link to marketplace
- [ ] Calorie/nutrition tracking (optional, per food brand data)

### Task 5.2: Exercise & Activity Tracking
- [ ] Walk logging: duration, distance, route (GPS track)
- [ ] Activity goals (daily steps/distance/active minutes)
- [ ] Play session logging
- [ ] Weekly/monthly activity reports
- [ ] Walk history with maps
- [ ] Walk reminders per pet
- [ ] Integration-ready for future wearables

### Task 5.3: Grooming Schedule
- [ ] Grooming task templates (bath, brush, nail, ear, dental)
- [ ] Custom frequency per task per pet
- [ ] Grooming history log
- [ ] "Book a groomer" link when task is due
- [ ] Photo before/after (optional)

### Task 5.4: Training & Behaviour Log
- [ ] Training session logging (command, duration, success rate)
- [ ] Command library with progress tracking
- [ ] Behaviour notes (good days, incidents, triggers)
- [ ] Training milestones and achievements
- [ ] Link to professional training booking

### Task 5.5: Smart Reminders & Daily Summary
- [ ] Unified daily care card: feeding + meds + walks + grooming
- [ ] Smart reminders based on all schedules (not just medical)
- [ ] Morning briefing notification: "Today's care tasks for Max"
- [ ] End-of-day summary: what got done, what was missed
- [ ] Streak tracking (consecutive days of complete care)
- [ ] Gamification: badges and milestones

---

## Phase 6: Lost & Found + Adoption
**Duration:** 1 week  
**Goal:** Community-powered pet safety net and adoption platform

### Task 6.1: Lost Pet Alert
- [ ] Report lost pet: photo, last seen location, time, description
- [ ] Broadcast alert to nearby Furr users (push + in-app)
- [ ] Lost pet map with sighting pins
- [ ] "I spotted this pet" report with photo + location
- [ ] Direct chat with pet owner
- [ ] Share to social media (WhatsApp, Facebook)
- [ ] Mark as found / resolve
- [ ] QR pet ID tag integration (scan tag → owner contact)

### Task 6.2: Found Pet Reports
- [ ] Report found pet: photo, location, description, current care status
- [ ] Match against lost pet database (basic matching by area + species + colour)
- [ ] Temporary foster coordination
- [ ] Handover coordination chat

### Task 6.3: Adoption Platform
- [ ] Adoption listings: shelters, rescues, owner-rehoming
- [ ] Pet profile with history, temperament, health status, special needs
- [ ] Adoption application form
- [ ] Shelter/rescue profiles and verification
- [ ] Adoption fees and donation collection
- [ ] Post-adoption check-in reminders
- [ ] Success stories feed
- [ ] Foster-to-adopt flow

### Task 6.4: Pet ID System
- [ ] Digital pet ID card (shareable link/QR)
- [ ] Emergency contact info on ID
- [ ] Link to microchip number
- [ ] NFC/QR tag ordering through marketplace
- [ ] Scan anyone's Furr tag → see public pet info + owner contact

---

## Phase 7: Insurance & Financial
**Duration:** 1 week  
**Goal:** Pet insurance comparison, application, and expense management

### Task 7.1: Insurance Marketplace
- [ ] Partner insurance providers (start with 2-3)
- [ ] Get quote flow: pet details → coverage options → price comparison
- [ ] Apply directly through app
- [ ] Policy management: view coverage, renewal dates, claim status
- [ ] Claims submission with document upload
- [ ] Link health records to claims (with owner consent)
- [ ] Referral commission tracking (our revenue)

### Task 7.2: Expense Tracking (Enhance Existing)
- [ ] Expand existing expense feature with categories:
  - Food & nutrition
  - Medical & vet visits
  - Grooming
  - Accessories & toys
  - Insurance premiums
  - Training
  - Boarding/sitting
  - Other
- [ ] Monthly/yearly expense reports with charts
- [ ] Budget setting and alerts
- [ ] Receipt photo storage
- [ ] Cost-per-pet breakdown (multi-pet households)
- [ ] Lifetime cost of ownership projection
- [ ] Tax-relevant expense export (where applicable)

---

## Phase 8: Family & Multi-User
**Duration:** 1 week  
**Goal:** Households share pet care responsibilities

### Task 8.1: Family/Household Accounts
- [ ] Invite family members (phone/email)
- [ ] Roles: owner (full control), caregiver (can log/view, no delete), viewer (read-only)
- [ ] Per-pet permission (some pets shared, some private)
- [ ] Activity feed per household: "Mom fed Max at 8am"
- [ ] Shared care calendar

### Task 8.2: Caregiver Features
- [ ] Pet sitter mode: temporary access with expiry
- [ ] Care instructions from owner (feeding rules, medication, emergency contacts)
- [ ] Sitter daily report: photos + activity log
- [ ] Owner can monitor remotely

### Task 8.3: Pet Transfer
- [ ] Transfer pet ownership (adoption/rehoming)
- [ ] Both parties confirm
- [ ] Health records transfer with pet
- [ ] Previous owner can retain read-only history (configurable)

---

## Phase 9: Provider & Admin Ecosystem
**Duration:** 1.5 weeks  
**Goal:** Complete admin tools and provider self-service portals

### Task 9.1: Admin Dashboard (Complete)
- [ ] User management (owners, vets, providers, admins)
- [ ] Content moderation queue (posts, reviews, listings)
- [ ] Marketplace management (products, sellers, orders, disputes)
- [ ] Service provider management (verification, complaints)
- [ ] Financial reporting (revenue, payouts, commissions)
- [ ] Analytics dashboard (DAU, MAU, GMV, bookings, subscriptions)
- [ ] Promotional campaigns management
- [ ] System health and monitoring
- [ ] Support ticket system

### Task 9.2: Provider Web Portal
- [ ] Self-service portal for service providers
- [ ] Booking management
- [ ] Availability and pricing management
- [ ] Client communication
- [ ] Earnings and payouts
- [ ] Reviews and reputation management
- [ ] Business analytics

### Task 9.3: Seller Web Portal
- [ ] Product listing management
- [ ] Order fulfillment workflow
- [ ] Inventory management
- [ ] Promotion/discount creation
- [ ] Sales analytics
- [ ] Settlement and invoice history
- [ ] Customer support tools

### Task 9.4: Vet Portal (Complete)
- [ ] Complete existing vet portal with:
  - Professional verification flow
  - Access grant redemption
  - Pet health record viewing
  - Professional record authoring (vaccinations, visits)
  - Consultation history
  - Availability management for telemedicine
  - Earnings from consultations

---

## Phase 10: Polish, Performance & Launch Prep
**Duration:** 1 week  
**Goal:** Production-ready quality across all features

### Task 10.1: UI/UX Polish
- [ ] Consistent design system across all screens
- [ ] Dark mode support
- [ ] Animations and micro-interactions (Reanimated)
- [ ] Empty states for every screen
- [ ] Error states with retry
- [ ] Skeleton loaders
- [ ] Haptic feedback on key actions
- [ ] Accessibility audit (screen reader, contrast, touch targets)

### Task 10.2: Performance
- [ ] Image optimization and lazy loading
- [ ] List virtualization for feeds/catalogs
- [ ] Offline support for core features (cached pet profiles, care tasks)
- [ ] App size optimization
- [ ] Startup time < 2 seconds
- [ ] Firebase query optimization and indexing
- [ ] Pagination everywhere

### Task 10.3: Security & Privacy
- [ ] Authentication hardening (rate limiting, session management)
- [ ] Role-based access control across all new features
- [ ] Payment data security (PCI compliance via Stripe)
- [ ] Content moderation for social features
- [ ] Data export (GDPR-style)
- [ ] Account deletion
- [ ] Penetration testing on critical flows

### Task 10.4: Testing
- [ ] Unit tests for business logic (payments, bookings, subscriptions)
- [ ] Integration tests for API flows
- [ ] E2E tests for critical paths:
  - Purchase flow
  - Booking flow
  - Subscription upgrade
  - Vet consultation
  - Lost pet alert
- [ ] Device testing (3+ Android, 2+ iOS)
- [ ] Payment testing (sandbox + live small transactions)

### Task 10.5: Launch Infrastructure
- [ ] App Store assets (screenshots, descriptions, keywords)
- [ ] Play Store listing
- [ ] Landing page / website
- [ ] Onboarding tutorial / walkthrough
- [ ] Demo accounts for app review
- [ ] Customer support setup (email + in-app)
- [ ] Legal: terms, privacy policy, refund policy
- [ ] Analytics and crash reporting
- [ ] Feature flags for staged rollout

---

## Execution Timeline (Aggressive)

| Week | Phase | Key Deliverable |
|------|-------|-----------------|
| 1 | Phase 0 | Payments, subscriptions, navigation restructure |
| 2-3 | Phase 1 | Marketplace live with initial sellers |
| 4-5 | Phase 2 | Service bookings (grooming, boarding, walking) |
| 6 | Phase 3 | Vet video consultations |
| 7 | Phase 4 | Social feed & community |
| 8 | Phase 5 | Full daily care management |
| 9 | Phase 6 | Lost & found + Adoption |
| 10 | Phase 7 | Insurance + enhanced expenses |
| 11 | Phase 8 + 9 | Family accounts + Admin/Provider portals |
| 12 | Phase 10 | Polish, testing, launch prep |
| **Week 13** | **LAUNCH** | **Full platform release** |

---

## Technical Priorities (Cross-Cutting)

### Database Design Principles
- Denormalize for read performance (Firestore)
- Use subcollections for owned data (user/pets/records)
- Composite indexes for filtered queries
- Security rules per collection with role checks
- Soft delete everywhere (never hard delete user data)

### Shared Component Library Expansion
```
@furr/ui additions needed:
  - ProductCard
  - ServiceCard
  - BookingCard
  - OrderStatusBadge
  - ReviewStars
  - PriceTag
  - MapView
  - ChatBubble
  - VideoCallUI
  - PaymentMethodCard
  - SubscriptionBadge
  - EmptyState (generic)
  - SkeletonLoader
  - SearchBar (with filters)
  - ImageCarousel
  - BottomSheet (actions)
  - Toast/Snackbar
  - Badge/Tag system
```

### New Expo Packages Required
```
expo-location
expo-camera (for QR scanning, pet photos)
expo-av (for video calls)
expo-maps (or react-native-maps)
expo-in-app-purchases (for iOS subscriptions)
expo-local-authentication (biometric for payments)
@stripe/stripe-react-native
react-native-gifted-chat (or custom)
```

### API Layer
- All new features use Firebase Cloud Functions for server logic
- Marketplace: functions for order processing, inventory, payouts
- Bookings: functions for scheduling, confirmation, cancellation
- Payments: functions for webhook handling, settlement
- Social: functions for feed generation, moderation
- Notifications: functions for smart delivery timing

---

## Feature Priority Matrix

### Must Have for Launch (MVP of full platform)
- [ ] Subscription with paywall (Free + Premium)
- [ ] Marketplace with 50+ products from 5+ sellers
- [ ] Grooming & boarding bookings with 10+ providers
- [ ] Basic vet chat consultation
- [ ] Feeding & exercise tracking
- [ ] Lost pet alerts
- [ ] Push notifications for all events
- [ ] Payment processing (card + local methods)

### Should Have (First month post-launch)
- [ ] Video vet consultations
- [ ] Social feed (photos + likes)
- [ ] Dog walking service
- [ ] Pet training bookings
- [ ] Family sharing
- [ ] Adoption listings

### Nice to Have (Within 3 months)
- [ ] Pet transport/ambulance
- [ ] Insurance marketplace
- [ ] Playdate matching
- [ ] Community groups
- [ ] NFC pet ID tags
- [ ] Wearable integrations
- [ ] Dark mode

### Future (Requires budget planning)
- [ ] AI symptom checker
- [ ] AI pet assistant chatbot
- [ ] Smart nutrition recommendations
- [ ] Predictive reminders (ML-based)
- [ ] AI content moderation

---

## Key Metrics to Track

| Metric | Target (Month 1) | Target (Month 3) |
|--------|-------------------|-------------------|
| Downloads | 5,000 | 25,000 |
| MAU | 2,000 | 12,000 |
| Premium subscribers | 100 | 1,000 |
| Marketplace GMV | LKR 500K | LKR 5M |
| Service bookings | 200 | 2,000 |
| Vet consultations | 50 | 500 |
| Daily active users | 800 | 5,000 |
| Retention (Day 7) | 40% | 50% |
| Retention (Day 30) | 20% | 30% |
| Revenue (monthly) | LKR 200K | LKR 2M |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| No sellers/providers at launch | Pre-sign 5 sellers + 10 providers before dev starts; seed with own inventory if needed |
| Payment gateway issues in SL | Dual integration (Stripe + PayHere); manual bank transfer as fallback |
| Quality of rushed code | Feature flags to disable broken features; core medical must stay stable |
| App review rejection | Submit early with minimal viable set; add features via OTA updates |
| Vet reluctance for telemedicine | Start with chat-only (lower barrier); add video later |
| Content moderation at scale | Keyword filters + manual review queue; strict community guidelines; report system |
| Server costs scaling | Firebase pay-as-you-go; monitor spend weekly; set budget alerts |

---

## Immediate Next Steps

1. **Today:** Finalize subscription tiers and pricing
2. **This week:** Set up Stripe/PayHere accounts, integrate payment SDK
3. **This week:** Restructure app navigation for 5-tab layout
4. **Next week:** Begin marketplace database schema and seller onboarding
5. **Parallel:** Recruit initial sellers and service providers for launch

---

## File Structure After Full Implementation

```
apps/
  furr-owner/          # Main consumer app (Expo)
    app/
      (tabs)/
        index.tsx        # Home/Today dashboard
        shop/            # Marketplace screens
        services/        # Service booking screens
        health/          # Medical records (existing)
        profile/         # Settings, subscription, pets
      auth/              # Login/register (existing)
      chat/              # Messaging screens
      social/            # Feed, posts, communities
      consultation/      # Vet video/chat
      lost-found/        # Lost & found
      adoption/          # Adoption listings
      insurance/         # Insurance marketplace
      orders/            # Order tracking
      bookings/          # Booking management
    src/
      components/        # Shared components
      context/           # State management
      hooks/             # Custom hooks
      utils/             # Helpers
      constants/         # Config

  furr-vet/            # Vet web portal (Next.js)
  furr-admin/          # Admin dashboard (Next.js)
  furr-provider/       # Service provider portal (Next.js) — NEW
  furr-seller/         # Seller dashboard (Next.js) — NEW

packages/
  core/                # Domain types and business logic
  firebase/            # Firebase services (expanded)
  ui/                  # Shared UI components
  payments/            # Payment gateway abstraction — NEW
  chat/                # Real-time messaging — NEW
  video/              # Video calling — NEW
  search/             # Search/discovery — NEW
  maps/               # Location services — NEW
  notifications/      # Push notifications — NEW
  analytics/          # Event tracking — NEW
```

---

*This plan is aggressive. Features will ship iteratively — broken into smallest shippable slices. The medical core must remain stable throughout. Revenue features (marketplace, bookings, subscriptions) get built first.*
