-- Canonical multichannel Product Hub.
-- A product is stored once, then adapted into one or more channel listings.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text,
  product_type text,
  brand text,
  material text,
  style text,
  sku text,
  price numeric(12,2),
  currency text not null default 'USD',
  inventory_quantity integer,
  tags jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  facts jsonb not null default '{}'::jsonb,
  shipping jsonb not null default '{}'::jsonb,
  compliance jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','ready','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_inventory_nonnegative check (inventory_quantity is null or inventory_quantity >= 0),
  constraint products_price_nonnegative check (price is null or price >= 0)
);

create unique index if not exists products_user_sku_unique
  on public.products(user_id, sku)
  where sku is not null and length(trim(sku)) > 0;
create index if not exists products_user_updated_idx on public.products(user_id, updated_at desc);
create index if not exists products_user_status_idx on public.products(user_id, status);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  sku text,
  options jsonb not null default '{}'::jsonb,
  price numeric(12,2),
  compare_at_price numeric(12,2),
  currency text,
  inventory_quantity integer,
  barcode text,
  weight_grams integer,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_inventory_nonnegative check (inventory_quantity is null or inventory_quantity >= 0),
  constraint product_variants_price_nonnegative check (price is null or price >= 0),
  constraint product_variants_compare_price_nonnegative check (compare_at_price is null or compare_at_price >= 0),
  constraint product_variants_weight_nonnegative check (weight_grams is null or weight_grams >= 0)
);

create unique index if not exists product_variants_user_sku_unique
  on public.product_variants(user_id, sku)
  where sku is not null and length(trim(sku)) > 0;
create index if not exists product_variants_product_idx on public.product_variants(product_id);

create table if not exists public.platform_listings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('etsy','shopify','woocommerce','amazon','ebay','tiktok','walmart','google')),
  external_id text,
  external_url text,
  title text not null,
  description text not null default '',
  bullets jsonb not null default '[]'::jsonb,
  keywords jsonb not null default '[]'::jsonb,
  attributes jsonb not null default '{}'::jsonb,
  price numeric(12,2),
  currency text,
  inventory_quantity integer,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','active','paused','archived','error')),
  sync_status text not null default 'local' check (sync_status in ('local','pending','synced','error')),
  last_error text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_listings_inventory_nonnegative check (inventory_quantity is null or inventory_quantity >= 0),
  constraint platform_listings_price_nonnegative check (price is null or price >= 0)
);

create unique index if not exists platform_listings_product_platform_unique
  on public.platform_listings(product_id, platform);
create index if not exists platform_listings_user_platform_idx
  on public.platform_listings(user_id, platform, updated_at desc);
create index if not exists platform_listings_external_idx
  on public.platform_listings(platform, external_id)
  where external_id is not null;

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.platform_listings enable row level security;

create policy "products_select_own" on public.products
  for select using (auth.uid() = user_id);
create policy "products_insert_own" on public.products
  for insert with check (auth.uid() = user_id);
create policy "products_update_own" on public.products
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "products_delete_own" on public.products
  for delete using (auth.uid() = user_id);

create policy "product_variants_select_own" on public.product_variants
  for select using (auth.uid() = user_id);
create policy "product_variants_insert_own" on public.product_variants
  for insert with check (
    auth.uid() = user_id and exists (
      select 1 from public.products p where p.id = product_id and p.user_id = auth.uid()
    )
  );
create policy "product_variants_update_own" on public.product_variants
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "product_variants_delete_own" on public.product_variants
  for delete using (auth.uid() = user_id);

create policy "platform_listings_select_own" on public.platform_listings
  for select using (auth.uid() = user_id);
create policy "platform_listings_insert_own" on public.platform_listings
  for insert with check (
    auth.uid() = user_id and exists (
      select 1 from public.products p where p.id = product_id and p.user_id = auth.uid()
    )
  );
create policy "platform_listings_update_own" on public.platform_listings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "platform_listings_delete_own" on public.platform_listings
  for delete using (auth.uid() = user_id);
