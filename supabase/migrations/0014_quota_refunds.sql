-- Craftly — reversible quota reservations
-- Adds the refund half of the existing atomic consume RPCs so generation routes
-- can reserve quota before calling an external AI provider and compensate only
-- when that provider operation throws. Existing migrations remain untouched.
--
-- SECURITY: refund RPCs intentionally cannot be executed by anon or
-- authenticated users. They are compensation primitives, not user actions, and
-- are called only through Craftly's server-side service-role client.

create or replace function public.refund_credits(p_user_id uuid, p_amount int)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
  v_rows int;
begin
  if p_user_id is null or p_amount <= 0 then
    return false;
  end if;

  update public.profiles
  set credits_remaining = credits_remaining + p_amount
  where id = p_user_id;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

create or replace function public.refund_image_credits(p_user_id uuid, p_amount int)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
  v_rows int;
begin
  if p_user_id is null or p_amount <= 0 then
    return false;
  end if;

  update public.profiles
  set images_remaining = images_remaining + p_amount
  where id = p_user_id;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

revoke execute on function public.refund_credits(uuid, int) from public, anon, authenticated;
revoke execute on function public.refund_image_credits(uuid, int) from public, anon, authenticated;
grant execute on function public.refund_credits(uuid, int) to service_role;
grant execute on function public.refund_image_credits(uuid, int) to service_role;
