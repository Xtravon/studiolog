# Deploying studiolog to Netlify (free tiers)

The repo is deploy-ready (`netlify.toml` at root). Local dev stays on SQLite;
production uses Neon Postgres + Netlify Blobs. You do the dashboard side once (~10 min).

## 1. Create the Neon database (free)

1. Sign up at https://neon.tech (free tier, no card).
2. Create a project + database (e.g. `studiolog`).
3. Copy the **pooled** connection string. It looks like:
   `postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/studiolog?sslmode=require`

## 2. Import the site in Netlify

1. Sign in at https://app.netlify.com → **Add new site → Import an existing project**.
2. Connect GitHub if needed → pick **Xtravon/studiolog**.
3. Build settings are read from `netlify.toml` automatically (base `web/`, Next plugin).
4. Before deploying, open **Site settings → Environment variables** and add:
   - `DATABASE_URL` = your Neon pooled connection string
   - `BETTER_AUTH_SECRET` = fresh secret (`openssl rand -hex 32` on any terminal)
   - `BETTER_AUTH_URL` = `https://<your-site>.netlify.app` (use your real site URL)
   - `USE_BLOBS` = `true`
5. **Deploy the site.** The build generates the Postgres client, pushes the schema
   to Neon (`prisma db push`), and builds Next.js.

## 3. Seed production (one command, from your PC)

Create `web/.env.pg` (git-ignored) with the **direct** (non-pooled) Neon URL plus prod values:

```
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/studiolog?sslmode=require"
BETTER_AUTH_SECRET="<same as Netlify>"
ADMIN_EMAIL="admin@studiolog.local"
ADMIN_PASSWORD="<pick a strong password>"
```

Then from `web/`:

```sh
npx prisma db push --schema prisma/schema.postgres.prisma
npm run db:seed:pg
```

Sign in on the live site with the admin email/password above and change it after.

## Notes

- `prisma/schema.postgres.prisma` is generated from `prisma/schema.prisma` — never edit it
  by hand; run `npm run db:schema:pg` after schema changes and commit both files.
- Local dev is unaffected: SQLite + local uploads keep working with plain `npm run dev`.
- Photos on Netlify are stored in Netlify Blobs (free tier included with your site).
