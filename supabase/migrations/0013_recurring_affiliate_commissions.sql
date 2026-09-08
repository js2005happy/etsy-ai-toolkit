-- Craftly — recurring affiliate commissions
--
-- The original referral schema allowed only one commission row per referred
-- user. Recurring affiliate payouts need one row per successful Paddle
-- subscription transaction instead, while preserving legacy first-payment rows.

alter table public.affiliate_commissions
  add column if not exists paddle_transaction_id text;

alter table public.affiliate_commissions
  add column if not exists paddle_subscription_id text;

alter table public.affiliate_commissions
  drop constraint if exists affiliate_commissions_referred_user_id_key;

-- A normal UNIQUE index still allows multiple NULL values in Postgres. That
-- keeps legacy rows valid while giving Supabase upsert a concrete conflict
-- target for every new Paddle transaction.
create unique index if not exists affiliate_commissions_paddle_transaction_idx
  on public.affiliate_commissions (paddle_transaction_id);

create index if not exists affiliate_commissions_referred_user_idx
  on public.affiliate_commissions (referred_user_id);

create index if not exists affiliate_commissions_subscription_idx
  on public.affiliate_commissions (paddle_subscription_id)
  where paddle_subscription_id is not null;
