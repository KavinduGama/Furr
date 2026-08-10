# Furr MVP Build Plan 2026

**Document type:** Locked MVP product requirements and implementation plan  
**Version:** 1.0  
**Date:** 9 August 2026  
**Target launch:** Controlled Sri Lankan public release by 20 December 2026  
**Target geography:** Colombo and nearby Western Province areas  
**Source strategy:** [FURR_PRODUCT_MARKET_AND_DEVELOPMENT_BLUEPRINT.md](./FURR_PRODUCT_MARKET_AND_DEVELOPMENT_BLUEPRINT.md)  
**Product owner:** Founder  
**Status:** Ready for design decomposition, technical setup, estimation, and sprint planning

> This file defines the MVP that will ship. Features in the “Not in MVP” section are not to be designed or implemented unless the product owner formally removes another item of similar or greater effort.

---

## 1. MVP decision

### Product promise

Furr gives pet owners a private, portable preventive-care record. An owner can add a pet, digitise vaccination and medical information, receive reminders, share selected information, and obtain a clearly identified veterinarian-authored or veterinarian-verified record.

### Complete MVP loop

1. Owner creates an account.
2. Owner adds a dog or cat.
3. Owner photographs or uploads a vaccination/medical document.
4. Owner creates a structured vaccination, medication, or health record.
5. Furr schedules and delivers the relevant reminder.
6. Owner creates temporary access for a verified veterinarian.
7. Veterinarian authors a professional record or verifies a supported owner record.
8. Owner sees the updated provenance and can export a health summary.

If this loop is not reliable, the MVP is not ready regardless of how many secondary screens exist.

### Success definition for December

- At least 3 active pilot clinics.
- At least 100 real owner accounts and 100 activated pet profiles.
- At least 40% of new owners create a meaningful record or reminder within 24 hours.
- At least 30% month-2 retention among activated owners during the available cohort window.
- At least 70% of pilot clinics use the professional workflow weekly.
- Reminder processing succeeds at least 99% of the time.
- Crash-free mobile sessions exceed 99.5% during beta.
- No unresolved critical/high access-control, data-loss, or record-provenance defect.
- At least one clinic agrees to a paid post-pilot test.

---

## 2. Locked product decisions

These decisions remove ambiguity for implementation. Change them only through the change-control process.

| Decision | MVP choice |
|---|---|
| Supported pets | Dogs and cats only |
| Owner platform | Android and iOS mobile app; Android is the primary QA/release platform |
| Professional platform | Responsive web portal |
| Admin platform | Responsive internal web console |
| Owner authentication | Phone OTP; optional email for recovery/notifications |
| Professional authentication | Email/password plus MFA before professional access |
| Admin authentication | Email/password plus mandatory MFA |
| Interface language | English for MVP |
| Measurements | Metric defaults: kilograms and centimetres; preserve original stored unit |
| Time handling | Store UTC, display Asia/Colombo by default, retain user time-zone field |
| Pet ownership | One primary owner; additional guardians are not in MVP |
| Professional verification | Manual admin verification against the Veterinary Council register and submitted evidence |
| Clinic verification | Manual admin verification using clinic evidence and applicable DAPH registration information |
| Record trust | Owner-entered, document-supported, veterinarian-verified, and veterinarian-authored are separate states |
| Record corrections | Append-only revisions/superseding records; no silent overwrite of professional history |
| Sharing | Owner-created, category-limited, time-limited, revocable access |
| Monetisation | Free during pilot; no in-app payments in MVP |
| ResQ relationship | Referral link only; separate accounts, databases, and data |
| AI | No diagnosis, chatbot, summarisation, prediction, or automatic clinical decisions |
| App analytics | Privacy-safe behavioural/reliability metadata only; no record text or document content |

### Phone OTP fallback

If a production-ready Sri Lankan SMS provider is not approved by the end of Sprint 0, the closed beta will use email OTP. This is an implementation fallback, not a second authentication system to build in parallel.

---

## 3. Users and roles

### Pet owner

Creates and manages pets and owner-entered records, controls sharing, receives reminders, and exports information.

### Veterinarian

A verified professional who may view owner-authorised pet information and create or verify permitted professional records.

### Clinic operator

A verified clinic staff member who may perform restricted administrative actions such as owner onboarding and document upload. A clinic operator cannot author or verify veterinary medical records unless the same account also has a verified veterinarian role.

### System administrator

Verifies professionals/clinics, manages reference data, handles account status, and reviews audit/support information. Admin access to private pet content is denied by default.

### System services

- Authentication service
- Reminder worker
- Push notification service
- File-storage service
- Export worker
- Audit/monitoring service

---

## 4. MVP features to ship

## 4.1 Owner registration and account

### AUTH-001: Register with phone OTP

The owner enters a valid phone number, receives an OTP, accepts the current terms/privacy notice, and creates an active account.

Acceptance criteria:

- Phone numbers are normalised to E.164 format.
- OTP expires and cannot be reused.
- OTP attempts and resend frequency are rate-limited.
- A phone number cannot create duplicate active accounts.
- Terms/privacy version and acceptance time are recorded.
- Successful verification creates an owner role and profile.
- Failed, expired, and rate-limited states show understandable messages.

### AUTH-002: Login and session management

- Owner can log in with OTP.
- Session persists securely across normal app restarts.
- Owner can log out the current device.
- Owner can revoke all sessions from account settings.
- Suspended/deactivated accounts cannot access protected endpoints.
- Refresh/session tokens are stored using platform secure storage.

### AUTH-003: Recovery and account contact details

- Owner can add and verify an email address.
- Support-assisted phone-number change requires identity verification and an audit event.
- Owner can see verified/unverified contact status.
- The system never reveals whether an unrelated phone/email belongs to an account.

### ACC-001: Owner profile

Fields:

- Display name
- Phone number
- Optional verified email
- Optional district
- Preferred time zone
- Notification preferences
- Terms/privacy acceptance history

The MVP does not require date of birth, NIC/passport, gender, or full address.

### ACC-002: Account lifecycle

- Owner can request account deletion.
- A confirmation and cooling-off period are configurable.
- The system explains records that must be retained for professional/audit purposes.
- Personal data is deleted or anonymised according to the approved retention policy.
- Owner can cancel a pending deletion before execution.
- Deletion completion is auditable without retaining unnecessary personal data.

---

## 4.2 Pet profiles

### PET-001: Create pet

Required fields:

- Name
- Species: dog or cat
- Sex: male, female, unknown

Optional fields:

- Photograph
- Breed or mixed/unknown
- Date of birth or estimated age
- Colour/markings
- Microchip number
- Neutered/spayed status
- General note

Acceptance criteria:

