-- Wedding 101 · Neon (Postgres) schema
-- Run this once against your Neon database (Neon dashboard → SQL Editor, or psql).
-- Access control is handled by the API (shared family passcode + signed cookie),
-- so there is no row-level security here — the database is only ever reached
-- through the serverless backend, never the browser.

create table if not exists users (
  id          text primary key,
  name        text not null,
  role        text,
  emoji       text,
  color       text,
  last_active timestamptz default now()
);

create table if not exists tasks (
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
  shopping       boolean default false,
  for_whom       text,
  target_month   text,
  shopping_list  boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  completed_at   timestamptz
);

-- Upgrading an existing project? Safe to re-run. (The app also self-migrates
-- these on first task save, so a manual run is optional.)
alter table tasks add column if not exists shopping boolean default false;
alter table tasks add column if not exists for_whom text;
alter table tasks add column if not exists target_month text;

create table if not exists activity (
  id         text primary key,
  user_id    text,
  verb       text,
  summary    text,
  event_key  text,
  created_at timestamptz default now()
);

-- Shared wedding settings (date + events). Single row, id = 'app', so the whole
-- family sees the same setup instead of each device running the wizard again.
create table if not exists app_settings (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz default now()
);

-- Vendors / guests / documents — each item stored as a row, tagged with its
-- kind, so these sync across the family like tasks do.
create table if not exists collections (
  id         text primary key,
  kind       text not null, -- 'vendors' | 'guests' | 'documents'
  data       jsonb not null,
  created_at timestamptz default now()
);
create index if not exists collections_kind_idx on collections (kind);

create index if not exists tasks_event_idx   on tasks (event_key);
create index if not exists activity_time_idx on activity (created_at desc);
