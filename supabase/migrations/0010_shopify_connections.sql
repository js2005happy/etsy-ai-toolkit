-- Shopify store connections — one OAuth connection per user per shop.
-- Holds the access token needed to push products to the user's own store.

create table if not exists public.shopify_connections (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  shop_domain text not null,
  access_token text not null,
  scopes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shopify_connections_user_shop_key unique (user_id, shop_domain)
);

alter table public.shopify_connections enable row level security;

create policy "users manage own shopify connections"
  on public.shopify_connections for all
  using (auth.uid() = user_id);
