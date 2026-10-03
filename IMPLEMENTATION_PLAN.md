# StudioLog Implementation Plan

Source: `vondoc.md` v1.2 (Product draft). Two user groups: Customer, Admin (roles: General Admin, Sales Representative / Consultant, Operations).

## Stack (confirmed)

- Web app + SQLite on local drive. No hosted database subscription.
- Example: Next.js + Prisma (SQLite provider) or better-sqlite3, DB file at `./data/studiolog.db` (local drive, backed up by user). Auth: Better Auth self-hosted (free, no subscription) with email/password + sessions stored in the local SQLite DB; social login only via free OAuth keys you own (optional, Google/GitHub). Paystack/Flutterwave/Stripe (test mode first), meeting links (Google Meet/Zoom stored on consultation).
- Phases below hold regardless of framework choice. If you later outgrow SQLite (multi-user concurrent writes), migrate the Prisma schema to Postgres with no model changes.
- Local-drive rules: keep `data/*.db*` out of git, enable WAL mode + nightly file backup, store photo uploads in `./data/uploads/` (also git-ignored).

## Data Model (built incrementally)

- `User(id, group: customer|admin, admin_role: general|sales_rep|operations|null)`
- `Service(id, name, description, includes, active)`
- `Company(id, name, is_primary, contact, active)` — seed LAS Transport Limited as primary, locked.
- `Shipment(id, customer_id, service_id, company_id, goods_desc, qty, dims/weight, photos, handling_notes, pickup_addr, delivery_addr, pickup_time_pref, status, distance_km, charge, total, timing_estimate)`
  - Status: `draft → confirmed → pickup_scheduled → collected → in_transit → near_destination → delivered → completed`
- `PricingConfig(id, per_km_rate, base_fee, minimum_charge, currency, updated_by, updated_at)`
- `Consultation(id, shipment_id, sales_rep_id, mode: phone|video, scheduled_at, meeting_link/phone, note, status: booked|done|cancelled|no_show, callback_requested)`
- `ShipmentPlan(id, shipment_id, version, service/goods/company/distance/charge/total/timing/conditions snapshot, handler_statement="Handled by LAS Transport Limited", status: pending|approved|correction_requested, created_by)`
- `Payment(id, shipment_id, plan_id/version, amount, provider_ref, status: pending|success|failed)`
- `TrackingEvent(id, shipment_id, milestone, message_plain, action_required, created_by, created_at)`
- `Notification(id, user_id, type, body, sent_at)`

## Phase 0 — Foundation

Goal: auth, roles, project skeleton.
- Project setup, DB migrations, CI.
- Better Auth self-hosted (free): email/password, sessions in local SQLite (Better Auth `user`/`session`/`account`/`verification` tables), `group` + `admin_role` RBAC; route guards. No paid auth provider (no Clerk/Auth0/paid SMTP — use free local/dev mail or your own free SMTP for verification mails).
- Seed: LAS Transport Limited (primary), one General Admin account.
- Acceptance: can log in as customer and as each admin role; unauthorized routes blocked.

## Phase 1 — Service Catalog + Shipment Intake (PRD 6.1, 6.2)

- Browse/select services; show LAS primary + admin-added companies.
- Goods form: description, quantity, dims/weight, photos, handling needs, pickup/delivery, timing preference.
- Save-and-resume drafts; edit selection before plan approval.
- Screens: service list, service detail, company picker, shipment draft form, draft list.
- Acceptance: draft saved, resumed, edited; LAS handler notice visible.

## Phase 2 — Admin Management + Distance Pricing (PRD 6.3, 6.6)

- General Admin CRUD: services, companies (LAS locked primary), `PricingConfig` (per-km rate, base fee, minimum, currency).
- Distance: v1 haversine from geocoded addresses or manual km entry by sales rep; upgrade to Maps Distance API later.
- Price preview: `charge = max(minimum, base_fee + per_km_rate * distance_km)`; show distance + breakdown on plan.
- Rule: approved plans are immutable snapshots; rate changes affect only new/pending versions.
- Acceptance: rate change reprices drafts correctly; approved plans unchanged.

## Phase 3 — Consultation Booking (PRD 6.4)

- Slots, phone/video choice, help-note, confirmation + reminders, reschedule/cancel with stated rules, callback request when no slot works.
- Sales-rep view: customer service selection + shipment details before the call.
- Endpoints: slots list, book, reschedule, cancel, callback request.
- Acceptance: full book → confirm → remind → reschedule → cancel → callback cycle works.

## Phase 4 — Shipment Plan + Approval Versioning (PRD 6.5 + core rules)

- Sales rep builds versioned `ShipmentPlan`: service, company, goods, LAS-handles-goods statement, distance, charge/total, timing, conditions.
- Customer: approve or request corrections; any detail/price change creates a new version requiring re-approval.
- Acceptance: only one approved version payable; edits always produce a new pending version.

## Phase 5 — Payment (PRD 6.7)

- Gate: approved plan required before pay. Success → booking confirmed. Failure → plain-language next step, retry, support contact.
- Provider in test mode first; idempotent webhooks; receipts.
- Acceptance: no payment without approval; failed payments recoverable; double-charge prevented.

## Phase 6 — Tracking + Completion/History (PRD 6.8, 6.9)

- Operations posts milestones: Booking confirmed, Pickup scheduled, Goods collected by LAS, In transit, Near destination, Delivered, Completed.
- Customer view: current status, timeline, latest update, action-required flag; notifications on milestone/timing/action changes in plain language.
- Completion: delivery confirmation, completion date, final details snapshot, report-issue, support contact, shipment history list.
- Acceptance: shipment runs end-to-end with visible, timestamped updates.

## Phase 7 — Hardening + Success Measures (PRD 9)

- Validation, audit log (who changed plan/price/status), analytics events: request completion, consult attendance, consult→approve, approve→pay, time-to-book, delivery rate, update timeliness, satisfaction, support volume by topic.
- UAT against customer journey §5; support flow for service choice, price, handling, tracking.
- Acceptance: every §9 metric is measurable; core rules enforced by tests.

## Build Order and Risks

Order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7. Each phase demoable.
- Biggest rework risk: payment before plan versioning is solid — do Phase 4 first.
- Pricing risk: lock the `PricingConfig` formula early; distance-source swap (manual → Maps API) must not change the formula interface.
- Role risk: RBAC matrix (general vs sales_rep vs operations) must be tested before consultations go live.