- First pet can be created in under 60 seconds in usability testing.
- User may enter exact date of birth or estimated month/year/age.
- Future birth dates are rejected.
- Pet name is required and length-limited.
- Image upload validates type/size and creates a thumbnail.
- Newly created pet becomes the selected pet.
- Analytics records `pet_created` without name/photo/medical content.

### PET-002: View and switch pets

- Dashboard shows active pets.
- Selected pet is visible on every pet-specific screen.
- Owner can switch pets without reauthentication.
- Records never leak between selected pets.

### PET-003: Edit pet

- Owner can edit permitted demographic/profile fields.
- Changes to key fields are timestamped.
- Professional records are not altered when the pet profile changes.

### PET-004: Archive and restore pet

- Archive requires confirmation.
- Archived pet is excluded from normal dashboard and future non-essential reminders.
- Historical records and audit relationships remain intact.
- Owner can restore an archived pet.
- Permanent pet deletion is handled through the reviewed deletion process, not normal archive.

---

## 4.3 Owner dashboard

### DASH-001: Home dashboard

The dashboard shows:

- Selected pet card and pet switcher
- Next three upcoming due items
- Overdue items
- Latest health/vaccination/medication activity
- Add record action
- Share with veterinarian action
- Empty-state setup guidance

Acceptance criteria:

- Upcoming and overdue calculations use the user’s display time zone.
- Every due item identifies the relevant pet and record.
- Tapping an item opens the related record/reminder.
- Dashboard remains useful with no records through a clear first-action prompt.
- Loading, offline, empty, error, and partial-data states are designed.

---

## 4.4 Vaccination records

### VAC-001: Create owner-entered vaccination

Required fields:

- Vaccine/reference type or “Other”
- Administration date

Optional fields:

- Next due date
- Veterinarian
- Clinic
- Batch/lot number
- Certificate number
- Notes
- Linked document/image

Acceptance criteria:

- Future administration dates are rejected.
- Next due date must be after administration date.
- Owner can select a reference value or enter “Other.”
- Linked document is private and pet-scoped.
- Record displays `OWNER_ENTERED` or `OWNER_ENTERED_WITH_DOCUMENT`.
- Owner cannot mark the record veterinarian-verified.
- Saving a next due date offers to create a vaccination reminder.
- Duplicate warning appears for same pet/type/date; user may keep both after confirmation.

### VAC-002: Edit or archive owner vaccination

- Owner may edit or archive an owner-entered, unverified record.
- Editing a record with an existing verification creates a new revision and invalidates or flags the old attestation for review.
- Owner cannot change veterinarian-authored content.
- Archive requires confirmation and stops associated future reminders unless reassigned.

### VAC-003: Veterinarian-authored vaccination

Verified veterinarian can create a professional vaccination containing:

- Pet
- Vaccine/reference type
- Administration date
- Optional next due date
- Veterinarian author and clinic
- Optional batch/certificate
- Optional document
- Created/effective timestamps

Acceptance criteria:

- Author identity and credential status are server-derived.
- The record is labelled `VET_AUTHORED`.
- Owner receives a notification.
- Professional record is not silently editable; corrections create a revision/superseding record.
- Suspended/unverified professionals cannot create the record.

### VAC-004: Verify owner vaccination

- Verified veterinarian can attest that an owner record matches reviewed evidence.
- Attestation records verifier, clinic, time, evidence type, and optional note.
- Verification does not modify the owner’s original fields.
- If the owner changes supported fields, the attestation becomes stale/review-required.
- Owner sees verifier identity and verification date.

---

## 4.5 Medication plans and administration

### MED-001: Create medication plan

Required fields:

- Medication name
- Start date/time
- Frequency pattern
- Instruction/dose text

Optional fields:

- End date/time
- Prescribing veterinarian/clinic text
- Reason
- Notes
- Linked prescription/document

Supported frequency patterns:

- Once
- Every N hours
- One or more selected times daily
- Selected weekdays at one or more times

Not supported in MVP:

- Dose calculation
- Tapering dose engine
- Inventory/refill prediction
- Drug interaction warnings

Acceptance criteria:

- End must be after start.
- Frequency generates deterministic reminder instances.
- Time-zone change does not silently shift intended local administration times without confirmation.
- Medication instructions are treated as entered information, not medical advice.
- Owner is warned not to change prescribed treatment based on Furr.

### MED-002: View medication schedule

- Owner sees today’s due medication items per pet.
- Item shows medication, instruction text, due time, and status.
- Past and upcoming items are available within a defined window.

### MED-003: Complete, skip, or snooze a dose

- Complete records actual completion time.
- Skip requires optional reason.
- Snooze creates one replacement notification without changing the medication plan.
- Repeated taps are idempotent.
- Completion history is linked to the medication plan and pet.

### MED-004: Edit/end/archive plan

- Owner can edit future scheduling of an owner-created plan.
- Previously completed administrations remain unchanged.
- Ending a plan cancels future instances.
- Professional-authored medication instructions require professional correction rather than owner overwrite.

---

## 4.6 Health timeline

### HLT-001: Owner health observation

Owner can record:

- Observation date/time
- Category: symptom, behaviour, appetite, energy, digestion, skin/coat, injury, other
- Short description
- Optional severity: mild, moderate, concerning
- Optional photograph/document

Acceptance criteria:

- Record is visibly labelled owner-entered.
- Interface states that it is not a diagnosis.
- Description is length-limited and protected as private content.
- Owner can edit/archive own observation.
- Professionals see observations only with active permission.

### HLT-002: Allergy and ongoing-condition flags

Owner or verified veterinarian may add:

- Allergy/condition name
- Status: active, inactive/resolved, unknown
- Start/known date
- Reaction/notes
- Source/provenance

Acceptance criteria:

- Owner and professional sources remain distinct.
- Active flags appear in authorised health summary.
- Owner cannot edit veterinarian-authored flag; may dispute/request correction.

### HLT-003: Veterinarian professional visit record

Verified veterinarian may create a concise visit record:

- Visit date/time
- Clinic
- Reason for visit
- Clinical summary
- Diagnosis text, optional
- Treatment/procedure summary, optional
- Follow-up date/instructions, optional
- Linked documents

Acceptance criteria:

- Author/clinic/provenance are server-derived.
- Owner is notified.
- Follow-up date can create a reminder with owner confirmation or clinic-defined workflow.
- Correction creates a new revision; prior version remains traceable.
- Clinic operator cannot author this record.

### HLT-004: Unified timeline

- Chronological list combines vaccinations, medication plans/administrations, observations, professional visits, weight, and documents.
- Filters: all, vaccinations, medications, health, weight, documents.
- Every item displays source badge and date.
- Archived/superseded items are excluded by default but available in history where authorised.

---

## 4.7 Documents

### DOC-001: Upload document/image

Supported MVP formats:

- JPEG
- PNG
- PDF

Rules:

