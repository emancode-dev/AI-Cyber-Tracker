-- Day 11–12: initial relational schema for AI Cyber Tracker.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.websites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  url text not null,
  domain text not null,
  authorization_confirmed boolean not null default false,
  authorization_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint websites_user_url_unique unique (user_id, url),
  constraint websites_authorization_timestamp_check check (
    (authorization_confirmed = false and authorization_confirmed_at is null)
    or (authorization_confirmed = true and authorization_confirmed_at is not null)
  )
);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'scanning', 'waiting_for_answers', 'analyzing', 'completed', 'failed')),
  score smallint check (score between 0 and 100),
  risk_level text check (risk_level in ('low', 'medium', 'high')),
  error_message text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '48 hours'),
  completed_at timestamptz
);

create table if not exists public.findings (
  id bigint generated always as identity primary key,
  scan_id uuid not null references public.scans(id) on delete cascade,
  code text not null,
  category text not null,
  severity text not null check (severity in ('info', 'low', 'medium', 'high')),
  evidence_summary text not null,
  status text not null check (status in ('passed', 'needs_attention', 'manual_review', 'observed')),
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  finding_type text not null check (finding_type in ('configuration', 'observation', 'manual_review')),
  created_at timestamptz not null default now(),
  constraint findings_scan_code_unique unique (scan_id, code)
);

create index if not exists websites_user_id_idx on public.websites(user_id);
create index if not exists scans_website_created_idx on public.scans(website_id, created_at desc);
create index if not exists scans_expires_at_idx on public.scans(expires_at);
create index if not exists findings_scan_id_idx on public.findings(scan_id);
create index if not exists findings_category_idx on public.findings(category);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists websites_set_updated_at on public.websites;
create trigger websites_set_updated_at before update on public.websites for each row execute function public.set_updated_at();
