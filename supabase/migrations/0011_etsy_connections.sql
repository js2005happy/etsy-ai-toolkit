-- Etsy shop connections — one OAuth connection per user per shop.
-- Holds the access/refresh tokens needed to push listings to the seller's shop.

create table if not exists public.etsy_connections (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  shop_id bigint not null,
  shop_name text not null,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  scopes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint etsy_connections_user_shop_key unique (user_id, shop_id)
);

alter table public.etsy_connections enable row level security;

create policy "users manage own etsy connections"
  on public.etsy_connections for all
  using (auth.uid() = user_id);
