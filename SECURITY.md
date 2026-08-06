# 🔒 Securing Wedding 101 for family-only access

Goal: when deployed, **only your family can open the dashboard and see the data** — no one else,
even if they find the URL.

## The threat model (read this first)

- **Local mode** (no Supabase configured): data lives in each browser's `localStorage`. It's private to
  that device by nature — but it is **not shared** between family members. Fine for one device; not a
  family tool.
- **Cloud mode** (Supabase): data is shared across devices via Supabase. Two things are public and
  cannot be hidden:
  1. the **deployed URL**, and
  2. the **anon API key**, which is bundled into the front-end JS (this is by design).

  So a client-only gate (a password checked in JavaScript, hiding a page) is **not enough** — anyone
  could call the Supabase REST API directly with the anon key. **The data must be protected at the
  database layer** with Row-Level Security tied to authenticated, allowlisted users.

**Conclusion:** the only robust design is *real authentication* (Supabase Auth) + *allowlisted family
members* + *strict RLS*. Everything else (edge gates, host passwords) is optional defence-in-depth on
top of that — never a replacement for RLS.

---

## Recommended: Supabase Auth + allowlist + strict RLS

This gates **both** the app (login screen) and the data (RLS), with one mechanism.

### 1. Turn on authentication (invite-only)

In the Supabase dashboard → **Authentication**:

- **Easiest — Magic link, invite only:** Providers → Email → enable. Then **disable public sign-ups**
  (Authentication → Providers → Email → turn *off* "Allow new users to sign up"). Add each family member
  via **Authentication → Users → Add user → Send invite** (their email). Only invited emails can ever log
  in, so *every authenticated user is family*.
- **Or Google/OAuth:** enable the provider. Anyone with a Google account could sign in, so you **must**
  also enforce the email allowlist below.

### 2. Allowlist your family (belt-and-suspenders)

Even with invite-only, an explicit allowlist makes intent obvious and is required if you use an open
provider like Google. Store the emails in a table and check it in RLS.

### 3. Lock down the database (RLS)

Run [`supabase/policies-prod.sql`](supabase/policies-prod.sql) in the SQL editor **after** `schema.sql`.
It replaces the permissive dev policy with "authenticated **and** on the family allowlist". After this,
the public anon key alone can read/write **nothing** — a valid family session is required.

### 4. The login gate (already built in)

The app already enforces this: whenever cloud sync is configured (`VITE_SUPABASE_*` set) and there's no
session, it shows a **family sign-in screen** (magic-link email or Google) before the dashboard — and
before setup. Local mode stays gate-free (it's already device-private). On sign-in it also calls
`is_family()` and refuses anyone not on the allowlist with a clear message. The profile picker still
appears *after* sign-in, so you can act as any family member. "Sign out" lives in the top-right profile
menu.

No code changes needed — just do steps 1–3 and 5.

### 5. Deploy

Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in the host's env vars and deploy `dist/`.
The anon key being public is expected — RLS is what protects you.

---

## Optional extra layer: gate the whole site at the edge

Nice for "not even the login page is visible to strangers", but **does not** replace RLS (it doesn't
protect the Supabase API origin).

- **Cloudflare Access (Zero Trust)** — free for small teams. Put the site behind it; require Google or
  one-time-PIN email; allowlist your family's emails. Strangers can't even load the page.
- **Host password** — Vercel (Password Protection) or Netlify (Visitor access / Basic Auth) put a single
  shared password in front of the site. Simple, coarse, still needs RLS for the data.

---

## What NOT to rely on

- ❌ A password checked in front-end JavaScript, or "hiding" the profile screen — the anon key still
  works against the API.
- ❌ Keeping the URL secret ("security through obscurity").
- ❌ The profile picker (Big I / Mummy / …) — it's a display identity, not a login.

---

## Checklist

- [ ] Supabase Auth enabled; public sign-ups **off**; family invited (or allowlist enforced for OAuth).
- [ ] `supabase/policies-prod.sql` run — anon key alone can't read/write.
- [ ] Verified: open the deployed URL in a private window with no session → you get the login screen and
      the API returns nothing.
- [ ] (Optional) Cloudflare Access / host password in front of the site.
- [ ] Env vars set on the host; `dist/` deployed.
