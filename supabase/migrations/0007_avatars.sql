-- Etsy AI Toolkit — custom avatar upload
-- Public `avatars` bucket + RLS so a signed-in user can upload/update/delete
-- their own file under `{user_id}/...`, and anyone can read.
-- Idempotent — safe to re-run.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars user insert own" on storage.objects;
create policy "avatars user insert own"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars user update own" on storage.objects;
create policy "avatars user update own"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars user delete own" on storage.objects;
create policy "avatars user delete own"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