- Maximum file size is configurable; initial target 10 MB.
- Files are uploaded to private storage.
- Server verifies file type; do not trust filename extension.
- Image metadata not required for use is removed where practical.
- Malware/file scanning occurs before a document becomes available.
- Upload is associated with one pet and one uploader.

Document types:

- Vaccination card/certificate
- Prescription
- Laboratory report
- Visit summary
- Other medical document

### DOC-002: View/download document

- Authorised user receives a short-lived signed URL.
- Current permission is checked before URL creation.
- Access event records user/share context, document, time, and outcome.
- Private bucket paths are never public.
- Guest shares exclude documents by default and require explicit owner selection.

### DOC-003: Archive/delete document

- Owner may archive an owner-uploaded unreferenced document.
- Referenced professional evidence cannot be removed without preserving required record/audit integrity.
- Storage cleanup removes orphaned files after the approved grace period.
- Deleted data does not remain indefinitely in thumbnails/cache/export jobs.

---

## 4.8 Weight tracking

### WGT-001: Add weight

Fields:

- Measurement date
- Value
- Unit: kg or lb input
- Optional note/source

Acceptance criteria:

- Value must be positive and within configurable reasonable limits.
- Store original value/unit and normalised metric value.
- Future dates are rejected.
- Owner and professional source remain distinguishable.

### WGT-002: View trend

- Show chronological chart and latest value.
- Chart labels unit clearly.
- Empty state explains how to add a measurement.
- Chart does not make health claims or automatically diagnose gain/loss.

---

## 4.9 Reminders and notifications

### REM-001: Reminder sources

MVP reminder types:

- Vaccination next due
- Medication administration
- Professional follow-up
- Manual one-time care reminder

Manual grooming, feeding, exercise, and repeating general-care schedules are not included.

### REM-002: Reminder lifecycle

Statuses:

- Scheduled
- Due
- Delivered
- Opened
- Completed
- Skipped
- Snoozed
- Cancelled
- Failed

Acceptance criteria:

- Generation is idempotent.
- Updating/ending the source record updates future instances safely.
- Failed jobs retry with capped backoff.
- Permanent failure alerts operations.
- Deactivated/archived pets do not receive non-required reminders.
- Owner can disable a reminder without deleting its source medical record.

### NOT-001: Push and in-app notifications

- Push notification contains only minimal information appropriate for lock-screen display.
- Sensitive instruction text is shown after opening authenticated app.
- Tapping notification opens the correct pet and record/reminder.
- Notification centre supports unread/read status.
- Owner can control supported notification categories.
- Device-token failure is recorded and token is retired when appropriate.

### NOT-002: Security and account notifications

Supported messages:

- OTP/security code
- New professional verification result
- Professional record added/corrected
- Share redeemed or revoked, where appropriate
- Account deletion status
- Administrative suspension/security notice

---

## 4.10 Sharing and consent

### SHR-001: Create professional access grant

Owner selects:

- Pet
- Purpose: veterinary care
- Categories: summary, vaccinations, medications, health timeline, weight, selected documents
- Duration: 24 hours or 7 days

Furr generates a short-lived QR/code that a logged-in professional redeems. The redemption code itself expires after 15 minutes and can be used once. The resulting access grant uses the owner-selected duration.

Acceptance criteria:

- Code is random, rate-limited, one-time use, and not guessable.
- Owner sees exactly what will be shared before confirmation.
- Professional identity/clinic and grant scope are recorded at redemption.
- A professional cannot expand the grant.
- Expired/revoked grant fails on every API, file, cache, and export path.

### SHR-002: Manage access

- Owner sees active and historical grants.
- Active entry shows professional/clinic, categories, creation, expiry, and last access.
- Owner may revoke immediately.
- Revocation creates notification/audit activity.
- Professional portal updates promptly and blocks further access.

### SHR-003: Export/share summary outside Furr

Owner can generate a PDF pet summary containing selected categories.

The PDF includes:

- Pet identity/photo, where selected
- Active allergies/conditions
- Vaccination summary
- Current medication plans
- Recent professional visits, where selected
- Source/provenance labels
- Generated-at timestamp
- Disclaimer that it is a summary, not an official travel certificate or replacement for veterinary advice

The PDF is generated on demand, has a limited download window, and is not indexed publicly.

The owner is warned that Furr can expire the download link but cannot revoke a PDF after another person has downloaded or copied it. For revocable access, the owner must use an in-app professional access grant.

---

## 4.11 Professional onboarding and portal

### PRO-001: Veterinarian application

Applicant provides:

- Legal/professional name
- Veterinary Council registration number
- Email and phone
- District
- Associated clinic, if any
- Submitted evidence/document if required

Statuses:

- Draft
- Submitted
- Under review
- Verified
- Rejected
- Suspended

Acceptance criteria:

- Applicant cannot access professional pet records before verification.
- Admin decision includes reviewer, time, reason, and evidence reference.
- Duplicate registration numbers are flagged.
- Rejected applicant can receive a reason and resubmit if permitted.

### PRO-002: Professional dashboard

Dashboard shows:

- Verification/account status
- Redeem owner code action
- Currently authorised pets
- Access expiry
- Recent professional records authored by the user
- Associated clinic

It does not show a searchable global pet directory.

### PRO-003: Authorised pet view

- Only categories within the active grant are visible.
- Prominent allergies/conditions appear when included.
- Source badge appears on every record.
- Professional can create only allowed professional records.
- Access is checked on each request, not only on page entry.
- Expiry/revocation clears protected client state and blocks new requests.

### PRO-004: Professional correction

- Professional may correct their own authored record through a revision.
- Revision requires reason.
- Current view shows latest valid version.
- Authorised history shows prior versions and correction chain.
- Another veterinarian cannot silently alter the original author’s record.

---

## 4.12 Clinic operator

### CLN-001: Clinic membership

- Admin or authorised clinic manager associates an operator with one verified clinic.
- Operator status: invited, active, suspended, removed.
- Permissions are server-defined and not self-editable.

### CLN-002: Restricted functions

Clinic operator may:

- Help an owner start the registration/QR flow.
- Redeem an owner grant when logged in.
- View only categories granted to the clinic/operator.
- Upload an allowed clinic document linked to a pet/visit.
- Enter non-clinical document metadata.

Clinic operator may not:

- Create or verify a vaccination as a veterinarian.
- Create a professional medical record.
- Change diagnosis/treatment information.
- Search pets without a current grant.
- Export entire owner data.

If clinic-operator work threatens the launch date, `CLN-001/002` is the first feature group to cut. Verified veterinarians perform pilot actions instead.

---

## 4.13 Administration

### ADM-001: Professional and clinic verification

- Search/filter applications.
- Review submitted evidence.
- Record independent register check.
- Approve, reject, suspend, reactivate.
- Require reason for rejection/suspension/reactivation.
- Notify affected user.
- Audit all actions.

