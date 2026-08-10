# Furr Product, Market, and Development Blueprint

**Version:** 1.0  
**Research date:** 9 August 2026  
**Target:** A credible Sri Lankan market launch before 31 December 2026  
**Primary internal source:** `C:\Users\KavinduDeshappriya\Downloads\Furr Software Requirements Specification (1).pdf`  
**Status:** Strategy and planning document. Convert the approved 2026 scope into a lean PRD and sprint backlog before coding.

> This document is intentionally direct. It separates facts, current competitor claims, recommendations, and hypotheses that still need validation. Market and legal conditions can change. The legal section is not legal advice.

---

## 1. Executive decision

### What Furr is

Furr is a multi-sided pet-care platform:

- Pet owners use a mobile app to manage multiple pets, vaccinations, medications, medical documents, reminders, weight, and daily care.
- Veterinarians and clinic staff use web tools to view consented pet records and add or verify professional information.
- Pet service providers maintain public profiles.
- Administrators verify professionals, manage users and reference data, and review audit activity.
- ResQ is a separate rescue product. It may refer users to Furr, but the two systems do not initially share accounts or rescue data.

### Honest verdict

The problem is real, but the current idea is not unique. Furr as written is a broad feature bundle in a crowded category. Sri Lanka already has products offering combinations of digital pet records, reminders, vet booking, teleconsultation, clinic management, and service marketplaces.

Furr can become a viable startup if it does three things better than alternatives:

1. Remove data-entry friction: turn an existing paper vaccination card or clinic record into a structured digital record quickly.
2. Establish trust: clearly distinguish owner-entered, document-supported, veterinarian-verified, and veterinarian-authored information.
3. Build distribution through clinics: give a clinic an immediate reason to onboard owners, such as fewer routine record requests, better vaccination recall, and repeat visits.

The product is technically feasible. Product-market fit and monetisation are not proven. The biggest risk is not software development; it is building a product people stop updating after two weeks and clinics do not change their workflow to use.

### The market decision

**Launch Sri Lanka first, starting with Colombo and nearby Western Province clinics. Build the software to be global-ready, but do not run a global go-to-market campaign first.**

Reasons:

- Veterinary trust, verification, vaccination practices, language, pricing, and distribution are local.
- A clinic-assisted launch is more credible than trying to buy global app downloads.
- Global pet-record and veterinary-engagement markets are mature and crowded.
- Furr has a potential local distribution advantage through founder relationships, clinic partnerships, and carefully separated ResQ referrals.
- Local competition means there is no first-mover advantage to protect. Execution speed, trust, and partner distribution matter more.

### The year-end decision

**A focused MVP can be launched by year-end. The whole 226-page SRS cannot be implemented to a trustworthy production standard by then unless a large experienced team is already available—and building it all would still be the wrong market experiment.**

Launch a complete narrow experience, not the complete roadmap:

> Add a pet -> digitise a vaccination/medical record -> receive a reliable reminder -> share a controlled summary -> let a registered veterinarian verify or author a record.

### The five highest-priority actions

1. Interview 25 pet owners, 10 veterinarians, and 5 clinic reception/operations staff before finalising scope.
2. Secure at least 3 clinic pilot commitments before building the professional portal beyond a prototype.
3. Replace the current SRS with a lean, internally consistent 2026 MVP PRD.
4. Prototype and test the record-entry, reminder, and sharing flow before building marketplace or daily-care features.
5. Open company app-store accounts, reserve the brand/domain, begin legal/privacy work, and recruit Android testers immediately.

---

## 2. Founder scorecard

These scores are judgement calls based on the SRS and current public market evidence.

| Area | Score | Direct assessment |
|---|---:|---|
| Problem importance | 4/5 | Lost paper records, missed preventive care, and fragmented information are credible problems. |
| Current differentiation | 1.5/5 | Records, reminders, vet access, and service directories already exist locally and globally. |
| Scoped MVP feasibility by December | 4/5 | Feasible with a small capable team and ruthless scope control. |
| Full SRS feasibility by December | 1/5 | Too many roles, portals, workflows, security rules, and records for a safe big-bang launch. |
| Distribution advantage | 2/5 today | Could become 4/5 if clinics and ResQ generate repeatable acquisition. |
| Monetisation clarity | 2/5 | Owner willingness to subscribe and clinic willingness to pay are unvalidated. |
| Defensibility | 2/5 today | Features are copyable. Trusted verified records and clinic distribution could become defensible. |
| Overall | Conditional go | Proceed with discovery and a narrow pilot. Do not fund the full roadmap yet. |

### What would make this a bad startup

- Treating the 226-page SRS as proof that the market wants the product.
- Building five user experiences before securing one reliable acquisition channel.
- Marketing “everything your pet needs” without a specific reason to switch.
- Relying on owners to manually log feeding, grooming, exercise, medication, and health forever.
- Giving AI-generated medical advice or allowing unverified records to look professional.
- Competing with full clinic-management products on feature count.

### What would make it promising

- A clinic can enrol an owner and verify a record in under two minutes.
- An owner can create a useful pet record in under three minutes.
- The app is useful even when the owner’s clinic is not a Furr customer.
- Verified records remain portable between participating clinics.
- Clinic partners see measurable vaccination recall, repeat visits, or fewer administrative calls.
- A meaningful share of acquisition comes from partners and user referrals rather than paid ads.

---

## 3. What the SRS gets right—and why it is not yet a development plan

### Strong parts

- Clear separation of Furr and ResQ.
- Owner-controlled access and explicit professional verification.
- Separation of owner observations from professional medical records.
- Sensible security, privacy, audit, backup, and access-control intent.
- Explicit exclusion of diagnosis, payments, appointment booking, commerce, social networking, and rescue operations from the initial release.
- Good recognition of multiple pets, file uploads, reminders, record history, and data export.
- Traceable requirement IDs and extensive acceptance themes.

### Critical defects to fix

1. **The functional specification is incomplete.** Section 3 fully specifies authentication, account, pet profile, and vaccination functions, but the document promises medication, medical records, feeding, grooming, exercise, growth, notifications, veterinary functions, clinic functions, service providers, and administration without equivalent functional detail.
2. **The data section is structurally corrupted.** Sections 6.6 to 6.10 repeat around pages 130-140, then the document jumps to 6.18. Detailed sections 6.11 to 6.17 are missing even though their entities appear later in the data dictionary.
3. **Only one use case is detailed.** The use-case summary lists more than 30 flows, but only registration (`UC-AUTH-001`) is written in full. The document says the others “would follow a similar pattern.” Developers should not have to invent consent, correction, medical authorship, reminder, and professional-access behaviour.
4. **References and approval are incomplete.** The references section says “unchanged,” and approval/sign-off tables are blank.
5. **Priority inflation exists.** Most items are marked High, which prevents real scope decisions.
6. **The capacity targets are premature.** Designing a clean relational model for 100,000 users and 500,000 pets is reasonable; operating for 1,000 simultaneous sessions before validating 100 active owners is not the first risk to solve.
7. **Business requirements are missing.** There is no acquisition model, pricing, onboarding ownership, support process, analytics plan, or experiment design.
8. **The record-correction workflow is not sufficiently concrete.** Professional records should be corrected through append-only revisions or explicit superseding records, not silently edited.
9. **Professional verification needs an operational policy.** The software requirements do not define who checks credentials, how often, what evidence is accepted, or what happens after suspension.
10. **“Full product” is not defined.** Initial, future, and out-of-scope lists conflict with the desire to launch everything at once.

