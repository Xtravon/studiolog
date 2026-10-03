# studiolog

Logistics management platform (PRD: `vondoc.md`). Customers choose a service, describe goods,
consult a sales rep, approve a priced shipment plan, pay, and track delivery handled by
LAS Transport Limited. Plan: `IMPLEMENTATION_PLAN.md`.

## Layout

- `web/` — Next.js 16 app (TypeScript, Tailwind v4). SQLite lives at `web/data/studiolog.db`
  (git-ignored, local drive only). Run all commands from `web/`.
- `vondoc.md` — product requirements. `IMPLEMENTATION_PLAN.md` — phased build plan.
- `DESIGN_SYSTEM_PREVIEW.html` — bright golden design-system mock.

## Quickstart (free stack, no subscriptions)

```sh
cd web
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000. Other scripts: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Demo accounts (seeded, change passwords after first sign-in)

| Role | Email | Password |
|---|---|---|
| General admin | admin@studiolog.local | ChangeMe123! |
| Sales rep | sales@studiolog.local | ChangeMe123! |
| Operations | ops@studiolog.local | ChangeMe123! |

Customers sign up at `/sign-up`.

## Customer journey

`/services` → `/shipments/new` (draft, save & resume) → `/consultations` (book phone/video or
callback) → sales builds plan on `/shipments/[id]` → customer approves → `/shipments/[id]/pay`
(test mode) → tracking timeline → delivered/completed → history in `/shipments`, issues in `/support`.

## Notes

- Auth: Better Auth self-hosted, sessions in SQLite. No paid providers.
- Pricing: `charge = max(minimum, base_fee + per_km_rate × distance_km)`, directed at `/admin/pricing`.
- Payments are test-mode; wire Paystack/Flutterwave/Stripe webhooks into `POST /api/payments` to go live.
- Keep the live DB outside OneDrive sync while the app runs (SQLite + live sync can lock).
