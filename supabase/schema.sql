-- Shubh Vivah · Wedding Dashboard — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- It creates the tables, permissive policies for a private family app, and
-- enables realtime so every device updates live.

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
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  completed_at   timestamptz
);

create table if not exists public.expenses (
  id             text primary key,
  event_key      text not null,
  name           text not null,
  category       text,
  vendor         text default '',
  amount         numeric default 0,
  paid           numeric default 0,
  payment_status text default 'unpaid',
  payment_method text default 'UPI',
  date           date,
  notes          text default '',
  created_by     text,
  created_at     timestamptz default now()
);

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
create index if not exists expenses_event_idx on public.expenses (event_key);
create index if not exists activity_time_idx  on public.activity (created_at desc);

-- ---------- row level security ----------
-- This is a private, password-less family tool. These policies allow the
-- anon key full access. If you ever make the URL public, tighten these.
alter table public.users    enable row level security;
alter table public.tasks    enable row level security;
alter table public.expenses enable row level security;
alter table public.activity enable row level security;

do $$
declare t text;
begin
  foreach t in array array['users','tasks','expenses','activity'] loop
    execute format('drop policy if exists "family_all" on public.%I', t);
    execute format(
      'create policy "family_all" on public.%I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ---------- realtime ----------
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.activity;