### Required SRS repair

Create a separate `FURR_MVP_PRD_2026.md` after discovery. It should contain only approved P0 scope and include:

- Problem statement and target segment.
- Product positioning and measurable outcomes.
- Complete user journeys.
- User stories and acceptance criteria for every P0 workflow.
- Corrected domain model and record-provenance rules.
- Permission matrix.
- API and notification contracts.
- Analytics event dictionary.
- Threat model and privacy requirements.
- Test plan and release gates.
- Explicit non-goals.
- Named product, veterinary, engineering, QA, security, and release approvers.

Do not delete the SRS. Keep it as the long-term requirements catalogue and source material.

### Decisions that must be closed before PRD sign-off

- Dogs and cats only at launch, or additional species?
- Email, phone OTP, or both as the primary account identifier?
- Minimum user age and guardian process.
- How pet co-ownership, transfer, death, and disputed ownership work.
- Whether an owner can permanently delete a professional record or only remove it from ordinary views.
- Exact circumstances, if any, for emergency or support “break-glass” access.
- Which clinic roles can upload, verify, author, correct, and export each record type.
- Which professional credential evidence is required and how often it is rechecked.
- Maximum document size, allowed formats, compression, retention, and malware-scanning process.
- Reminder channels at launch and who pays for SMS/WhatsApp usage.
- Whether the launch includes iOS production, TestFlight only, or Android first.
- What data a clinic may retain after owner access is revoked.
- Which company is the controller for owner accounts and how clinic/controller responsibilities are divided.
- The single paid customer for the first business model: clinic, owner, provider, or another partner.
- The exact pilot geography and named support hours.

---

## 4. Market evidence

### 4.1 Sri Lankan demand signals

Reliable national pet-owner data is limited, so do not present a made-up TAM to investors.

