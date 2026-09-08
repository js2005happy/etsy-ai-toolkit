-- Craftly — align profiles.subscription_status with the current pricing model.
--
-- Production still carried a legacy CHECK constraint that accepted only
-- free/pro/canceled. The application now persists Free/Basic/Pro/Scale tiers,
-- while `active`/`trialing` remain readable legacy values in lib/auth.ts.
-- This migration only widens the allowed values; it does not rewrite users.

alter table public.profiles
  drop constraint if exists profiles_subscription_status_check;

alter table public.profiles
  add constraint profiles_subscription_status_check
  check (
    subscription_status in (
      'free',
      'basic',
      'pro',
      'scale',
      'canceled',
      'active',
      'trialing'
    )
  );
