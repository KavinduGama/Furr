# Furr Product

The production workspace for Furr. It intentionally sits beside `FURR-MVP`, which remains the separate demonstration and experimentation project.

## Applications

- `apps/furr-owner` — Expo iOS and Android application for pet owners.
- `apps/furr-clinic` — Expo web/tablet portal for veterinary professionals and clinics.
- `apps/furr-admin` — restricted internal operations console.

## Shared packages

- `packages/core` — domain types, validation, provenance, permissions, and Firebase-facing contracts.
- `packages/firebase` — Firebase client configuration, repositories, and Functions contracts.
- `packages/ui` — platform-neutral design tokens, icons, and shared presentation primitives.

## Development

Install once from this directory, then run the production owner app:

```sh
pnpm install
pnpm owner
```

The owner app is the active implementation. The clinic and admin directories define their separate product boundaries and are intentionally queued after the owner health-data loop is live. Each application will own its own `app.json` and future `eas.json`; builds must be run from the relevant app directory.

## Environment policy

Use separate Firebase projects for development, staging, and production. Do not place Firebase service-account keys, Apple credentials, Android signing keys, or live provider keys in this repository.
