# StudioLog Implementation Plan

Source: `vondoc.md` v1.2 (Product draft). Two user groups: Customer, Admin (roles: General Admin, Sales Representative / Consultant, Operations).

## Stack — free and effective (locked)

Zero monthly cost. Everything below is free/open-source or free-tier with no subscription. Local-first; migratable to hosted later without data-model changes.

| Layer | Choice (free) | Why effective | Replaces (paid) |
|---|---|---|---|
| App framework | Next.js App Router + TypeScript (open source) | One codebase for UI + API routes; huge ecosystem | Paid app builders, separate backend hosting |
| Database | SQLite file on local drive via Prisma ORM, `./data/studiolog.db`, WAL mode | Zero-cost, zero-admin, works offline; Prisma migrates to Postgres later unchanged | Neon/Supabase/PlanetScale subscriptions |
| Auth | Better Auth self-hosted (open source), email/password, sessions in local SQLite (`user`/`session`/`account`/`verification`) | Full control, no per-user fees | Clerk/Auth0/Stytch |
| UI | Tailwind CSS + shadcn/ui (open source) | Fast, accessible components you own | Paid UI kits/templates |
| Validation | Zod (open source) | Shared client/server schemas, fewer bugs | — |
| Email/notifications | In-app notifications first; email via Nodemailer + your own free SMTP (Gmail free / Brevo free 300/day); Mailpit for local dev | No mail subscription; verification/booking/milestone mails work free | Resend/SendGrid paid tiers |
| File uploads | Local filesystem `./data/uploads/` + Sharp for resize/compress (open source) | No S3/CDN bill at v1; photos stay on your drive | AWS S3/Cloudinary |
| Distance/pricing | v1: manual km entry by sales rep + haversine fallback; geocode via free Nominatim (OpenStreetMap, no key) with DB caching | No maps bill; formula `charge = max(minimum, base_fee + per_km_rate × distance_km)` stays stable | Google Maps Distance Matrix |
| Consultation meetings | Phone call or free video link (Google Meet free / Jitsi free URL stored on consultation) + built-in slot logic | No scheduling subscription | Calendly/Cal.com hosted paid |
| Payments (test first) | Paystack/Flutterwave/Stripe in **test mode** (free) with idempotent webhooks | Build/verify the approve→pay gate for free; go-live later (pay-per-transaction only, no monthly fee) | Paid billing platforms |
| Analytics | Own `events` table + minimal admin dashboard (open source) | Every PRD §9 metric measurable with no tracker bill | PostHog/Mixpanel paid |
| Tests/quality | Vitest + Playwright + ESLint/Prettier (open source), GitHub Actions free minutes | Catches RBAC/pricing regressions free | Paid QA/SaaS CI |
| Hosting (dev) | Local `npm run dev` on your drive | Free; production free-tier (Vercel/Render) only when you decide | Paid hosting now |

- Local-drive rules: git-ignore `data/*.db*`, `data/uploads/`; nightly file copy backup; keep the live DB outside OneDrive sync while the app runs (OneDrive locking can corrupt SQLite) — or pause sync during dev.

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

## Phase 0 — Foundation — DONE (2026-10-03)

App lives in `web/` (Next.js 16 App Router + TypeScript, Tailwind v4).
DB file is `web/data/studiolog.db` (git-ignored, WAL mode). CI: `.github/workflows/ci.yml`.

Goal: auth, roles, project skeleton.
- Scaffold Next.js (TS) + Tailwind + shadcn/ui + Prisma (SQLite) + Zod; GitHub Actions CI; Vitest/Playwright smoke tests.
- Better Auth self-hosted (free): email/password, sessions in local SQLite (Better Auth `user`/`session`/`account`/`verification` tables), `group` + `admin_role` RBAC; route guards. No paid auth provider (no Clerk/Auth0/paid SMTP — Mailpit locally, free Gmail/Brevo SMTP for real mail).
- Seed: LAS Transport Limited (primary), one General Admin account.
- Acceptance: can log in as customer and as each admin role; unauthorized routes blocked.
- Verified: `npm test` 4/4, `tsc --noEmit` clean, `eslint` clean, `next build` clean, seed creates LAS + `admin@studiolog.local`, live sign-in as admin returns a session.

## Phase 1 — Service Catalog + Shipment Intake (PRD 6.1, 6.2) — DONE (2026-10-03)

- Browse/select services; show LAS primary + admin-added companies.
- Goods form: description, quantity, dims/weight, photos, handling needs, pickup/delivery, timing preference. Photos: local `./data/uploads/` + Sharp compress (free, no S3).
- Save-and-resume drafts; edit selection before plan approval.
- Screens: service list, service detail, company picker, shipment draft form, draft list.
- Acceptance: draft saved, resumed, edited; LAS handler notice visible.
- Verified live: customer sign-up → create draft → PATCH → list/get; photo upload + serve 200; intruder read 404; unauth create 401; `npm test` 10/10, `tsc`/`eslint`/`next build` clean.

## Phase 2 — Admin Management + Distance Pricing (PRD 6.3, 6.6) — DONE (2026-10-03)

