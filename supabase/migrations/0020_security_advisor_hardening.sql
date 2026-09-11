-- Security advisor hardening discovered during pre-release review.
-- Quota reservations/refunds are server-only application operations. Keep the
-- SQL own-user guards as defense in depth, but remove direct browser execution.

revoke execute on function public.consume_credits(uuid, integer) from public, anon, authenticated;
revoke execute on function public.consume_image_credits(uuid, integer) from public, anon, authenticated;
grant execute on function public.consume_credits(uuid, integer) to service_role;
grant execute on function public.consume_image_credits(uuid, integer) to service_role;

-- Keep the profile protection trigger deterministic and remove the mutable
-- search_path advisor finding.
alter function public.protect_profile_columns() set search_path = public;
