-- Insight Seeker Database Schema
-- Run this in Supabase SQL Editor

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  monthly_limit integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- API Keys table
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  key_hash text not null,
  prefix text not null, -- first 8 chars for display: "isk_abc1..."
  name text not null default 'Default',
  last_used timestamptz,
  created_at timestamptz not null default now()
);

alter table public.api_keys enable row level security;

create policy "Users can manage own API keys"
  on public.api_keys for all
  using (auth.uid() = user_id);

-- Searches table (research history)
create table public.searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic text not null,
  mode text not null default 'default',
  result_count integer not null default 0,
  sources_used text[] not null default '{}',
  duration_ms integer,
  results_json jsonb,
  markdown_report text,
  created_at timestamptz not null default now()
);

alter table public.searches enable row level security;

create policy "Users can view own searches"
  on public.searches for select
  using (auth.uid() = user_id);

create policy "Service role can insert searches"
  on public.searches for insert
  with check (true);

-- Usage tracking (per user per month)
create table public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  month text not null, -- format: '2026-04'
  search_count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

alter table public.usage enable row level security;

create policy "Users can view own usage"
  on public.usage for select
  using (auth.uid() = user_id);

-- Function to increment usage
create or replace function public.increment_usage(p_user_id uuid)
returns integer as $$
declare
  current_month text := to_char(now(), 'YYYY-MM');
  current_count integer;
begin
  insert into public.usage (user_id, month, search_count)
  values (p_user_id, current_month, 1)
  on conflict (user_id, month)
  do update set search_count = public.usage.search_count + 1, updated_at = now()
  returning search_count into current_count;

  return current_count;
end;
$$ language plpgsql security definer;

-- Function to get current usage
create or replace function public.get_current_usage(p_user_id uuid)
returns integer as $$
declare
  current_month text := to_char(now(), 'YYYY-MM');
  current_count integer;
begin
  select search_count into current_count
  from public.usage
  where user_id = p_user_id and month = current_month;

  return coalesce(current_count, 0);
end;
$$ language plpgsql security definer;

-- Indexes
create index idx_api_keys_key_hash on public.api_keys (key_hash);
create index idx_api_keys_user_id on public.api_keys (user_id);
create index idx_searches_user_id on public.searches (user_id);
create index idx_searches_created_at on public.searches (created_at desc);
create index idx_usage_user_month on public.usage (user_id, month);
