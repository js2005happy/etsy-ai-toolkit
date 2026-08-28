-- Etsy AI Toolkit — Paddle subscription integration
-- Replaces Stripe. Run in the Supabase SQL Editor, or via `supabase db push`.

alter table public.profiles
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text;

-- `plan` already exists from 0002_stripe.sql; keep it as the source of truth
-- for the frontend (free | pro).