### ADM-002: User/account support

- Search by exact/limited identifier.
- View account status and role—not private pet content by default.
- Suspend/reactivate with reason.
- Revoke sessions.
- View deletion request status.
- No password/OTP visibility.

### ADM-003: Reference data

Manage:

- Dog/cat breeds
- Vaccine categories/types
- Health-observation categories
- Document types
- Districts
- Allowed statuses/configuration

Changes are versioned/audited. Removing a value does not corrupt historical records; deactivate rather than hard-delete referenced values.

### ADM-004: Audit search

Search by:

- Actor/user ID
- Pet ID
- Clinic/professional ID
- Event type
- Date range
- Success/failure

Audit records are read-only for ordinary admins. Sensitive audit access is separately permissioned.

### ADM-005: Operational overview

Show:

- Active/suspended users by role
- Pending professional/clinic reviews
- Reminder delivery failures
- Upload/processing failures
- Background-job status
- Recent security alerts

Business analytics may be linked separately; do not mix private record content into admin operations.

---

## 4.14 Privacy, export, and support

### PRIV-001: Privacy controls

Owner can:

- View current privacy notice/terms version.
- View active and historical access grants.
- Export account/pet data.
- Revoke access.
- Request account deletion.
- Manage notification preferences.

### PRIV-002: Machine-readable export

Export contains owner-authorised data in documented JSON/CSV plus referenced document download links valid for a limited time.

Acceptance criteria:

- Export job requires recent authentication.
- Owner is notified when ready.
- Download expires.
- Export is encrypted in transit and not publicly indexed.
- Job and download access are audited.

### SUP-001: Support entry point

- Mobile and web include support email/form.
- User may report account, access, record, notification, or technical issue.
- Support request avoids attaching private content unless necessary and consented.
- Critical privacy/security issue follows the incident playbook.

---

## 5. Not in MVP

The following are explicitly excluded:

- Veterinary appointment booking or scheduling
- Payments or subscriptions
- Video/audio consultations
- Real-time chat
- AI diagnosis, AI chatbot, health prediction, or automatic medical recommendations
- Service-provider portal/directory/marketplace
- Grooming, boarding, sitting, training, transport, or ambulance booking
- Feeding schedules
- General grooming schedules
- Exercise/walk tracking
- Social posts, messaging, reviews, or ratings
- Lost/found pets
- Adoption
- E-commerce, food, medicines, or delivery
- Insurance
- Full clinic patient-management system
- Clinic billing, inventory, prescriptions, lab integration, or accounting
- Wearables/IoT
- Family/household/caregiver accounts
- Pet ownership transfer workflow
- Emergency break-glass access
- ResQ login, account linking, or data exchange
- OCR/AI extraction from records
- Sinhala/Tamil interface
- Global marketing or non-Sri Lankan credential systems

Future database flexibility may support these later, but no unused screens, APIs, tables, or speculative infrastructure should be built for them now.

---

## 6. Permission matrix

`Own` means records belonging to the owner’s pet. `Granted` means within an active owner-created grant.

| Capability | Owner | Verified veterinarian | Clinic operator | Admin |
|---|---:|---:|---:|---:|
| Create/edit own profile | Yes | Yes | Yes | Own only |
| Create/edit/archive pet | Own | No | No | No |
| View pet profile | Own | Granted | Granted | No by default |
| Create owner observation | Own | No | No | No |
| Create owner vaccination | Own | No | No | No |
| Create veterinarian vaccination | No | Granted | No | No |
| Verify owner vaccination | No | Granted | No | No |
| Create professional visit record | No | Granted | No | No |
| Upload owner document | Own | Granted professional context | Granted clinic context | No |
| View document | Own | Granted/selected | Granted/selected | No by default |
| Create medication plan | Own | Granted professional context | No | No |
| Complete medication dose | Own | No | No | No |
| Add weight | Own | Granted | No | No |
| Create/revoke access grant | Own | No | No | No |
| Export selected pet summary | Own | No | No | No |
| Review professional application | No | No | No | Yes |
| Suspend accounts | No | No | No | Yes, reason/audit required |
| Manage reference data | No | No | No | Yes |
| View audit records | Own access history only | Own activity only | Own activity only | Permissioned admin only |

Every server endpoint and database policy must be mapped to this matrix and tested for allowed and denied cases.

---

## 7. Data model

Use UUID primary keys, UTC timestamps, explicit status fields, foreign keys, and server-generated audit metadata. Tables below are logical; exact naming may change during schema review.

### Identity and organisation

#### `users`

- `id`
- `auth_provider_id`
- `status`
- `created_at`, `updated_at`, `deactivated_at`

#### `user_profiles`

- `user_id`
- `display_name`
- `phone_e164`
- `phone_verified_at`
- `email`
- `email_verified_at`
- `district_code`
- `timezone`
- `notification_preferences_json`

#### `roles`, `permissions`, `user_roles`, `role_permissions`

Role assignments include status, grantor, reason, and time range where applicable.

#### `professional_profiles`

- `user_id`
- `professional_name`
- `council_registration_number`
- `district_code`
- `verification_status`
- `verified_at`, `verified_by`
- `suspension_reason`

#### `professional_verification_evidence`

- `professional_id`
- `evidence_type`
- `document_id`
- `register_check_result`
- `reviewer_id`
- `reviewed_at`
- `decision`, `reason`

#### `clinics`

- `id`
- `name`
- `registration_reference`
- `district_code`
- `contact_phone`, `contact_email`
- `verification_status`
- `verified_at`, `verified_by`

#### `clinic_memberships`

- `clinic_id`, `user_id`
- `membership_role`
- `status`
- `created_by`, `created_at`, `ended_at`

### Pet and ownership

#### `pets`

- `id`
- `name`
- `species_code`
- `breed_code`, `breed_text`
- `sex`
- `birth_date`, `birth_date_precision`, `estimated_age_months`
- `colour_markings`
- `microchip_number_encrypted`
- `neutered_status`
- `photo_document_id`
- `status`
- `created_at`, `updated_at`, `archived_at`

#### `pet_ownerships`

- `pet_id`
- `owner_user_id`
- `ownership_role` = primary owner
- `status`
- `created_at`, `ended_at`

The schema may support future guardians, but the MVP UI/API creates one primary owner only.

### Records

All clinical/care records share:

- `id`, `pet_id`
- `source_type`
- `created_by_user_id`
- `professional_id`, optional
- `clinic_id`, optional
- `effective_at`
- `created_at`, `updated_at`
- `status`
- `supersedes_record_id`, optional
- `revision_reason`, optional

#### `vaccination_records`

- `vaccine_type_code`, `vaccine_type_text`
- `administration_date`
- `next_due_date`
- `provider_text`
- `batch_number`, `certificate_number`
- `note`

