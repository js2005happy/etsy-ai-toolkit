-- Craftly — reversible quota reservations
-- Adds the refund half of the existing atomic consume RPCs so generation routes
-- can reserve quota before calling an external AI provider and compensate only
-- when that provider operation throws. Existing migrations remain untouched.

create or replace function public.refund_credits(p_user_id uuid, p_amount int)
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
  set credits_remaining = credits_remaining + p_amount
  where id = v_target;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

create or replace function public.refund_image_credits(p_user_id uuid, p_amount int)
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
  set images_remaining = images_remaining + p_amount
  where id = v_target;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

revoke execute on function public.refund_credits(uuid, int) from public, anon;
revoke execute on function public.refund_image_credits(uuid, int) from public, anon;
grant execute on function public.refund_credits(uuid, int) to authenticated, service_role;
grant execute on function public.refund_image_credits(uuid, int) to authenticated, service_role;
