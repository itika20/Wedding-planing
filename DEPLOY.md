# 🚀 Deploying Wedding 101 (Vercel + Neon)

This guide takes you from the repo to a live, family-only dashboard. The app is a
static frontend **plus a small serverless backend** (in `/api`) that talks to a
**Neon** Postgres database. Access is gated by **one shared family passcode**.

You'll do the clicking (it needs your Neon + Vercel accounts and secrets); the code
is already deploy-ready. Budget ~15 minutes.

> **Already deployed and updating?** Two things to do after pulling the latest code:
> (1) re-run [`neon/schema.sql`](neon/schema.sql) in Neon — it now adds a shared
> `app_settings` table so the wedding date & events sync across everyone; and
> (2) push to GitHub and let Vercel redeploy. You no longer need the `VITE_USE_CLOUD`
> variable (cloud mode is auto-detected) — you can leave or delete it.

> Why this setup: the browser never touches the database — only the `/api` functions
> do, using the Neon **serverless driver over HTTPS**. That also sidesteps the
> IPv4/pooler headaches of a direct Postgres connection.

---

## 1. Create the database (Neon)

1. Sign in at **neon.tech** and create a project (any region near your family).
2. Open the project's **SQL Editor**, paste the contents of
   [`neon/schema.sql`](neon/schema.sql), and run it. This creates the `users`,
   `tasks` and `activity` tables.
3. Go to **Connection Details** and copy the **pooled** connection string
   (the host contains `-pooler`). It looks like:
   `postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require`
   Keep it handy for step 3.

## 2. Put the code on GitHub

It already is: **github.com/itika20/Wedding-planing** (branch `main`). If you fork or
move it, just note the repo — Vercel imports from GitHub.

## 3. Deploy the app (Vercel)

1. Sign in at **vercel.com** → **Add New → Project** → import the repo.
2. Vercel auto-detects **Vite** (build `npm run build`, output `dist`) and picks up the
   `/api` functions. Leave the defaults.
3. Before the first deploy, open **Environment Variables** and add these three
   (Production, and Preview if you want previews to work):

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | your Neon **pooled** connection string from step 1 |
   | `FAMILY_PASSCODE` | the passcode you'll share with the family |
   | `SESSION_SECRET` | a long random string — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

   (Cloud mode turns on automatically once the `/api` backend is live — there's no
   frontend flag to set.)

4. Click **Deploy**. When it finishes you'll get a URL like `wedding-101.vercel.app`.

> Tip: Vercel has a native Neon integration (**Storage → Neon**) that can create the
> database and set `DATABASE_URL` for you. If you use it, you still add the other three
> variables and run `neon/schema.sql` once.

## 4. First run

1. Open the URL. You'll see the **Family access** screen — enter your `FAMILY_PASSCODE`.
2. The setup wizard asks your wedding date and events, then you pick a profile. The four
   profiles are created in the database automatically on first load.
3. Share the **URL + passcode** with your family. Everyone signs in with the same
   passcode; the profile they pick just tags who did what.

## Everyday notes

- **Change the passcode:** edit `FAMILY_PASSCODE` in Vercel → redeploy. (Everyone stays
  signed in until their 30-day cookie expires; changing `SESSION_SECRET` signs everyone
  out immediately.)
- **Sign out:** top-right profile menu → **Sign out**.
- **Cross-device updates:** the app refetches when a tab regains focus and every ~30s, so
  changes from another family member appear within a few seconds.
- **Local development is unchanged:** with no env vars, `npm run dev` runs fully local
  (data in your browser, no passcode). Cloud mode only turns on when `VITE_USE_CLOUD=1`.

## Security

- The Neon connection string lives only in the backend env vars — it is never sent to the
  browser.
- The passcode is checked server-side; a correct one mints a signed, `HttpOnly` cookie, and
  every data request verifies it. There's no way to read or write data without it.
- Keep the URL and passcode within the family. If a passcode leaks, change it (above).