- General Admin CRUD: services, companies (LAS locked primary), `PricingConfig` (per-km rate, base fee, minimum, currency).
- Distance (free): v1 haversine + manual km override by sales rep; Nominatim (OSM, free, no key) geocoding with cached results in DB; Google Maps API only later if needed.
- Price preview: `charge = max(minimum, base_fee + per_km_rate * distance_km)`; show distance + breakdown on plan.
- Rule: approved plans are immutable snapshots; rate changes affect only new/pending versions.
- Acceptance: rate change reprices drafts correctly; approved plans unchanged.
- Verified live: pricing GET/PATCH (250/km recorded with updatedBy), quote 100 km → ₦30,000; customer blocked from /api/admin/* (403); LAS deactivation blocked (400); `npm test` 16/16, `tsc`/`eslint`/`next build` clean.
- Note: dev-server 404s/stale writes seen twice were corrupt `.next/dev` cache (OneDrive slow FS); fix was `Remove-Item .next` + rebuild. Clear `.next` if routes misbehave.

## Phase 3 — Consultation Booking (PRD 6.4) — DONE (2026-10-03)

- Slots, phone/free-video-link choice (Google Meet free / Jitsi free URL), help-note, confirmation + reminders (in-app + free SMTP mail), reschedule/cancel with stated rules, callback request when no slot works.
- Sales-rep view: customer service selection + shipment details before the call.
- Endpoints: slots list, book, reschedule, cancel, callback request.
- Acceptance: full book → confirm → remind → reschedule → cancel → callback cycle works.
- Shipped: customer book/reschedule/cancel + callback requests; staff desk (sales_rep/general) with shipment context, meeting-link save, done/no-show; terminal-state guards; RBAC tests.
- Verified live: book video → past-time 400 → staff link → done → customer cancel after done 403 → callback 201; `npm test` 23/23, `tsc`/`eslint`/`next build` clean.

## Phase 4 — Shipment Plan + Approval Versioning (PRD 6.5 + core rules) — DONE (2026-10-03)

- Sales rep builds versioned `ShipmentPlan`: service, company, goods, LAS-handles-goods statement, distance, charge/total, timing, conditions.
- Customer: approve or request corrections; any detail/price change creates a new version requiring re-approval.
- Acceptance: only one approved version payable; edits always produce a new pending version.
- Shipped: staff plan builder (snapshot + live pricing + handling fee), customer approve/correction with latest-pending guard (409), supersede chain, full plan card UI.
- Verified live: v1 → correction → v2 (v1 superseded) → approve v2 → approve v1 409 → staff approve 403 → customer build 403; 50 km prices ₦17,000; `npm test` 27/27, `tsc`/`eslint`/`next build` clean.
- Fixed: POST /api/shipments omitted distanceKm/coords (found via totals equal to minimum).

## Phase 5 — Payment (PRD 6.7) — DONE (2026-10-03)

- Gate: approved plan required before pay. Success → booking confirmed. Failure → plain-language next step, retry, support contact.
- Provider in **test mode first (free)** — Paystack/Flutterwave/Stripe; idempotent webhooks; receipts. Go-live later, transaction fees only.
- Acceptance: no payment without approval; failed payments recoverable; double-charge prevented.
- Shipped: test provider (success/decline simulation), deterministic providerRef per plan version, approve-before-pay gate incl. stale-approval block, booking confirmed + receipt UI.
- Verified live: pay pending 409 → decline 402 → retry success + confirmed → double-pay 409 (no double charge); `npm test` 30/30, `tsc`/`eslint`/`next build` clean.
- Fixed: retries returned the failed row instead of resuming it (now failed→success on same row).

## Phase 6 — Tracking + Completion/History (PRD 6.8, 6.9) — DONE (2026-10-03)

- Operations posts milestones: Booking confirmed, Pickup scheduled, Goods collected by LAS, In transit, Near destination, Delivered, Completed.
- Customer view: current status, timeline, latest update, action-required flag; notifications on milestone/timing/action changes in plain language.
- Completion: delivery confirmation, completion date, final details snapshot, report-issue, support contact, shipment history list.
- Acceptance: shipment runs end-to-end with visible, timestamped updates.
- Shipped: forward-only milestone transitions + cancel rules, plain-language defaults, action-required flags, timeline UI, issue report/resolve, delivery/completion banner, history via My shipments.
- Verified live: skip-guard 409 → full walk confirmed→completed (6 events) → issue open→resolved; `npm test` 35/35, `tsc`/`eslint`/`next build` clean.

## Phase 7 — Hardening + Success Measures (PRD 9)

- Validation (Zod), audit log (who changed plan/price/status), own `events` table + admin dashboard for §9 metrics (no paid analytics): request completion, consult attendance, consult→approve, approve→pay, time-to-book, delivery rate, update timeliness, satisfaction, support volume by topic.
- UAT against customer journey §5; support flow for service choice, price, handling, tracking.
- Acceptance: every §9 metric is measurable; core rules enforced by tests.

## Build Order and Risks

Order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7. Each phase demoable.
- Biggest rework risk: payment before plan versioning is solid — do Phase 4 first.
- Pricing risk: lock the `PricingConfig` formula early; distance-source swap (manual → Maps API) must not change the formula interface.
- Role risk: RBAC matrix (general vs sales_rep vs operations) must be tested before consultations go live.