#### `vaccination_attestations`

- `vaccination_record_id`
- `verifier_professional_id`
- `clinic_id`
- `evidence_type`
- `evidence_document_id`
- `status`
- `verified_at`
- `invalidated_at`, `invalidation_reason`

#### `medication_plans`

- `medication_name`
- `instruction_text`
- `reason_text`
- `start_at`, `end_at`
- `timezone`
- `schedule_rule_json`
- `prescriber_text`

#### `medication_administrations`

- `medication_plan_id`
- `scheduled_at`
- `status`
- `completed_or_skipped_at`
- `actor_user_id`
- `skip_reason`
- `snoozed_until`

#### `health_observations`

- `category_code`
- `description`
- `severity`
- `observed_at`

#### `health_flags`

- `flag_type` = allergy or condition
- `name`
- `status`
- `known_from_date`
- `reaction_or_note`

#### `professional_visit_records`

- `visit_at`
- `reason_text`
- `clinical_summary`
- `diagnosis_text`
- `treatment_summary`
- `follow_up_at`
- `follow_up_instruction`

#### `weight_records`

- `measured_at`
- `original_value`, `original_unit`
- `normalised_kg`
- `note`

### Files and linkage

#### `documents`

- `id`
- `owner_user_id`
- `pet_id`
- `document_type_code`
- `storage_key`
- `original_filename_sanitised`
- `mime_type`, `size_bytes`, `checksum`
- `scan_status`
- `status`
- `created_at`, `archived_at`, `deleted_at`

#### `record_documents`

- `record_type`
- `record_id`
- `document_id`
- `relationship_type`

### Sharing

#### `access_grants`

- `id`
- `pet_id`, `owner_user_id`
- `grantee_user_id`, optional until redemption
- `grantee_clinic_id`, optional
- `purpose_code`
- `scope_json`
- `status`
- `starts_at`, `expires_at`, `revoked_at`
- `created_at`

#### `share_redemption_codes`

- `access_grant_id`
- `code_hash`
- `expires_at`
- `max_uses` = 1
- `used_at`, `used_by_user_id`
- `failed_attempt_count`

### Reminders and notifications

#### `reminder_rules`

- `pet_id`
- `source_type`, `source_id`
- `reminder_type`
- `schedule_json`
- `timezone`
- `status`

#### `reminder_instances`

- `reminder_rule_id`
- `scheduled_at`
- `status`
- `deduplication_key`
- `completed_at`, `skipped_at`, `snoozed_until`

#### `notifications`

- `user_id`, `pet_id`
- `type`
- `title_key`, `body_key`
- `deep_link`
- `status`
- `created_at`, `read_at`

#### `notification_delivery_attempts`

- `notification_id`
- `channel`
- `provider_message_id`
- `attempted_at`
- `outcome`, `error_code`

### Governance

#### `reference_values`

- `category`
- `code`
- `display_name`
- `status`
- `sort_order`
- `valid_from`, `valid_to`

#### `audit_events`

- `id`
- `actor_user_id`, optional system actor
- `actor_role`
- `action`
- `target_type`, `target_id`
- `pet_id`, optional
- `access_grant_id`, optional
- `outcome`
- `reason_code`
- `request_id`
- `ip/device metadata` according to privacy policy
- `created_at`

Audit event payloads must not copy full medical text, document content, passwords, OTPs, or tokens.

---

## 8. API surface

Produce an OpenAPI document before implementation of each group. The routes below define the intended boundary, not final transport details.

### Account

- `POST /auth/otp/request`
- `POST /auth/otp/verify`
- `POST /auth/logout`
- `POST /auth/sessions/revoke-all`
- `GET /me`
- `PATCH /me`
- `POST /me/email/verify`
- `POST /me/export`
- `POST /me/deletion-request`
- `DELETE /me/deletion-request`

### Pets

- `GET /pets`
- `POST /pets`
- `GET /pets/{petId}`
- `PATCH /pets/{petId}`
- `POST /pets/{petId}/archive`
- `POST /pets/{petId}/restore`
- `GET /pets/{petId}/dashboard`
- `GET /pets/{petId}/timeline`

### Vaccinations

- `GET /pets/{petId}/vaccinations`
- `POST /pets/{petId}/vaccinations`
- `GET /vaccinations/{id}`
- `PATCH /vaccinations/{id}`
- `POST /vaccinations/{id}/archive`
- `POST /vaccinations/{id}/attestations`
- `POST /vaccinations/{id}/supersede`

### Medications

- `GET /pets/{petId}/medication-plans`
- `POST /pets/{petId}/medication-plans`
- `GET /medication-plans/{id}`
- `PATCH /medication-plans/{id}`
- `POST /medication-plans/{id}/end`
- `GET /pets/{petId}/medication-administrations`
- `POST /medication-administrations/{id}/complete`
- `POST /medication-administrations/{id}/skip`
- `POST /medication-administrations/{id}/snooze`

### Health and weight

- `GET /pets/{petId}/observations`
- `POST /pets/{petId}/observations`
- `PATCH /observations/{id}`
- `POST /observations/{id}/archive`
- `GET /pets/{petId}/health-flags`
- `POST /pets/{petId}/health-flags`
- `POST /health-flags/{id}/supersede`
- `GET /pets/{petId}/professional-visits`
- `POST /pets/{petId}/professional-visits`
- `POST /professional-visits/{id}/supersede`
- `GET /pets/{petId}/weights`
- `POST /pets/{petId}/weights`
- `PATCH /weights/{id}`

### Documents

- `POST /pets/{petId}/documents/upload-intent`
- `POST /documents/{id}/complete-upload`
- `GET /documents/{id}/download-intent`
- `POST /documents/{id}/archive`
- `POST /records/{recordType}/{recordId}/documents/{documentId}`

### Reminders and notifications

- `GET /pets/{petId}/reminders`
- `POST /pets/{petId}/reminders`
- `PATCH /reminders/{id}`
- `POST /reminders/{id}/cancel`
- `GET /notifications`
- `POST /notifications/{id}/read`
- `POST /notifications/read-all`
- `POST /devices/push-token`
- `DELETE /devices/push-token/{id}`

### Sharing

- `GET /pets/{petId}/access-grants`
- `POST /pets/{petId}/access-grants`
- `POST /access-grants/{id}/redemption-code`
- `POST /access-grants/redeem`
- `POST /access-grants/{id}/revoke`
- `GET /access-grants/{id}/access-events`
- `POST /pets/{petId}/summary-export`

### Professional/clinic

- `POST /professional-applications`
- `GET /professional/me/status`
- `GET /professional/authorised-pets`
- `GET /professional/pets/{petId}`
- `POST /clinic-memberships/accept`

### Admin

