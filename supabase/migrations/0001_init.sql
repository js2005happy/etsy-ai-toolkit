-- Etsy AI Toolkit — initial schema
-- Run in the Supabase SQL Editor, or via `supabase db push`.

-- 1. profiles: one row per user, tracks remaining credits
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  credits_remaining integer not null default 10,
  created_at timestamptz not null default now()
);

-- 2. generations: a log of every AI generation
create table if not exists public.generations (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  tool_type text not null,
  input_data jsonb,
  output_data jsonb,
  created_at timestamptz not null default now()
);

-- 3. Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, credits_remaining)
  values (new.id, 10)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Row Level Security
alter table public.profiles enable row level security;
alter table public.generations enable row level security;

create policy "users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "users read own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "users insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);
