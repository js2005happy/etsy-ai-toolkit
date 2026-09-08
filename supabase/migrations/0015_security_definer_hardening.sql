-- Craftly — harden privileged trigger/event-trigger functions without changing behavior.

-- Trigger and event-trigger functions are invoked by PostgreSQL itself and do
-- not need to be callable through the Data API by anonymous or signed-in users.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- This trigger function references no unqualified database objects, so an empty
-- search_path removes role-dependent resolution without changing its logic.
alter function public.protect_profile_columns() set search_path = '';