- `GET /admin/professional-applications`
- `POST /admin/professional-applications/{id}/approve`
- `POST /admin/professional-applications/{id}/reject`
- `POST /admin/professionals/{id}/suspend`
- `POST /admin/professionals/{id}/reactivate`
- `GET /admin/clinics`
- `POST /admin/clinics/{id}/verify`
- `POST /admin/users/{id}/suspend`
- `POST /admin/users/{id}/revoke-sessions`
- `GET /admin/reference-values`
- `POST /admin/reference-values`
- `PATCH /admin/reference-values/{id}`
- `GET /admin/audit-events`
- `GET /admin/operations/summary`

### API rules

- Validate all input server-side using shared schemas.
- Use idempotency keys for create/retry-sensitive endpoints.
- Never trust role, owner, professional, or clinic IDs supplied by clients when they can be derived from the session.
- Return stable machine-readable error codes plus safe user messages.
- Paginate timelines, records, notifications, applications, and audits.
- Include request IDs in errors/logs.
- Use optimistic concurrency or version checks for record updates.
- Recheck authorisation when generating signed URLs and exports.

---

## 9. Technical architecture

### Chosen reference stack

- Monorepo: pnpm + Turborepo
- Language: TypeScript
- Owner app: Expo/React Native
- Professional/admin web: Next.js
- Backend: managed Supabase/PostgreSQL with server functions/services where privileged workflows are required
- Authentication: managed phone/email auth; professional/admin MFA
- Storage: private managed object storage
- Jobs: durable scheduled worker/queue for reminders, exports, cleanup, and notifications
- Push: FCM/APNs through Expo notification tooling or a thin provider abstraction
- Validation: shared typed schemas
- Testing: unit, API integration, database-policy, and end-to-end tests
- Monitoring: error tracking, structured logs, uptime and job alerts

If the implementation team is materially stronger in Flutter, approve one documented stack change before repository setup. Do not maintain Flutter and React Native together.

### Repository structure

```text
furr/
  apps/
    mobile/                 # Expo owner app
    web/                    # Professional and admin portal
  packages/
    domain/                 # Entities, enums, validation, business rules
    api-client/             # Typed client and transport errors
    ui-mobile/              # Shared mobile components/tokens
    ui-web/                 # Shared web components/tokens
    analytics/              # Event names and safe payload types
    config/                 # Lint, TypeScript, formatting, test config
  services/
    reminder-worker/
    export-worker/
    file-scan-worker/
  supabase/
    migrations/
    seed/
    functions/
    policy-tests/
  docs/
    api/
    decisions/
    runbooks/
    security/
  tests/
    e2e/
    fixtures/
```

### Environments

- Local development
- Shared development
- Staging
- Production

Rules:

- Separate database/auth/storage projects per environment.
- Never copy production personal/record data into development.
- Use synthetic test fixtures.
- Production access is least-privilege and audited.
- Migrations move forward through CI/CD; rollback or corrective migration is documented.
- Feature flags control professional authoring, clinic operator, and public registration.

### ResQ separation

- Separate repository or independently deployable application.
- Separate database, storage, authentication, analytics, secrets, and backups.
- Furr may accept a campaign/referral parameter.
- No automatic account creation or record transfer.

---

## 10. Security and privacy requirements

### Authentication and session security

- Rate-limit OTP/password/MFA endpoints by account, IP/risk signal, and device where appropriate.
- Store tokens in secure platform storage.
- Rotate/revoke refresh sessions.
- Require recent authentication for export, deletion, MFA changes, and high-risk admin actions.
- Lock or challenge suspicious repeated attempts.
- Do not log OTPs, passwords, access tokens, or share codes.

### Authorisation

- Server and database enforce permissions independently of UI visibility.
- Default deny.
- Every pet-scoped query includes verified ownership or active grant.
- Every document signed URL requires a fresh permission check.
- Every professional mutation requires current verified status.
- Admin private-record access is absent from normal routes.
- Test horizontal and vertical privilege escalation.

### Data protection

- TLS in transit.
- Managed encryption at rest.
- Encrypt especially sensitive identifiers at application/field level when justified.
- Private storage buckets.
- Retention schedule for OTP/security logs, documents, exports, deleted accounts, and audits.
- Processor/vendor inventory and agreements.
- Privacy-safe logging and analytics.
- Documented breach/incident response.

### Audit events required

- Login/security changes
- Role and membership changes
- Professional/clinic verification decisions
- Pet access-grant create/redeem/revoke/expire
- Professional record create/correct
- Vaccination verification/invalidation
- Document access/download/archive
- Admin account actions
- Export and deletion request/completion
- Permission-denied events at meaningful risk thresholds

### Backups

- Daily automated database backup for pilot.
- File-storage recovery strategy documented.
- Restore drill before closed beta and before public release.
- Target pilot RPO: 24 hours.
- Target pilot RTO: 8 hours.
- Backup access separated from ordinary app administration.

---

## 11. Analytics and product metrics

### North-star metric

Monthly active pets with at least one meaningful care action:

- Veterinarian-authored/verified record
- Completed due reminder
- Controlled record share

### Activation

Activated owner = account with a pet plus at least one record or reminder within 24 hours.

### Event dictionary

| Event | Allowed properties |
|---|---|
| `signup_started` | method, platform |
| `signup_completed` | platform, referral_source |
| `pet_created` | species, birth_precision_present, photo_present |
| `record_created` | record_category, source_type, document_present |
| `vaccination_attested` | source_type, clinic_id pseudonymous/internal |
| `medication_plan_created` | frequency_type, has_end_date |
| `reminder_created` | reminder_type, source_type |
| `reminder_delivered` | type, channel, latency_bucket |
| `reminder_completed` | type, on_time_bucket |
| `document_uploaded` | document_type, mime_type, size_bucket |
| `share_created` | duration, category_count |
| `share_redeemed` | grantee_role, time_to_redeem_bucket |
| `share_revoked` | before_expiry boolean |
| `summary_exported` | category_count, format |
| `professional_application_decided` | outcome, review_time_bucket |
| `permission_denied` | route_group, actor_role, reason_code |
| `job_failed` | job_type, error_code, retry_count |

Prohibited analytics properties:

- Names, phone, email
- Pet name or microchip
- Medical/observation/diagnosis/instruction text
- Medication/vaccine free text
- Document filename/content/URL
- OTP, token, share code
- Exact professional registration number

---

## 12. UX requirements

### Product principles

- A useful first result within three minutes.
- One clear primary action per screen.
- Always show the selected pet.
- Trust/source labels use text plus icon, not colour alone.
- Do not present owner observations as clinical conclusions.
- Ask for the minimum information first; optional detail can follow.
- Explain why access/data is requested at the point of use.
- Destructive and sharing actions show consequences before confirmation.

### Required mobile screens

