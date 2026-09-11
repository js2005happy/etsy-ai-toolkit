-- Commerce operations foundation: auditable stock/price sync, unified orders,
-- and seller-owned public storefront configuration. No payment escrow is implied.

create table if not exists public.commerce_sync_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  platform_listing_id uuid references public.platform_listings(id) on delete cascade,
  platform text not null check (platform in ('etsy','shopify','woocommerce','amazon','ebay','tiktok','walmart','google')),
  sync_type text not null check (sync_type in ('inventory','price')),
  requested_value jsonb not null,
  previous_value jsonb,
  status text not null default 'pending' check (status in ('pending','success','error','skipped')),
  external_reference text,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists commerce_sync_events_user_created_idx
  on public.commerce_sync_events(user_id, created_at desc);
create index if not exists commerce_sync_events_listing_idx
  on public.commerce_sync_events(platform_listing_id, created_at desc);

create table if not exists public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('etsy','shopify','woocommerce','amazon','ebay','tiktok','walmart','google','craftly')),
  external_order_id text not null,
  external_url text,
  status text not null default 'open',
  financial_status text,
  fulfillment_status text,
  currency text,
  subtotal numeric(12,2),
  shipping_total numeric(12,2),
  tax_total numeric(12,2),
  discount_total numeric(12,2),
  total numeric(12,2),
  buyer_name text,
  buyer_email text,
  ship_to_country text,
  ordered_at timestamptz,
  raw_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_orders_user_platform_external unique (user_id, platform, external_order_id)
);

create index if not exists commerce_orders_user_ordered_idx
  on public.commerce_orders(user_id, ordered_at desc nulls last, created_at desc);
create index if not exists commerce_orders_user_platform_idx
  on public.commerce_orders(user_id, platform, updated_at desc);

create table if not exists public.commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  platform_listing_id uuid references public.platform_listings(id) on delete set null,
  external_line_id text,
  sku text,
  title text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2),
  total numeric(12,2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists commerce_order_items_order_idx on public.commerce_order_items(order_id);
create index if not exists commerce_order_items_user_sku_idx on public.commerce_order_items(user_id, sku);

create table if not exists public.storefronts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  headline text,
  description text,
  logo_url text,
  banner_url text,
  contact_email text,
  currency text not null default 'USD',
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint storefront_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{2,47}$')
);

create table if not exists public.storefront_products (
  storefront_id uuid not null references public.storefronts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (storefront_id, product_id)
);

create index if not exists storefront_products_storefront_sort_idx
  on public.storefront_products(storefront_id, sort_order, created_at);

alter table public.commerce_sync_events enable row level security;
alter table public.commerce_orders enable row level security;
alter table public.commerce_order_items enable row level security;
alter table public.storefronts enable row level security;
alter table public.storefront_products enable row level security;

create policy "commerce_sync_events_select_own" on public.commerce_sync_events for select using (auth.uid() = user_id);
create policy "commerce_sync_events_insert_own" on public.commerce_sync_events for insert with check (auth.uid() = user_id);

create policy "commerce_orders_select_own" on public.commerce_orders for select using (auth.uid() = user_id);
create policy "commerce_orders_insert_own" on public.commerce_orders for insert with check (auth.uid() = user_id);
create policy "commerce_orders_update_own" on public.commerce_orders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "commerce_order_items_select_own" on public.commerce_order_items for select using (auth.uid() = user_id);
create policy "commerce_order_items_insert_own" on public.commerce_order_items for insert with check (auth.uid() = user_id);

create policy "storefronts_select_own" on public.storefronts for select using (auth.uid() = user_id);
create policy "storefronts_insert_own" on public.storefronts for insert with check (auth.uid() = user_id);
create policy "storefronts_update_own" on public.storefronts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "storefronts_delete_own" on public.storefronts for delete using (auth.uid() = user_id);

create policy "storefront_products_select_own" on public.storefront_products for select using (auth.uid() = user_id);
create policy "storefront_products_insert_own" on public.storefront_products for insert with check (
  auth.uid() = user_id
  and exists (select 1 from public.storefronts s where s.id = storefront_id and s.user_id = auth.uid())
  and exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
);
create policy "storefront_products_update_own" on public.storefront_products for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "storefront_products_delete_own" on public.storefront_products for delete using (auth.uid() = user_id);
