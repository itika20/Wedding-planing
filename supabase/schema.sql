-- Wedding 101 · Wedding Dashboard — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- It creates the tables, permissive policies for a private family app, and
-- enables realtime so every device updates live.
--
-- Expenses are NOT a separate table: each task (and its subtasks, stored in the
-- `checklist` jsonb) carries optional `budgeted` / `actual` amounts, which the
-- app rolls up per event and overall. See src/lib/expenses.ts.

-- ---------- tables ----------
create table if not exists public.users (
  id          text primary key,
  name        text not null,
  role        text,
  emoji       text,
  color       text,
  last_active timestamptz default now()
);

create table if not exists public.tasks (
  id             text primary key,
  event_key      text not null,
  title          text not null,
  description    text default '',
  assigned_to    text,
  created_by     text,
  priority       text default 'medium',
  status         text default 'todo',
  due_date       date,
  completion_pct int default 0,
  checklist      jsonb default '[]'::jsonb,
  budgeted       numeric default 0,
  actual         numeric default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  completed_at   timestamptz
);

-- Upgrading an existing project? These are safe to re-run.
alter table public.tasks add column if not exists budgeted numeric default 0;
alter table public.tasks add column if not exists actual   numeric default 0;

create table if not exists public.activity (
  id         text primary key,
  user_id    text,
  verb       text,
  summary    text,
  event_key  text,
  created_at timestamptz default now()
);

-- ---------- indexes ----------
create index if not exists tasks_event_idx    on public.tasks (event_key);
create index if not exists activity_time_idx  on public.activity (created_at desc);

-- ---------- row level security ----------
-- This is a private, password-less family tool. These policies allow the
-- anon key full access. If you ever make the URL public, tighten these.
alter table public.users    enable row level security;
alter table public.tasks    enable row level security;
alter table public.activity enable row level security;

do $$
declare t text;
begin
  foreach t in array array['users','tasks','activity'] loop
    execute format('drop policy if exists "family_all" on public.%I', t);
    execute format(
      'create policy "family_all" on public.%I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ---------- realtime ----------
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.activity;
