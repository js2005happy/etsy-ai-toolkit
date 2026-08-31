-- Etsy AI Toolkit — self-built referral / affiliate program
-- Every profile gets a `referral_code` (their share link) and a `referred_by`
-- (the code of whoever referred them, captured from a ?ref= cookie at signup).
-- `affiliate_commissions` records the 30% first-month payout when a referred
-- user upgrades to a paid plan. Idempotent — safe to re-run.

alter table public.profiles
  add column if not exists referral_code text;

alter table public.profiles
  add column if not exists referred_by text;

create unique index if not exists profiles_referral_code_idx
  on public.profiles (referral_code)
  where referral_code is not null;

create table if not exists public.affiliate_commissions (
  id bigint generated always as identity primary key,
  affiliate_id uuid not null references public.profiles (id) on delete cascade,
  referred_user_id uuid not null references public.profiles (id) on delete cascade,
  tier text not null,
  amount numeric(10,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'paid',
  created_at timestamptz not null default now(),
  constraint affiliate_commissions_referred_user_id_key unique (referred_user_id)
);

alter table public.affiliate_commissions enable row level security;

create policy "affiliates read own commissions"
  on public.affiliate_commissions for select
  using (auth.uid() = affiliate_id);