1. Welcome/value proposition
2. Phone entry and OTP
3. Terms/privacy consent
4. Add first pet
5. Home dashboard
6. Pet switcher/list
7. Pet profile/view/edit
8. Timeline with filters
9. Add-record chooser
10. Add/view/edit vaccination
11. Add/view/edit medication plan
12. Today’s medication items
13. Add/view observation
14. Allergy/condition flags
15. Add/view weight and trend
16. Upload/document viewer
17. Reminder list/detail
18. Notification centre
19. Create share/access grant
20. Active/history access list
21. Export summary selection/status
22. Account/profile/settings
23. Privacy/export/deletion
24. Support

### Required professional web screens

1. Login/MFA
2. Application/status
3. Professional dashboard
4. Redeem owner code
5. Authorised pet summary
6. Vaccination author/verify flow
7. Professional visit create/correct flow
8. Access expiry/revocation state
9. Profile/clinic membership

### Required admin screens

1. Login/MFA
2. Operations overview
3. Professional review queue/detail
4. Clinic review/detail
5. User/account support status
6. Reference data
7. Audit search/detail

### Required screen states

Every data-driven screen defines:

- Loading
- Empty
- Success
- Validation error
- Server/network error
- Permission denied
- Suspended/revoked/expired where applicable
- Offline/read-only where supported

---

## 13. Delivery roadmap

### Sprint 0: discovery, prototype, foundations — 10-30 August

Product/design:

- Complete owner/vet/clinic interviews.
- Secure 3 pilot letters of intent.
- Test clickable record/reminder/share flow.
- Lock PRD and permission matrix.
- Complete privacy data map and threat model.

Engineering:

- FND-001 to FND-003
- OBS-001
- SEC-001 test harness
- Environment setup
- Auth provider/SMS proof of concept
- Store-account setup and Android tester recruitment

Exit:

- Three clinics commit to pilot.
- Prototype usability gate passes.
- Architecture and MVP scope approved.
- Staging deployment works.

### Sprint 1: authentication and pets — 31 August-13 September

- AUTH-001 to AUTH-003
- ACC-001
- PET-001 to PET-004
- DASH-001 shell and empty state
- Base analytics events
- Database ownership policies/tests

Exit:

- Owner registers and creates/switches/archives a pet on a real Android device.
- Cross-owner pet access tests fail safely.

### Sprint 2: vaccinations and documents — 14-27 September

- VAC-001, VAC-002
- DOC-001 to DOC-003
- Vaccination detail/list/timeline
- Secure upload/download flow
- Initial vaccine reference data

Exit:

- Owner creates a document-backed vaccination.
- Private file access and duplicate-warning tests pass.

### Sprint 3: medication and reminder engine — 28 September-11 October

- MED-001 to MED-004
- REM-001, REM-002
- NOT-001 owner push/in-app flow
- Today/upcoming/overdue dashboard
- Reminder worker monitoring

Exit:

- Scheduled medication/vaccination reminder is delivered, opened, completed/skipped, and audited.
- Retry/idempotency tests pass.

### Sprint 4: health timeline, flags, weight — 12-25 October

- HLT-001, HLT-002, HLT-004
- WGT-001, WGT-002
- Timeline filters and source badges
- Record archive/history behaviour

Exit:

- Owner has a complete useful standalone product without professional participation.

### Sprint 5: sharing and professional trust — 26 October-8 November

- SHR-001 to SHR-003
- PRO-001 to PRO-004
- VAC-003, VAC-004
- HLT-003
- AUTH-002 professional MFA/status
- AUD-001 coverage

Exit:

- Owner grants access; verified vet redeems and authors/verifies; owner revokes; all later access fails.
- Professional correction history is preserved.

### Sprint 6: admin, privacy, operations — 9-22 November

- ADM-001 to ADM-005
- PRIV-001, PRIV-002
- SUP-001
- ACC-002 deletion lifecycle
- OPS-001 backup/restore and incident runbook
- Security/privacy review fixes
- CLN-001/002 only if schedule remains healthy

Exit:

- Professional/clinic verification, deletion/export, backup restore, and operational alerts work.

### Sprint 7: closed beta and hardening — 23 November-6 December

- 12+ opted-in Android testers for 14 continuous days if required.
- 50-100 owners and 3 clinics.
- E2E, permission, device, background notification, accessibility, and performance testing.
- Bug fixes only after scope freeze.
- App-store assets, privacy, support, demo accounts.

Exit:

- Release gates in Section 16 pass.
- Google/Apple submissions are complete.

### Sprint 8: controlled launch and stabilisation — 7-31 December

- Phased Colombo/Western Province rollout.
- Daily reliability/support review in launch week.
- Fix critical/high issues; no new feature epics.
- Publish launch metrics and Q1 2027 decision report.

---

## 14. First ten engineering days

### Day 1-2

- Create monorepo and shared TypeScript/lint/test configuration.
- Create development/staging projects.
- Establish CI checks and secret management.
- Record architecture decision documents.

### Day 3-4

- Implement initial migrations: users, profiles, roles, pets, ownership, audit.
- Seed roles/reference values.
- Create database-policy test harness.
- Prove owner A cannot read owner B’s pet.

### Day 5-6

- Integrate chosen OTP provider in development.
- Implement session storage, logout, suspended-state middleware.
- Build mobile welcome/phone/OTP/account bootstrap.

### Day 7-8

- Implement pet create/list/detail/edit/archive APIs and policies.
- Build add-pet and pet-switcher screens.
- Add `signup_completed` and `pet_created` safe analytics.

### Day 9-10

- Deploy vertical slice to staging.
- Run on at least three physical Android devices.
- Add E2E registration -> add pet test.
- Demo to product owner, veterinarian advisor, and one pilot clinic.
- Record issues and update estimates before Sprint 1 continues.

The first engineering milestone is not a database or login screen. It is a tested vertical slice running on a real device against staging.

---

## 15. Testing plan

### Unit tests

- Date validation and time-zone conversion
- Medication schedule generation
- Reminder idempotency/deduplication
- Record provenance transitions
- Source badge mapping
- Weight unit conversion
- Export category selection
- Share expiry/revocation

### Database/authorisation tests

For every table/API:

- Owner A allowed for own pet.
- Owner B denied for owner A pet.
- Unverified veterinarian denied.
- Verified veterinarian denied without grant.
- Verified veterinarian allowed only within active scope.
- Revoked/expired grant denied.
- Clinic operator denied clinical authorship.
- Ordinary admin denied pet content.
- Suspended user denied.

### API integration tests

- OTP/rate limits/session revoke
- Pet CRUD/archive
- Vaccination create/edit/attest/supersede
- Medication plan/administrations
- Document upload/scan/view/archive
- Reminder creation/delivery state
- Share redeem/revoke
- Professional verification/status
- Export/deletion
- Audit generation

### End-to-end tests

