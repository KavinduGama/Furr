# Furr production build plan

## Repository policy

`../FURR-MVP` is a protected demonstration project. It is not imported by this workspace and is not the deployment source. Keep it for feature demonstrations, concept tests, and stakeholder walkthroughs.

`FURR-PRODUCT` is the production workspace. Commit it to a new Git repository before adding any credentials or beginning team development.

## Product boundaries

| Product | Primary surface | Users | Navigation |
| --- | --- | --- | --- |
| Furr Owner | Expo iOS and Android | Pet owners | Native bottom tabs + stacks + sheets |
| Furr Clinic | Web and tablet | Vets, clinic staff | Dense sidebar/workspace UI |
| Furr Admin | Restricted web | Furr operations | Narrow internal console |

All three use the same Firebase environment but enforce separate roles and claims. A shared repository does not imply shared access.

## Build sequence

1. Owner foundation: phone authentication, consent, onboarding, native tabs, pets.
2. Owner health loop: records, medication, reminders, camera/document upload, sharing grant.
3. Firebase hardening: development project, emulator tests, App Check, Functions, security rules, audit logging.
4. Clinic portal: staff MFA, code redemption, evidence review, verification, clinic notes.
5. Admin console: professional/clinic approval, support operations, privacy requests, audit search.
6. Release readiness: TestFlight/internal Android testing, accessibility, offline and notification testing, legal/privacy review.

## Firebase environment policy

Create independent Firebase projects for `furr-dev`, `furr-staging`, and `furr-production`. Production secrets stay in Firebase/Google Cloud Secret Manager and EAS credentials, never in `.env` files checked into Git.

## Inputs required before live integration

- Firebase organization/project owner access
- Final bundle identifiers and public domain names
- Phone/SMS provider decision and approved sender identity
- Apple Developer and Google Play organization accounts
- Privacy policy, retention schedule, data-processing and clinician-verification policy
- A small pilot clinic group and clinical verification workflow owner
