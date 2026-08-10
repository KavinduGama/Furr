# Furr Clinic

The professional and clinic operator application. This is deliberately web and tablet first: a consultation room needs a wide patient history, evidence viewer, verification actions, clinic notes, and audit context.

## First production slice

1. Staff authentication and MFA
2. One-time owner access-code redemption
3. Pet timeline and documents
4. Record verification / dispute workflow
5. Clinic-only notes and audit trail

The owner app must never import clinic-only screens or be given access to clinic datasets. Both products only share domain contracts, Firebase repositories, and design tokens.
