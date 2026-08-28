-- Etsy AI Toolkit — Stripe subscription integration
-- Run in the Supabase SQL Editor, or via `supabase db push`.

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists plan text not null default 'free';
