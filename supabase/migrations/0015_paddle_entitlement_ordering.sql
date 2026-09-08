-- Craftly — protect Paddle entitlements from out-of-order webhook delivery.
-- Paddle does not guarantee webhook delivery order, so keep the timestamp of the
-- newest entitlement-changing event applied to each profile. The application
-- only applies an older event when this value is null or strictly older.

alter table public.profiles
  add column if not exists paddle_entitlement_event_at timestamptz;

-- Extend the existing protected-column guard so a signed-in user cannot move
-- the ordering marker forward/backward through the client SDK. Only trusted
-- server-side roles may update it as part of Paddle webhook processing.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if new.subscription_status is distinct from old.subscription_status
     or new.credits_remaining is distinct from old.credits_remaining
     or new.images_remaining is distinct from old.images_remaining
     or new.plan is distinct from old.plan
     or new.mcp_api_key is distinct from old.mcp_api_key
     or new.paddle_customer_id is distinct from old.paddle_customer_id
     or new.paddle_subscription_id is distinct from old.paddle_subscription_id
     or new.paddle_entitlement_event_at is distinct from old.paddle_entitlement_event_at
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.referral_code is distinct from old.referral_code
     or new.referred_by is distinct from old.referred_by then
    raise exception 'Not allowed to modify protected profile columns';
  end if;

  return new;
end;
$$;
