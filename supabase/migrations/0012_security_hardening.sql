-- Craftly — security hardening (P0)
-- 1. Atomic quota decrement RPCs (SECURITY DEFINER) — closes the TOCTOU race
--    where concurrent requests could all pass the `credits <= 0` check before
--    any of them wrote back, letting quota go negative / be overspent.
-- 2. Column-level trigger — stops a signed-in user from self-escalating via the
--    client SDK: without this, `profiles` UPDATE policy (auth.uid() = id) lets
--    them write subscription_status / credits_remaining / images_remaining /
--    plan / mcp_api_key etc. directly.
-- Idempotent — safe to re-run.

-- 1. Atomic credit decrement. Returns true only if a row was actually decremented.
create or replace function public.consume_credits(p_user_id uuid, p_amount int)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_target uuid;
  v_rows int;
begin
  if p_amount <= 0 then
    return true;
  end if;

  -- Signed-in callers may only consume their own quota. Service-role callers
  -- (MCP path — no browser session, auth.uid() is null) may target any user
  -- they have already resolved via the x-mcp-key lookup in authenticateRequest.
  if v_uid is not null and v_uid <> p_user_id then
    return false;
  end if;

  v_target := coalesce(v_uid, p_user_id);
  if v_target is null then
    return false;
  end if;

  update public.profiles
  set credits_remaining = credits_remaining - p_amount
  where id = v_target and credits_remaining >= p_amount;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

create or replace function public.consume_image_credits(p_user_id uuid, p_amount int)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_target uuid;
  v_rows int;
begin
  if p_amount <= 0 then
    return true;
  end if;

  if v_uid is not null and v_uid <> p_user_id then
    return false;
  end if;

  v_target := coalesce(v_uid, p_user_id);
  if v_target is null then
    return false;
  end if;

  update public.profiles
  set images_remaining = images_remaining - p_amount
  where id = v_target and images_remaining >= p_amount;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

-- 2. Column-level guard. Runs as SECURITY INVOKER so `current_user` reflects the
--    role actually issuing the UPDATE: elevated roles (service role, the RPC
--    owner) bypass; a plain authenticated user is blocked from touching any
--    quota / plan / subscription / referral column.
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
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.referral_code is distinct from old.referral_code
     or new.referred_by is distinct from old.referred_by then
    raise exception 'Not allowed to modify protected profile columns';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_columns_trigger on public.profiles;
create trigger protect_profile_columns_trigger
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- 3. Lock down who may call the quota RPCs. anon must not be able to invoke a
--    SECURITY DEFINER function (it would let an unauthenticated caller decrement
--    an arbitrary user's quota by guessing a UUID).
revoke execute on function public.consume_credits(uuid, int) from public, anon;
revoke execute on function public.consume_image_credits(uuid, int) from public, anon;
grant execute on function public.consume_credits(uuid, int) to authenticated, service_role;
grant execute on function public.consume_image_credits(uuid, int) to authenticated, service_role;