- A 2022 peer-reviewed survey in Anuradhapura found dogs in 41% and cats in 17% of sampled households. Among dog-owning households, 67% reported a veterinary visit in the prior year and 90% reported rabies vaccination in the prior year. It is a rural-district study, not a national forecast. [PLOS ONE study](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0277108)
- A 2024 Scientific Reports paper states that Sri Lanka’s dog population is estimated at about 2.5 million while noting that no census has been conducted. [Scientific Reports](https://www.nature.com/articles/s41598-024-71148-1)
- Sri Lanka’s Public Health Veterinary Services cites older surveys suggesting roughly one dog per six people and about 20% ownerless dogs in surveyed areas. Treat these as context, not current market sizing. [Public Health Veterinary Services](https://www.rabies.gov.lk/english/control.php)
- The Telecommunications Regulatory Commission reported 21.93 million mobile-broadband subscriptions for 2025, supporting a mobile-first product. Subscriptions are not unique people. [TRCSL Q4 2025 report](https://www.trc.gov.lk/content/files/statistics/2026/Statistics%20Report%20Q4%202025.pdf)
- Statcounter measured Android at 79.28% of Sri Lankan mobile/tablet web usage in June 2026. This is usage-share data, not device-sales data, but it supports Android-first QA and launch priority. [Statcounter](https://gs.statcounter.com/os-market-share/mobile-tablet/sri-lanka)

### 4.2 Local competitive landscape

Public metrics and feature claims below come from product sites or app stores and are not independently audited.

| Competitor | Current public offer | Evidence of traction/position | What it means for Furr |
|---|---|---|---|
| [DrPaw](https://drpaw.life/) | Owner and vet apps, appointments, digital records, vaccines, reminders, audio/video consultation | Google Play shows 1K+ downloads and an update on 22 May 2026. Its Play disclosure says data is not encrypted; this is the developer’s store disclosure and should be rechecked. | Closest operational local competitor. Furr must be easier, more portable, and visibly trustworthy. |
| [PetDoc.lk](https://apps.apple.com/lk/app/petdoc-lk/id1590193047) | Vet channeling, teleconsultation, boarding, grooming, sitting, training, reminders, and delivery | App Store history goes back to 2021 and showed 6 ratings when researched. | Broad local marketplace/consultation competitor. Do not copy its breadth. |
| [PawZync](https://www.pawzync.com/) | Digital pet passport, owner-controlled records, vaccination/medication reminders, real-time booking, clinic tools | Website claims Sri Lankan coverage and free owner/clinic tiers; operating scale was not independently verified. | Almost the same health-record promise. “Digital passport” alone is not differentiation. |
| [PetMaster.lk](https://petmaster.lk/) | Clinic management, records, reminders, inventory, billing, telemedicine, AI tools, pet-owner app | Website lists LKR 5,000, 10,000, and 15,000 monthly clinic plans and claims 5+ clinics/2,000+ pets. Claims should be validated directly. | A full-PIMS competitor. Furr should integrate with or sit beside clinic systems, not rebuild all of them. |
| [PawLa](https://play.google.com/store/apps/details?id=lk.pawla) | Service discovery, booking, payment, lost/found, adoption, provider marketplace | Google Play showed 10+ downloads when researched. | Marketplace features are easy to announce but hard to make liquid. Defer them. |
| [Pet Buddy](https://www.pettbuddy.lk/) | Adoption, vets, grooming, records, and emergency services | Website presents a broad “unified ecosystem”; public metrics are self-reported. | Another broad ecosystem claim. Breadth is not a moat. |

### 4.3 Global competitive landscape

| Competitor | Strength | Lesson for Furr |
|---|---|---|
| [11pets](https://www.11pets.com/en/news/export-data) | Very broad consumer care records, reminders, health, weight, hygiene, and business tooling; App Store rating was 3.3/5 from 78 ratings when researched. | Feature completeness already exists. Win on simplicity and the local clinic workflow. |
| [VitusVet](https://vitusvet.com/pet-owners/) | Records, reminders, appointments, refills, weight/activity, sharing, and practice integration | Portable records become stronger when clinics automatically keep them current. |
| [PetDesk](https://petdesk.com/veterinary-client-engagement-software) | Client communication layer used by many practices; integrates with PIMS products | Selling measurable clinic outcomes can fund a free owner app. |
| [PocketPet](https://www.pocketpet.com/) | Records synced to a clinic-management platform plus booking, services, chat, and adoption | Regional expansion requires integrations and partnerships, not merely translating the app. |

### 4.4 The real market conclusion

- Demand exists, but no public evidence proves that Sri Lankan owners will maintain another manual tracker or pay a subscription.
- Local competitors demonstrate the category but do not show that it has been won.
- Visible app-store footprints are mostly modest. That can mean opportunity, low demand, weak distribution, or all three.
- The strongest opening is not “Sri Lanka’s first pet app.” That claim is no longer credible.
- The strongest opening is a low-friction, trusted, portable preventive-care record distributed by clinics.

### 4.5 Bottom-up commercial reality

Use partner capacity, not a vague national market percentage, to size the first year. Example assumptions—not forecasts:

| Stage | Simple acquisition model | Activated owners | Clinic MRR at LKR 6,000/clinic |
|---|---|---:|---:|
| Pilot | 3 clinics x 50 activated owners | 150 | LKR 0 during free pilot |
| Colombo cluster | 15 clinics x 250 invitations x 30% activation | 1,125 | LKR 90,000 if all pay |
| Broader Sri Lanka | 50 clinics x 400 invitations x 30% activation | 6,000 | LKR 300,000 if all pay |

Replace every assumption with interview and pilot data. This model reveals an important truth: a Sri Lanka-only record/reminder SaaS may become a useful, sustainable business, but it is unlikely to become a very large venture-scale company on clinic subscriptions alone. A larger outcome eventually requires regional expansion, higher-value clinic workflow, owner premium revenue, or carefully chosen transactions. Those layers should be earned after the core product works, not used to justify building everything now.

---

## 5. Sri Lanka first, global-ready

### Recommended expansion sequence

1. **Clinic cluster:** 3-5 clinics in Colombo and nearby Western Province areas.
2. **City launch:** 10-20 clinic and pet-care partners; focused owner acquisition in the Western Province.
3. **Sri Lanka launch:** add Sinhala/Tamil, broader clinic verification, and support operations.
4. **Regional test:** choose one market only after local retention and clinic economics are proven. Sri Lankan diaspora-heavy or nearby markets may be candidates, but selection requires separate research.
5. **Global expansion:** only after the product has a repeatable clinic onboarding playbook or a consumer acquisition loop that works without founder involvement.

### Global-ready from day one means

- Store UTC timestamps and display local time zones.
- Use configurable species, breeds, vaccines, units, and reminder templates.
- Separate interface copy from code for translation.
- Support metric and imperial units in the data model.
- Avoid hard-coded Sri Lankan phone/address formats.
- Make professional credentials jurisdiction-specific.
- Keep tax, payments, insurance, and clinical terminology outside the core domain until needed.
- Use region-aware privacy controls and data-retention configuration.

It does **not** mean launching paid campaigns worldwide or supporting every jurisdiction in 2026.

### Expansion gates

Do not expand outside Sri Lanka until all are true for at least two consecutive months:

- 10+ active clinic partners, with at least 70% using the product weekly.
- 5,000+ activated pet profiles or a similarly credible local cohort.
- At least 30% month-3 retention among activated owner accounts.
- At least 50% of new activated owners come through repeatable partner/referral channels.
- Reminder delivery reliability above 99%.
- At least one measurable clinic ROI signal: fewer record requests, higher recall bookings, or staff time saved.
- A paid clinic conversion rate that supports customer success and support costs.
- No unresolved high-severity security, privacy, or record-integrity issue.

---

## 6. Target segment and positioning

### Primary owner segment

Start with:

- Urban and suburban dog/cat owners.
- People who visit a vet at least yearly.
- Owners currently using paper vaccination cards, photos, calendars, or WhatsApp messages.
- Multi-pet households and owners who use boarding/grooming, where vaccine proof is regularly requested.
- Smartphone users comfortable with QR codes and notifications.

Do not start by targeting every animal owner in Sri Lanka. Rural and price-sensitive segments may have different needs and lower app-maintenance behaviour.

### Primary business segment

Start with independent clinics that:

- Manage a meaningful number of repeat vaccinations and preventive-care follow-ups.
- Still receive calls/messages asking for records or dates.
- Do not want to replace their entire clinic-management workflow.
- Have one operational champion willing to run a pilot.
- Can enrol owners at reception after a visit.

### Recommended positioning

> **Furr is the portable preventive-care record for Sri Lankan pet owners. Add a paper record once, receive trusted reminders, and share a veterinarian-verified summary with any participating clinic.**

### The first landing-page message

**Headline:** Your pet’s records, ready when care cannot wait.  
**Subheading:** Keep vaccinations, medications, documents, and due dates in one private record. Share only what you choose with a verified veterinarian.  
**Owner CTA:** Join the Colombo pilot.  
**Clinic CTA:** Reduce routine record work and improve follow-up care.

Avoid claims such as “world’s first,” “tamper-proof,” “AI diagnosis,” or “complete medical record” unless they are legally and technically supportable.

### The differentiation stack

1. **Fast capture:** photo plus minimal structured fields; assisted extraction later.
2. **Provenance:** every field shows who entered it and whether a document or verified professional supports it.
3. **Professional verification:** veterinarians checked against the [Veterinary Council of Sri Lanka register](https://www.slvetcouncil.org/members); clinics checked against applicable [DAPH registration](https://daph.gov.lk/services/Veterinary_Clinic_Registration).
4. **Portable sharing:** time-limited, revocable access code or link and a concise PDF summary.
5. **Low-data Android experience:** fast on modest devices and networks.
6. **Neutrality:** Furr does not force an owner to use one clinic or replace a clinic’s PIMS.
7. **Privacy as a product feature:** visible access history, export, deletion, and no advertising based on care records.

### The potential growth loop

1. A clinic verifies a vaccine or follow-up date.
2. The owner receives a useful record and reminder.
3. The owner shares the record with a boarder, groomer, or another clinic.
4. The recipient sees the value of a verified Furr summary.
5. More providers join, increasing owner utility without exposing private medical data.

This loop must be demonstrated; it is not yet a moat.

---

## 7. 2026 launch scope

### P0: must ship for the pilot/public launch

| Epic | Minimum behaviour | Launch acceptance |
|---|---|---|
| Authentication | Email or phone OTP, secure sessions, logout, recovery, consent to terms/privacy | Owner can create and recover an account; brute-force and session controls tested. |
| Pet profiles | Create, edit, archive, restore, switch pets; dog/cat first | Owner creates the first pet in under 60 seconds. |
| Vaccination records | Vaccine name, date, next due date, provider, batch/certificate where available, attachment, source status | Owner can add a record; vet can author/verify without overwriting owner data. |
| Medication plans | Medicine, dose text, frequency, start/end, instructions, reminder schedule | Reminder is generated correctly across time zones and can be completed/skipped. |
| Health timeline | Owner observation, professional visit summary, allergy/condition flags, file attachment | Owner and professional records are visually and technically distinct. |
| Documents | Camera/gallery upload, type, date, pet link, secure viewing, deletion rules | Private object cannot be fetched without current permission; unsupported files rejected. |
| Weight | Date, value, unit, source, simple trend | Values validate and unit conversion does not corrupt originals. |
| Reminders | Vaccine, medication, follow-up, manual care reminder; push plus in-app centre | Scheduled, delivered, opened, snoozed, completed, and failed states are traceable. |
| Sharing/consent | Time-limited pet summary link/code, selected categories, revoke, access history | Revocation blocks future access; sensitive content is opt-in. |
| Export | Human-readable pet summary PDF and machine-readable account export | Owner can export without support intervention. |
| Professional portal | Vet login, credential status, code-based pet access, view allowed summary, author/verify permitted records | Unverified/suspended professional cannot access or author professional records. |
| Clinic operator role | Minimal restricted role for document upload and onboarding; no clinical authorship | Operator cannot create veterinarian-only medical records. |
| Admin console | Verify/suspend professionals and clinics, manage reference lists, view access/audit events | All high-impact actions require reason, confirmation, and audit entry. |
| Analytics | Privacy-safe funnel and reliability events | No pet-record content, diagnosis text, or document data enters analytics. |
| Operations | Backups, restore test, monitoring, incident/support channels, feature flags | Restore test passes and launch rollback is rehearsed. |

### The key product rule

**A verified record is never created by changing an owner record’s label.** A professional must create a verification attestation or an authored record linked to the source. Corrections preserve history.

### P1: first 90 days after launch

- Household/caregiver access with granular permissions.
- Sinhala and Tamil interfaces, starting with owner onboarding and reminders.
- Assisted OCR for common vaccination cards with confidence thresholds and human confirmation.
- SMS or WhatsApp reminder experiments where consent, cost, and platform rules permit.
- Better recurring medication administration and refill tracking.
- Clinic recall list and outcome report.
- Read-only verified service directory.
- Import templates for clinics using spreadsheets or another system.
- Optional appointment request—not real-time scheduling—only if pilot clinics demand it.

### P2: after product-market evidence

- Full appointment booking and calendar synchronisation.
- Payments.
- Provider marketplace and lead fees.
- Teleconsultation and chat.
- Inventory, billing, pharmacy, or complete PIMS functions.
- Lost-pet reporting, adoption, transport, ambulance, insurance, and commerce.
- Wearables and smart devices.
- ResQ account/data integration.
- AI summaries or health pattern assistance with veterinary, safety, and regulatory review.

### Explicit 2026 non-goals

- Automated diagnosis or treatment advice.
- AI chatbot presented as a veterinarian.
- Full feeding, grooming, exercise, and behaviour tracking suite.
- Social feed.
- Reviews/ratings marketplace.
- Rescue case management.
- Insurance claims.
- Medicine or food sales.
- Full clinic billing/inventory.
- International marketing.

---

## 8. Core user journeys

### Journey A: owner activation

1. Install/open Furr.
2. Create account and accept privacy/terms.
3. Add one pet.
4. Photograph the vaccination card or choose “add without document.”
5. Enter vaccine, administration date, and next due date.
6. Confirm reminder.
7. See an immediate useful dashboard: next due item, record status, and share action.

**Activation definition:** an owner creates a pet and adds at least one record or reminder within 24 hours.

### Journey B: clinic-assisted verification

1. Clinic invites owner by QR/link or owner presents a Furr access code.
2. Owner approves categories and expiry.
3. Verified veterinarian or restricted operator locates the pet.
4. Veterinarian authors or verifies the vaccination/follow-up record.
5. Owner receives a notification and sees source/provenance.
6. Clinic can see the due recall only while permission and purpose allow.

### Journey C: portable record sharing

1. Owner selects a purpose: vet visit, boarding/grooming, caregiver, or emergency summary.
2. Owner selects record categories and expiry.
3. Furr creates a revocable link/code.
4. Recipient views a read-only, mobile-friendly summary.
5. Access is logged and visible to the owner.
6. Expiry or revocation ends access.

### Journey D: record correction

1. Owner or professional reports an error.
2. The original record remains immutable where professional authorship/audit requires it.
3. An authorised person creates a correction/superseding record with reason.
4. Current views display the corrected value and retain history for authorised audit.

---

## 9. Domain and data model

### Core entities

- `User`
- `Role`, `Permission`, `UserRole`
- `OwnerProfile`
- `ProfessionalProfile`, `ProfessionalCredential`
- `Clinic`, `ClinicMembership`
- `Pet`, `PetOwnership`
- `AccessGrant`, `ShareLink`, `AccessEvent`
- `VaccinationRecord`, `VaccinationVerification`
- `MedicationPlan`, `MedicationAdministration`
- `HealthObservation`, `ProfessionalMedicalRecord`, `RecordRevision`
- `Allergy`, `HealthCondition`
- `WeightRecord`
- `Document`, `DocumentLink`
- `Reminder`, `Notification`, `DeliveryAttempt`
- `ReferenceData`
- `AuditEvent`

### Required provenance states

- `OWNER_ENTERED`
- `OWNER_ENTERED_WITH_DOCUMENT`
- `CLINIC_UPLOADED`
- `VET_VERIFIED`
- `VET_AUTHORED`
- `SUPERSEDED`
- `DISPUTED`

Store source, author, verifier, clinic, creation time, effective time, document linkage, and revision history separately. Do not represent trust with one editable Boolean.

### Access rules

- An owner/guardian controls sharing of owner-held pet records.
- Professionals receive explicit category, purpose, and expiry-limited access unless a separately reviewed legal basis applies.
- Service providers never receive private medical records through their provider profile.
- Clinic operators cannot author veterinarian-only records.
- Admins do not browse private pet records by default; audited break-glass access requires a documented support/security purpose.
- Signed document URLs expire quickly and are checked against current authorisation.
- Deactivated access must not leave cached professional views available.

### Data-quality rules

- Preserve original measurement value and unit.
- Prevent future administration dates unless explicitly supported as planned care.
- A next-due date must be after the administration date.
- Medical corrections require reason and author.
- Batch/certificate numbers are optional unless the relevant workflow requires them.
- Duplicate detection should warn, not silently merge.
- Reminder generation must be idempotent.
- All destructive actions must have defined archival/deletion semantics.

---

## 10. Recommended technical approach

This is a speed-focused reference architecture, not a final decision. Confirm it against the team’s strongest skills.

### Suggested stack for a small TypeScript team

- **Mobile:** Expo/React Native for Android and iOS.
- **Web:** Next.js for professional and admin portals.
- **Backend:** TypeScript API/service layer; start with managed Postgres/Auth/Storage such as Supabase, with Row Level Security and server-side policy tests.
- **Database:** PostgreSQL.
- **File storage:** private object storage with signed URLs, content-type validation, size limits, and malware scanning.
- **Notifications:** FCM/APNs through an abstraction that records every delivery attempt.
- **Jobs:** durable queue/cron worker for reminders, exports, and cleanup.
- **Observability:** structured logs, error tracking, uptime checks, product analytics with record contents excluded.
- **Repository:** TypeScript monorepo with shared schema/types, API client, validation, and design tokens.
- **Delivery:** separate development, staging, and production environments; automated migrations and rollback steps.

### When to choose Flutter instead

Choose Flutter if the team already ships Flutter faster than React Native. Team capability is more important than theoretical framework advantages. Do not run two mobile stacks.

### Architecture boundaries

- Keep ResQ in a separate application, database, auth boundary, deployment, and analytics property for the initial release.
- Use a referral URL with campaign attribution only; do not transfer rescue records.
- Keep professional record services separate from general daily-care functions.
- Hide P1/P2 work behind feature flags.
- Version public APIs and exports from the beginning.

### Security baseline

- TLS in transit and managed encryption at rest.
- Strong password/OTP controls and session revocation.
- MFA for administrators and professional users where practical.
- Least-privilege roles and database policies tested in CI.
- Append-only audit events with restricted access.
- Secret management; no secrets in mobile binaries or source control.
- Private storage buckets; short-lived signed links.
- Dependency and container scanning.
- Daily automated backup plus a documented restore test before launch.
- Incident response owner, severity model, contact channel, and notification template.
- Independent security review before broad public launch if professional records are enabled.

### Realistic MVP non-functional targets

- Crash-free sessions: at least 99.5% during beta and improving.
- p95 API reads/writes: under 1 second under expected pilot load, excluding large uploads/exports.
- Reminder job success: at least 99%; failed jobs retry safely and alert operations.
- Restore point objective: 24 hours for pilot, tightened as usage grows.
- Restore time objective: 8 hours for pilot, tightened before paid scale.
- Accessibility: keyboard-usable web portal, labelled controls, contrast checks, scalable text.
- Mobile: test common low/mid-range Android devices, intermittent networks, and background-notification behaviour.

Do not claim “99.9% availability,” “enterprise grade,” or “tamper-proof” until measurement and controls support the claim.

---

## 11. Privacy, veterinary trust, and legal work

### Professional verification

Only practitioners registered with the Veterinary Council of Sri Lanka are legally authorised to practise veterinary medicine in Sri Lanka. The Council provides a searchable public register. [Council overview](https://www.slvetcouncil.org/the-council) and [member register](https://www.slvetcouncil.org/members).

Operational workflow:

1. Collect name, registration number, clinic, district, and contact details.
2. Match against the Council register.
3. Perform a secondary contact or document check before enabling professional authorship.
4. Record verifier, evidence, date, and decision.
5. Recheck periodically and provide suspension/revocation workflow.
6. Verify private clinic registration/renewal where applicable through DAPH documentation or direct confirmation.

Do not display a government or Council logo or imply endorsement without written permission.

### Sri Lankan data protection

Sri Lanka’s Personal Data Protection Act timetable has changed more than once. The March 2025 commencement was repealed, the Act was amended in October 2025, and July 2026 reporting on Gazette Extraordinary 2498/16 says selected core controller/processor provisions are due to operate from 1 January 2027 while other provisions remain staggered. The DPA website contains some older timing text. Obtain Sri Lankan counsel’s written interpretation before launch and monitor official gazettes.

Primary/background sources:

- [Personal Data Protection (Amendment) Act No. 22 of 2025](https://documents.gov.lk/view/act/2025/10/22-2025_E.pdf)
- [Gazette repealing the original March 2025 commencement](https://www.dpa.gov.lk/Gazet/2025-03-14/G%2043988%20%28E%29.pdf)
- [Data Protection Authority](https://www.dpa.gov.lk/)
- [July 2026 report on the new staggered date](https://www.dailymirror.lk/business-news/Legal-experts-flag-unique-compliance-landscape-in-staggered-PDPA-rollout/273-346685)

Build as if core privacy obligations apply:

- Publish clear privacy notice and terms.
- Record purpose and lawful basis for each data category.
- Collect the minimum owner/professional data needed.
- Provide access, correction, export, deletion/anonymisation, and consent withdrawal workflows.
- Sign processor/data-processing agreements with cloud, messaging, analytics, and support vendors.
- Maintain retention periods and automated deletion jobs.
- Perform a privacy impact assessment for professional records and sharing.
- Do not send pet/owner record contents into advertising or general analytics platforms.
- Do not use production records to train AI without a separately reviewed legal and consent framework.

### Medical-safety boundary

- Furr organises information; it does not diagnose or replace a veterinarian.
- Show “owner-entered” prominently where applicable.
- A shareable summary is not an official travel certificate unless an authorised process makes it one.
- No medication dose recommendation engine in the MVP.
- Emergency screens direct users to a qualified local professional; do not promise emergency response.
- Vet-facing templates require a veterinary advisor’s review.

---

## 12. Delivery plan: 10 August to 31 December 2026

Assumption: two product engineers, one design/product lead, part-time QA, DevOps/security support, and an actively involved veterinary advisor. With one developer, reduce scope to owner records/reminders plus a minimal verification web screen.

| Dates | Phase | Required output | Exit gate |
|---|---|---|---|
| 10-23 Aug | Discovery and partner sales | 25 owner interviews, 10 vet interviews, 5 staff interviews, competitor demos, 3 pilot letters of intent | At least 15 owners report a recent record/reminder problem; 3 clinics commit staff/time. |
| 17-30 Aug | Prototype and scope lock | Clickable owner + vet flow, lean PRD, permission matrix, data model, brand/legal check | 80% of representative testers finish record-add/share prototype without help. |
| 31 Aug-13 Sep | Foundations | Repositories, environments, auth, pet model, logging, CI/CD, design system | Threat model reviewed; staging deployment and automated tests work. |
| 14 Sep-11 Oct | Core build | Pet, vaccination, medication, timeline, documents, weight, basic dashboard | End-to-end owner activation works on real Android devices. |
| 12-25 Oct | Trust layer | Sharing, consent, provenance, professional verification, minimal admin | Permission tests pass; professional records cannot be forged through owner APIs. |
| 26 Oct-8 Nov | Reminder and operational hardening | Push/in-app reminders, retries, analytics, backup/restore, support tooling | Scheduled reminder and restore tests pass. |
| 9-22 Nov | Closed beta | 12+ required Android testers if applicable, 50-100 owners, 3 clinics | No critical defects; crash-free sessions >99.5%; permission audit clean. |
| 23 Nov-6 Dec | Pilot iteration and store submission | Fixes, privacy/terms, store assets, demo accounts, production runbook | Google/Apple submissions complete; security/privacy sign-off. |
| 7-20 Dec | Controlled public launch | Colombo/Western Province release, clinic onboarding, monitoring | Support response and rollback readiness proven. |
| 21-31 Dec | Stabilise | Bug fixes and launch review; no major new features | Publish metrics, lessons, and Q1 2027 decision. |

### Starter engineering backlog

These are epics/stories to estimate after the PRD and prototype are approved. Split any item larger than five engineering days.

| ID | Deliverable | Main dependency | Target phase |
|---|---|---|---|
| FND-001 | Create monorepo, coding standards, branch checks, and shared validation/types | Stack decision | Foundations |
| FND-002 | Create isolated development, staging, and production projects with secrets management | FND-001 | Foundations |
| FND-003 | Automated database migrations, seed data, deployment, and rollback check | FND-002 | Foundations |
| OBS-001 | Structured API/job logs, error tracking, uptime check, and alert routing | FND-002 | Foundations |
| SEC-001 | Threat model and automated role/database-policy test harness | Permission matrix | Foundations |
| AUTH-001 | Owner signup, verification, login, logout, and recovery | Privacy/age decisions | Foundations |
| AUTH-002 | Professional/admin login, MFA/session revocation, and suspended-state handling | AUTH-001 | Trust layer |
| PET-001 | Create/edit/archive/restore/switch dog or cat profiles | AUTH-001 | Core build |
| PET-002 | Pet ownership and guardian model with server-side authorisation tests | PET-001 | Core build |
| VAC-001 | Owner vaccination create/view/update with validation and source state | PET-001 | Core build |
| VAC-002 | Veterinarian-authored record and linked verification attestation | PRO-002, VAC-001 | Trust layer |
| MED-001 | Medication plan CRUD with frequency/start/end/instruction validation | PET-001 | Core build |
| MED-002 | Medication due instances and complete/skip/snooze states | MED-001, REM-001 | Reminder hardening |
| HLT-001 | Owner observation and allergy/condition flags | PET-001 | Core build |
| HLT-002 | Append-only professional visit summary and correction/superseding workflow | PRO-002, AUD-001 | Trust layer |
| DOC-001 | Private camera/gallery upload with type/size/content validation | PET-001, SEC-001 | Core build |
| DOC-002 | Signed viewing, permission recheck, deletion, and orphan cleanup | DOC-001 | Trust layer |
| WGT-001 | Weight entry, original unit preservation, and simple trend | PET-001 | Core build |
| REM-001 | Idempotent reminder generation and durable scheduled jobs | VAC-001 or MED-001 | Core build |
| NOT-001 | Push/in-app delivery, retry, failure alert, and notification centre | REM-001 | Reminder hardening |
| SHR-001 | Category- and expiry-limited access grant/link/code | PET-002, SEC-001 | Trust layer |
| SHR-002 | Recipient read-only summary, access log, expiry, and revocation | SHR-001, AUD-001 | Trust layer |
| EXP-001 | Pet summary PDF and account machine-readable export | VAC/MED/HLT/DOC | Hardening |
| PRO-001 | Professional application and credential-review queue | AUTH-002, admin policy | Trust layer |
| PRO-002 | Verified professional dashboard and code-based authorised pet lookup | PRO-001, SHR-001 | Trust layer |
| CLN-001 | Restricted clinic-operator membership and document-upload permissions | PRO-002 | Cut first if late |
| ADM-001 | Professional/clinic approval, rejection, suspension, and reasons | PRO-001 | Trust layer |
| ADM-002 | Reference-data editor with safe change controls | ADM-001 | Hardening |
| AUD-001 | Immutable security, sharing, professional, and admin audit events | FND-003 | Foundations/trust |
| PRIV-001 | Privacy notice/version consent, data export, account deletion/anonymisation | AUTH-001, data map | Hardening |
| ANA-001 | Privacy-safe activation, reminder, share, reliability, and clinic events | Event dictionary | Core/hardening |
| OPS-001 | Automated backup, restore drill, incident playbook, and support tools | FND-002 | Hardening |
| QA-001 | Device/browser matrix, E2E critical journeys, security regression suite | P0 features | Beta |
| REL-001 | Store metadata, review demo account, signed builds, phased release, rollback | QA-001 | Release |

### App-store deadlines that affect the plan

- New Google Play personal developer accounts created after 13 November 2023 must run a closed test with at least 12 opted-in testers for 14 continuous days before applying for production access. Start this early. [Google Play requirement](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- From 31 August 2026, new Android apps/updates submitted to Google Play must target Android 16/API 36, subject to stated exceptions/extensions. Set the build target correctly at project creation. [Android requirement](https://developer.android.com/google/play/requirements/target-sdk)
- Apple says 90% of submissions are reviewed in under 24 hours on average, but incomplete or problematic apps take longer. Reserve at least two weeks for rejection/fixes and provide working review credentials. [Apple App Review](https://developer.apple.com/app-store/review/)

### Scope fallback if delivery slips

Cut in this order:

1. Clinic operator role; let verified vets perform pilot actions.
2. Weight chart; retain raw weight entries.
3. Custom reminder types; retain vaccine/medication/follow-up.
4. iOS public launch; keep TestFlight while launching Android and responsive web.
5. Professional authoring; retain document-backed owner records and a limited verification attestation.

Do not cut consent, provenance, access control, backup, audit, privacy notice, or deletion/export.

---

## 13. Go-to-market plan

### Phase 0: problem discovery

Do not ask “Would you use this app?” Ask for recent behaviour:

#### Owner interview questions

1. Show me where your pet’s vaccination and medical records are now.
2. When did you last need to find or send one? What happened?
3. What care date did you last forget or nearly forget?
4. Who else helps care for the pet, and how do you coordinate?
5. What did your vet give you after the last visit?
6. Which pet apps have you tried, and why did you stop?
7. Would you photograph the card now? Watch them try the prototype.
8. Which record categories would you share with a vet, groomer, boarder, or sitter?
9. What would make you distrust this product?
10. Ask for a concrete pilot commitment, not a compliment.

#### Vet/clinic interview questions

1. How are records stored today?
2. How many calls/messages ask for records, vaccine dates, or follow-ups each week?
3. How are vaccination recalls handled now?
4. Where are duplicate pets/owners or missing records created?
5. Who is allowed to author or correct a medical record?
6. What can reception staff do without a veterinarian?
7. Would a portable owner record create risk or save time?
8. Which existing system must Furr not replace?
9. What result would justify LKR 3,000, 6,000, or 10,000 per month?
10. Will the clinic pilot for 60 days, name a champion, and enrol 30 owners?

### Phase 1: concierge pilot

Before automating OCR or imports:

- Enrol 30-50 owners manually at 3 clinics.
- Founder/team digitises the first card with the owner’s confirmation.
- Record time-to-value, field errors, incomplete cards, and support questions.
- Send reminders through the product and compare with the clinic’s prior process.
- Review every consent/access event with the clinic champion weekly.

This manual work reveals the real schema and workflow faster than speculative automation.

### Phase 2: clinic-led beta

Pilot offer:

- 60 days free.
- No replacement of current clinic system.
- Training and onboarding included.
- Clinic commits one champion, 30+ owner invitations, weekly feedback, and permission to use aggregated results.
- Conversion discussion occurs only after agreed outcomes are measured.

Clinic pitch:

> “Furr gives your clients a portable care summary and reliable follow-up reminders without replacing your clinic system. We will set up the first cohort, verify the workflow with your team, and measure record-request work and completed recalls.”

### Phase 3: public Sri Lankan launch

Priority acquisition channels:

1. Clinic reception QR and post-visit invitation.
2. Boarding/grooming partners that need vaccination proof, without exposing full medical history.
3. ResQ referral link with no account/data transfer.
4. Search content for vaccination records, deworming schedules, pet-care preparation, and “what to bring to the vet.” Content requires veterinary review.
5. Pet-owner communities and micro-creators demonstrating a real card-to-record flow.
6. Referral prompt after a successful share or verified record—not immediately after signup.

Avoid expensive broad influencer campaigns before activation and retention are known.

### Brand warning

“Furr” is short and memorable but crowded. Current web/app search finds Furra, Ffurr, Furr: Pet Diary, and other similar pet software, plus a US `FURR.` software trademark listing. This is not a legal conclusion, but it creates search, app-store, domain, and trademark risk.

Before design investment:

- Run Sri Lankan trademark clearance and app-store/domain checks.
- Check relevant international classes and planned expansion markets with counsel.
- Secure consistent `.com`/`.lk`, social handles, Android package ID, and Apple bundle ID.
- Be willing to rename before public launch.

---

## 14. Pricing and business model

### Recommended model

Use B2B2C:

- Owner core: free pet, record, reminder, sharing, export, and access controls.
- Clinic: paid recall/engagement and professional workflow after the pilot.
- Owner premium later: household sharing, additional automation, advanced exports, or unlimited assisted digitisation—only after willingness-to-pay testing.
- Provider monetisation later: verified listing or qualified lead, never pay-to-appear “medical verification.”
- No targeted ads based on health/care records.

### Price tests, not final prices

PetMaster publicly lists LKR 5,000-15,000/month for a much broader clinic tool. A lighter Furr product must prove clear ROI and should test, not assume, pricing.

Test three clinic offers during interviews:

| Hypothesis | Indicative monthly test | Purpose |
|---|---:|---|
| Solo/very small clinic | LKR 2,900-3,900 | Low-friction entry; limited active pets/users. |
| Clinic | LKR 5,900-7,900 | Multiple staff, recalls, reports, onboarding support. |
| Multi-branch | LKR 10,000+ | Only after multi-branch demand and support costs are known. |

Treat these as interview anchors, not published commitments. Charge SMS/WhatsApp pass-through separately if used.

### Unit-economics formulas

- `Clinic MRR = paid clinics x average revenue per clinic`
- `Gross profit per clinic = clinic revenue - messaging - infrastructure - support cost`
- `CAC payback months = clinic acquisition cost / monthly gross profit per clinic`
- `Clinic LTV = monthly gross profit per clinic / monthly clinic churn`

Target payback under six months for founder-led local sales before scaling a sales team. Validate actual support time; small clinics can be high-touch.

---

## 15. Metrics and decision gates

### North-star metric

**Monthly active pets with a meaningful care action:** a verified/authored record, a completed due reminder, or a controlled record share.

Do not use registrations or raw pet-profile count as the north star.

### Funnel metrics

- Landing page -> waitlist.
- Install/open -> account created.
- Account -> first pet.
- First pet -> first record/document.
- First record -> first reminder.
- First reminder -> delivered/opened/completed.
- Owner -> share created.
- Share -> recipient viewed.
- Clinic invitation -> activated owner.
- Pilot clinic -> weekly active clinic -> paid conversion.

### Reliability and trust metrics

- Crash-free sessions.
- p95 API latency.
- Reminder delivery success/failure.
- Upload failure rate.
- Access-denied test coverage.
- Incorrect professional verification incidents.
- Record correction/dispute rate.
- Support tickets per 100 activated owners.
- Backup restore success and time.

### Pilot hypotheses and go/no-go thresholds

These are starting thresholds; revise after baseline data.

| Decision | Continue if | Reconsider/pivot if |
|---|---|---|
| Problem | 15/25 owners show a recent real record/reminder problem | Interest is hypothetical and records are rarely needed. |
| Clinic demand | 3/10 clinics sign a concrete pilot commitment | Clinics like the idea but will not enrol owners or assign staff. |
| Activation | 40%+ of new owners add a useful record/reminder in 24h | Most stop after creating a pet. |
| Usability | 80% complete first record/share in prototype without help | Founder assistance remains necessary after iteration. |
| Retention | 30%+ of activated owners return in month 3 | Usage collapses once initial data is entered and no clinic loop exists. |
| Partner usage | 70%+ pilot clinics active weekly | Portal becomes shelfware. |
| Trust | Zero unauthorised record exposures or forged professional records | Any unresolved high-severity access/provenance flaw exists. |
| Monetisation | At least 30% of successful pilots accept a paid test | No clinic will pay enough to cover support and acquisition. |

### Analytics events

At minimum:

- `signup_started`, `signup_completed`
- `pet_created`
- `record_created` with category/source only
- `document_uploaded` with type/size only
- `reminder_created`, `reminder_due`, `reminder_delivered`, `reminder_completed`
- `share_created`, `share_viewed`, `share_revoked`
- `professional_verification_submitted`, `professional_verification_decided`
- `record_verified`, `record_superseded`
- `export_requested`, `export_completed`
- `account_deletion_requested`, `account_deleted`
- `permission_denied`, `upload_failed`, `notification_failed`

Never include free-text medical notes, medicine instructions, owner identifiers, document names, or access tokens in analytics.

---

## 16. Team and operating model

### Minimum recommended team for the December scope

- Founder/product lead: discovery, clinic sales, scope, launch.
- Veterinary advisor: workflow, terminology, templates, safety review.
- Product designer: prototypes, usability, design system, store assets.
- Mobile engineer.
- Backend/web engineer.
- QA engineer, at least part-time from September and intensive from October.
- Security/privacy/DevOps support, part-time but named.
- Clinic success/onboarding owner before beta.

One person may cover multiple roles, but every responsibility needs a named owner.

### Solo-founder fallback

If one person is coding:

- Ship Android or responsive PWA first.
- Support owner profiles, vaccination/medication records, documents, reminders, export, and time-limited sharing.
- Use an internal admin screen and a single vet verification flow.
- Do not build clinic staff, service-provider, marketplace, or broad daily-care modules.
- Call it a closed beta, not the full product.

### Budget categories

Build a cash plan covering:

- Product/engineering/design/QA.
- Company and app-store accounts.
- Legal: company, privacy, terms, trademark, partner agreements.
- Cloud, storage, messaging, monitoring, support.
- Test devices and connectivity.
- Security review and remediation.
- Clinic onboarding materials and travel.
- Launch creative/content.
- 15-20% contingency.

Do not spend heavily on launch marketing before prototype and pilot gates pass.

---

## 17. Top risks and mitigation

| Risk | Probability/impact | Mitigation |
|---|---|---|
| Manual entry fatigue | High/high | Card-first flow, minimal fields, clinic-assisted setup, assisted OCR only after manual learning. |
| Multi-sided cold start | High/high | Do not launch a marketplace; start with 3-5 clinic partners and a useful standalone owner record. |
| Commodity feature set | High/high | Provenance, portability, verification, low friction, and distribution—not more trackers. |
| Clinic resistance | High/high | Do not replace PIMS; prove time/recall ROI and provide onboarding. |
| Record accuracy/liability | Medium/high | Separate sources, veterinary review, attestations, correction history, no diagnosis. |
| Privacy/security incident | Medium/critical | Least privilege, signed links, audits, independent review, incident plan, data minimisation. |
| Low willingness to pay | High/high | Test clinic pricing before build expansion; keep core owner product free. |
| Competitor response | Medium/medium | Partner execution and trust are harder to copy than a feature list. |
| Brand conflict | Medium/high | Trademark/domain/app-store clearance now; rename early if needed. |
| App-store delay | Medium/high | Accounts and test tracks in August; target API 36; submit by late November. |
| ResQ scope/data leakage | Medium/high | Separate systems/databases/auth; referral link only; separate consent and policies. |
| Founder scope creep | High/high | One product owner, signed MVP scope, change budget, weekly cut list. |

### Stop or pivot conditions

Pause the full platform if, after two serious pilot iterations:

- Clinics will not enrol clients without payments/booking/PIMS replacement.
- Owners will not add a first useful record even with assisted onboarding.
- Month-3 activated-owner retention stays below 20% and verified reminders do not improve it.
- Paid clinic revenue cannot cover onboarding/support.
- Trust/compliance work exceeds the team’s capability or budget.

Possible pivot: a much smaller B2C “scan, remind, and export” app, or a clinic-only vaccination recall tool. A pivot is better than carrying five inactive portals.

---

## 18. Master action list in order

### This week

- [ ] Appoint product owner and veterinary advisor.
- [ ] Contact 10 clinics and schedule interviews.
- [ ] Recruit 25 target owners, not just friends/team.
- [ ] Create competitor accounts/demos and document the first-run experience.
- [ ] Start trademark/domain/app-store name clearance.
- [ ] Open organisation app-store accounts where possible.
- [ ] Recruit at least 12 reliable Android closed testers in case the account rule applies.
- [ ] Create the clickable owner record/reminder/share prototype.
- [ ] Draft pilot letter of intent and data-processing terms.
- [ ] Start a decision log; record every scope addition and what it displaces.

### Before coding product features

- [ ] Complete interviews and evidence summary.
- [ ] Secure 3 pilot clinics.
- [ ] Approve the P0/non-goal list.
- [ ] Produce complete P0 user journeys and acceptance criteria.
- [ ] Fix data/provenance/access model.
- [ ] Complete threat model and privacy data map.
- [ ] Choose stack based on team capability.
- [ ] Set Android API target 36 and supported device matrix.
- [ ] Define analytics events and north-star metric.
- [ ] Define release, rollback, support, and incident owners.

### Before closed beta

- [ ] Veterinary advisor approves terminology/templates.
- [ ] Professional verification procedure is documented and tested.
- [ ] Permission matrix has automated tests.
- [ ] Backup and restore drill passes.
- [ ] Privacy notice, terms, deletion/export, and support contacts work.
- [ ] Staging and production are isolated.
- [ ] Test on low/mid-range Android devices and intermittent networks.
- [ ] App-store metadata, screenshots, demo account, and reviewer notes are ready.
- [ ] Clinic staff are trained on consent and record provenance.

### Before public launch

- [ ] No open critical/high security or record-integrity defect.
- [ ] Crash-free beta sessions exceed 99.5%.
- [ ] Reminder failure alerts and retry work.
- [ ] Support response coverage is scheduled.
- [ ] Monitoring dashboard and rollback runbook are live.
- [ ] Pilot metrics and testimonials are permissioned and accurate.
- [ ] Legal/privacy review is complete against the latest Sri Lankan position.
- [ ] Brand clearance is complete.
- [ ] Launch is limited to a supportable geography/cohort.

### January 2027 decision

- [ ] Publish funnel, retention, clinic usage, reliability, and cost results.
- [ ] Decide: deepen record/reminder wedge, add appointment request, expand geography, or stop/pivot.
- [ ] Do not start P2 features without evidence tied to a metric or paying partner.

---

## 19. Development artefacts to create next

Create these in order:

1. `FURR_DISCOVERY_REPORT_2026.md`
2. `FURR_MVP_PRD_2026.md`
3. `FURR_USER_FLOWS.md`
4. `FURR_PERMISSION_MATRIX.md`
5. `FURR_DATA_MODEL.md` plus ERD
6. `FURR_API_CONTRACT.yaml`
7. `FURR_ANALYTICS_EVENTS.md`
8. `FURR_THREAT_MODEL.md`
9. `FURR_PRIVACY_DATA_MAP.md`
10. `FURR_TEST_AND_RELEASE_PLAN.md`
11. `FURR_PILOT_PLAYBOOK.md`
12. Sprint backlog with estimates, owners, dependencies, and acceptance tests

### Definition of Ready for a story

- User and problem are named.
- Acceptance criteria cover success, validation, permissions, empty/error/loading states, audit, and analytics.
- Design is approved.
- API/data changes are identified.
- Privacy/security implications are reviewed.
- Test data and dependencies are available.

### Definition of Done

- Code reviewed and automated tests pass.
- Permission tests pass for every affected role.
- Error/loading/empty/offline states are implemented.
- Accessibility checks pass.
- Analytics contains no sensitive content.
- Migration and rollback are tested.
- Documentation and support notes are updated.
- Acceptance criteria pass in staging on representative devices.
- Product/QA approves; veterinary advisor approves clinical terminology where affected.

---

## 20. Final recommendation

Proceed, but do not proceed with the current “whole product at once” plan.

The correct bet is:

> **Sri Lanka-first distribution, Colombo-first pilots, a global-ready architecture, and a narrow trusted record/reminder/sharing loop.**

Furr will not win because it has feeding, grooming, weight, reminders, vets, providers, and an admin dashboard in one app. Competitors can copy that list, and several already advertise it. Furr can win if entering a record is unusually easy, professional trust is visible, sharing is safer, and clinics repeatedly bring in the right owners.

By 31 December 2026, success is not “all features shipped.” Success is:

- A stable product in real users’ hands.
- Three or more clinics actively using it.
- A measurable activation and retention signal.
- Zero serious record-access incidents.
- Evidence that one party will pay.
- A clear Q1 2027 decision based on behaviour, not compliments.

That outcome is smaller than the SRS vision, but it is much more valuable to a startup.

---

## Research source index

### Sri Lanka market and regulation

- [PLOS ONE: Household preferences for pet keeping in Anuradhapura](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0277108)
- [Scientific Reports: Sri Lankan dog-population context](https://www.nature.com/articles/s41598-024-71148-1)
- [Public Health Veterinary Services](https://www.rabies.gov.lk/english/control.php)
- [DAPH private veterinary clinic registration](https://daph.gov.lk/services/Veterinary_Clinic_Registration)
- [Veterinary Council of Sri Lanka](https://www.slvetcouncil.org/the-council)
- [Veterinary Council member register](https://www.slvetcouncil.org/members)
- [TRCSL Q4 2025 telecom statistics](https://www.trc.gov.lk/content/files/statistics/2026/Statistics%20Report%20Q4%202025.pdf)
- [Statcounter Sri Lankan mobile/tablet OS share](https://gs.statcounter.com/os-market-share/mobile-tablet/sri-lanka)
- [Data Protection Authority of Sri Lanka](https://www.dpa.gov.lk/)
- [Personal Data Protection (Amendment) Act No. 22 of 2025](https://documents.gov.lk/view/act/2025/10/22-2025_E.pdf)

### Local competitors

- [DrPaw](https://drpaw.life/)
- [DrPaw on Google Play](https://play.google.com/store/apps/details?id=com.drpaw.pet)
- [PetDoc.lk on the App Store](https://apps.apple.com/lk/app/petdoc-lk/id1590193047)
- [PawZync](https://www.pawzync.com/)
- [PetMaster.lk](https://petmaster.lk/)
- [PawLa on Google Play](https://play.google.com/store/apps/details?id=lk.pawla)
- [Pet Buddy](https://www.pettbuddy.lk/)

### Global competitors and distribution requirements

- [11pets](https://www.11pets.com/en/news/export-data)
- [VitusVet](https://vitusvet.com/pet-owners/)
- [PetDesk](https://petdesk.com/veterinary-client-engagement-software)
- [PocketPet](https://www.pocketpet.com/)
- [Google Play testing requirement](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Android target API requirement](https://developer.android.com/google/play/requirements/target-sdk)
- [Apple App Review](https://developer.apple.com/app-store/review/)
