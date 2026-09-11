-- Connection metadata for non-Etsy/Shopify channels introduced by Product Hub.
-- Secrets are encrypted in the application layer with COMMERCE_CREDENTIALS_KEY
-- before being stored in credentials_encrypted.

create table if not exists public.commerce_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('woocommerce','ebay','amazon','tiktok','walmart','google')),
  account_label text,
  account_key text not null,
  store_url text,
  credentials_encrypted text not null,
  scopes text[] not null default '{}'::text[],
  token_expires_at timestamptz,
  status text not null default 'active' check (status in ('active','expired','revoked','error')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_connections_user_platform_account unique (user_id, platform, account_key)
);

create index if not exists commerce_connections_user_platform_idx
  on public.commerce_connections(user_id, platform, updated_at desc);

alter table public.commerce_connections enable row level security;

create policy "commerce_connections_select_own" on public.commerce_connections
  for select using (auth.uid() = user_id);
create policy "commerce_connections_insert_own" on public.commerce_connections
  for insert with check (auth.uid() = user_id);
create policy "commerce_connections_update_own" on public.commerce_connections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "commerce_connections_delete_own" on public.commerce_connections
  for delete using (auth.uid() = user_id);

-- Authenticated clients must never be able to read encrypted credentials directly.
-- API routes use the service role for secret-bearing rows and expose only metadata.
revoke select (credentials_encrypted) on public.commerce_connections from authenticated;
