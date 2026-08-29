-- Etsy AI Toolkit — 4-tier pricing (Free / Basic / Pro / Scale)
-- `profiles` becomes the single source of truth for access + quota. This
-- replaces the customers/subscriptions mirror tables from 0004 (which never ran
-- in production). Idempotent — safe to re-run.

alter table public.profiles
  add column if not exists subscription_status text not null default 'free',
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text,
  add column if not exists images_remaining integer not null default 0;

create index if not exists profiles_paddle_customer_id_idx
  on public.profiles (paddle_customer_id)
  where paddle_customer_id is not null;
