-- Etsy AI Toolkit — brand voice preferences
-- Two free-text columns on `profiles` so each user can shape the AI's on-brand
-- output (tone + keywords) from /account. Read lazily by the generation routes.
-- Idempotent — safe to re-run.

alter table public.profiles
  add column if not exists brand_tone text,
  add column if not exists brand_keywords text;
