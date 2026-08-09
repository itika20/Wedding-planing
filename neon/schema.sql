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
  shopping_list  boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  completed_at   timestamptz
);

create table if not exists activity (
  id         text primary key,
  user_id    text,
  verb       text,
  summary    text,
  event_key  text,
  created_at timestamptz default now()
);

create index if not exists tasks_event_idx   on tasks (event_key);
create index if not exists activity_time_idx on activity (created_at desc);
