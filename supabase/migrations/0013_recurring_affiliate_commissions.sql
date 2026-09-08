-- Craftly — recurring affiliate commissions
--
-- Keep the original affiliate_commissions table unchanged so the currently
-- deployed first-payment flow remains valid while this additive migration is
-- applied. Normal subscription renewals are stored separately and deduplicated
-- by Paddle transaction ID.

create table if not exists public.affiliate_renewal_commissions (
  id bigint generated always as identity primary key,
  affiliate_id uuid not null references public.profiles (id) on delete cascade,
  referred_user_id uuid not null references public.profiles (id) on delete cascade,
  tier text not null,
  amount numeric(10,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'paid',
  paddle_transaction_id text not null unique,
  paddle_subscription_id text,
  created_at timestamptz not null default now()
);

alter table public.affiliate_renewal_commissions enable row level security;

-- Renewal rows are written only by the server-side service role. Signed-in
-- affiliates may read only their own rows; anonymous users have no table access.
revoke all on table public.affiliate_renewal_commissions from anon, authenticated;
grant select on table public.affiliate_renewal_commissions to authenticated;

drop policy if exists "affiliates read own renewal commissions"
  on public.affiliate_renewal_commissions;

create policy "affiliates read own renewal commissions"
  on public.affiliate_renewal_commissions
  for select
  to authenticated
  using ((select auth.uid()) = affiliate_id);

create index if not exists affiliate_renewal_commissions_affiliate_idx
  on public.affiliate_renewal_commissions (affiliate_id);

create index if not exists affiliate_renewal_commissions_referred_user_idx
  on public.affiliate_renewal_commissions (referred_user_id);

create index if not exists affiliate_renewal_commissions_subscription_idx
  on public.affiliate_renewal_commissions (paddle_subscription_id)
  where paddle_subscription_id is not null;
