-- Wedding 101 — production access hardening
-- Run this in the Supabase SQL editor AFTER schema.sql.
--
-- It replaces the permissive dev policy ("anyone with the anon key") with:
--   "authenticated AND on the family allowlist".
-- After running this, the public anon key ALONE can read/write NOTHING — a valid
-- family login session is required. See SECURITY.md for the full setup.

-- 1) Family allowlist --------------------------------------------------------
create table if not exists public.family_members (
  email text primary key,
  name  text
);
alter table public.family_members enable row level security;
-- Intentionally NO policies on this table: it's only ever read by the
-- security-definer helper below, never directly through the API. That keeps
-- your family's email list unreadable to clients.

-- 👉 Put your family's *login* emails here (lowercase). Edit freely.
insert into public.family_members (email, name) values
  ('you@example.com',    'Big I'),
  ('sister@example.com', 'Small I'),
  ('mum@example.com',    'Mummy'),
  ('dad@example.com',    'Papa')
on conflict (email) do nothing;

-- 2) Helper: is the current user an allowlisted family member? ---------------
create or replace function public.is_family()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.family_members f
    where lower(f.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_family() from public, anon;
grant execute on function public.is_family() to authenticated;

-- 3) Swap the permissive policy for the allowlist policy ---------------------
do $$
declare t text;
begin
  foreach t in array array['users','tasks','activity'] loop
    execute format('drop policy if exists "family_all"       on public.%I', t);
    execute format('drop policy if exists "family_allowlist" on public.%I', t);
    execute format(
      'create policy "family_allowlist" on public.%I
         for all to authenticated
         using (public.is_family())
         with check (public.is_family())', t);
  end loop;
end $$;

-- To roll back to the permissive dev policy, re-run the RLS block in schema.sql.