1. Owner signup -> add pet -> add vaccination -> create reminder.
2. Reminder delivered -> open -> complete.
3. Owner upload document -> view -> attach to vaccination.
4. Owner create grant -> vet redeem -> view allowed categories.
5. Vet author vaccination -> owner sees notification/provenance.
6. Owner revoke -> vet blocked.
7. Vet correct record -> history preserved.
8. Owner export summary -> expired link blocked later.
9. Owner deletion request -> cancel -> request -> completion.
10. Admin approve/suspend vet -> professional permissions update immediately.

### Device/browser matrix

Mobile minimum:

- Three low/mid-range Android devices covering supported OS range.
- One current high-end Android.
- Two supported iPhones/iOS versions.
- Slow/intermittent connection and background/killed-app notification tests.

Web minimum:

- Current and previous major Chrome.
- Current Edge.
- Current Safari.
- Responsive desktop and tablet widths.
- Keyboard-only navigation.

### Security tests

- Horizontal/vertical privilege escalation
- ID enumeration
- Share-code brute force/rate limiting
- Signed URL reuse after revocation/expiry
- Session fixation/revocation
- File type mismatch and malicious upload
- Stored/reflected injection in all text fields
- Mass assignment
- Sensitive data in logs/analytics/errors
- Admin/professional MFA bypass
- Backup/restore access

### Usability tests

- 10 representative owners before beta.
- 5 clinic/veterinary staff before professional pilot.
- Observe without guiding.
- Target: 80% complete add-pet + record + reminder + share prototype flow without help.

---

## 16. Release gates

### Product

- All MVP stories pass acceptance criteria.
- All required screens and states exist.
- Owner activation is usable without staff help.
- Vet workflow tested by real registered veterinarians.
- No accidentally exposed out-of-scope feature or placeholder.

### Quality

- No open critical/high defects.
- Medium defects have owner, workaround, and target release.
- Crash-free beta sessions >99.5%.
- Critical E2E suite passes against production-like staging.
- Supported devices/browsers pass smoke test.

### Security/privacy

- Permission suite passes.
- Threat-model high risks mitigated or formally accepted by named owner.
- Independent review completed if budget permits; at minimum, a non-author security review occurs.
- Privacy notice and terms approved.
- Export, revocation, and deletion work.
- No private record contents appear in logs/analytics.

### Reliability/operations

- Reminder job success >=99% in beta.
- Failed-job alert/retry tested.
- Backup restore completed successfully.
- Monitoring, on-call contact, support inbox, status procedure, and rollback runbook ready.
- Store reviewer demo accounts and notes work.

### Market

- 3 pilot clinics active.
- 100-owner acquisition plan is scheduled.
- Clinic onboarding material and named champions ready.
- Support capacity matches rollout size.
- Launch remains geographically controlled.

### Do not release if

- A user can access another pet without permission.
- A non-veterinarian can create a veterinarian-authored/verified record.
- Revoked access continues through API, file URL, cache, or export.
- Professional correction deletes prior history.
- Reminder generation creates duplicate medication doses.
- Backup restore has not been tested.
- Privacy/terms/support links are missing.
- The app contains placeholder, diagnosis, payment, marketplace, or unfinished ResQ integration.

---

## 17. Definition of Ready

A story may enter development only when:

- User, problem, and expected outcome are named.
- Acceptance criteria cover success, validation, permission, loading, empty, error, and audit behaviour.
- Design is approved or explicitly design-light internal tooling.
- API/data migration is identified.
- Analytics event/payload is defined.
- Security/privacy impact is reviewed.
- Test fixtures and external dependencies are available.
- Story is estimated and small enough for the sprint.

---

## 18. Definition of Done

- Code reviewed.
- Unit/integration/policy tests pass.
- Allowed and denied role cases tested.
- Loading/empty/error/offline states implemented.
- Accessibility checks pass.
- Analytics payload inspected for sensitive data.
- Migration and rollback/corrective path tested.
- Monitoring/logs/support notes updated.
- Acceptance criteria pass in staging.
- Tested on representative physical device/browser.
- Product/QA approves.
- Veterinary advisor approves affected clinical wording/workflow.

---

## 19. Change control

Any proposal to add an MVP feature must include:

- User evidence from interviews/pilot.
- Metric it is expected to improve.
- Engineering/design/QA/operations estimate.
- Privacy/security impact.
- Feature of equal or greater effort removed from MVP.
- Product owner approval in the decision log.

Emergency security, privacy, app-store compliance, and data-integrity work may enter without removing product scope, but the launch date or other scope must then be re-evaluated.

---

## 20. Build-start checklist

### Product and partnerships

- [ ] Product owner named.
- [ ] Veterinary advisor named.
- [ ] Three pilot clinics committed.
- [ ] Owner and clinic interviews complete.
- [ ] Clickable prototype tested.
- [ ] This MVP scope approved and signed off.

### Design

- [ ] Owner activation flow complete.
- [ ] Record source/provenance badge system complete.
- [ ] Sharing/revocation flow complete.
- [ ] Professional portal flow complete.
- [ ] Required error/empty/loading/permission states complete.
- [ ] Design tokens and accessibility rules documented.

### Engineering

- [ ] Stack decision approved.
- [ ] Repository and CI created.
- [ ] Development/staging/production projects created.
- [ ] Data model and migrations reviewed.
- [ ] Permission matrix converted to automated policy tests.
- [ ] OTP provider proof of concept passed.
- [ ] Reminder worker proof of concept passed.
- [ ] Private file upload/download proof of concept passed.
- [ ] Monitoring and error tracking enabled.

### Legal/security/operations

- [ ] Company/controller roles confirmed.
- [ ] Privacy data map completed.
- [ ] Threat model completed.
- [ ] Privacy notice/terms drafted.
- [ ] Professional and clinic verification policy documented.
- [ ] Retention/deletion policy documented.
- [ ] Vendor/processor list documented.
- [ ] Incident/support/backup owners named.

### Distribution

- [ ] Brand/trademark/domain checks underway.
- [ ] Organisation developer accounts opened where possible.
- [ ] Android package ID and Apple bundle ID reserved.
- [ ] At least 12 continuous Android testers recruited if required.
- [ ] Pilot onboarding materials drafted.
- [ ] Store submission scheduled for late November.

---

## 21. Final scope statement

The Furr MVP ships one trustworthy preventive-care loop for Sri Lankan dog and cat owners:

> **Pet profile + vaccination/medication/health records + secure documents + reminders + weight + controlled sharing + veterinarian verification/authorship + minimal clinic/admin operations + privacy/export/deletion.**

Everything else waits.

The team should now perform Sprint 0 discovery/prototype work and start the first ten engineering days in Section 14. The first code milestone is the staging vertical slice: register -> add pet -> view pet, protected by tested ownership policies.
