-- Etsy AI Toolkit — image quota gradient
-- New image quotas per tier: Free 3 / Basic 20 / Pro 60 / Scale 300 (see
-- lib/pricing.ts). Image access is quota-driven (lib/auth.ts:
-- hasImageAccess = images_remaining > 0). Free's 3-image allotment is the
-- lead-gen trial. This migration seeds the new gradient for existing rows.
--
-- Idempotent — safe to re-run.

-- 1. New signups start with 3 image credits.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, credits_remaining, images_remaining)
  values (new.id, 10, 3)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Backfill existing Free users (and pre-tier legacy rows) up to 3 images.
update public.profiles
set images_remaining = 3
where images_remaining < 3
  and (subscription_status = 'free' or subscription_status is null);

-- 3. Backfill existing paid subscribers up to their new quotas.
-- 'active'/'trialing' are legacy Paddle statuses mapped to Pro (lib/auth.ts).
update public.profiles
set images_remaining = 20
where subscription_status = 'basic' and images_remaining < 20;

update public.profiles
set images_remaining = 60
where subscription_status in ('pro', 'active', 'trialing') and images_remaining < 60;

update public.profiles
set images_remaining = 300
where subscription_status = 'scale' and images_remaining < 300;
