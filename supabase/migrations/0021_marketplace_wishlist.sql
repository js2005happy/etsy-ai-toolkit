-- Buyer wishlist foundation for Marketplace V1.
-- This is intentionally discovery-only: no cart, checkout, payment, escrow or payout behavior.

create table if not exists public.marketplace_wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storefront_id uuid not null references public.storefronts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint marketplace_wishlist_unique_product unique (user_id, product_id)
);

create index if not exists marketplace_wishlist_user_created_idx
  on public.marketplace_wishlist_items(user_id, created_at desc);

alter table public.marketplace_wishlist_items enable row level security;

create policy "marketplace_wishlist_select_own" on public.marketplace_wishlist_items
  for select using (auth.uid() = user_id);

create policy "marketplace_wishlist_insert_own" on public.marketplace_wishlist_items
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.storefronts s
      where s.id = storefront_id
        and s.is_published = true
    )
    and exists (
      select 1
      from public.products p
      join public.storefronts s on s.id = storefront_id
      where p.id = product_id
        and p.user_id = s.user_id
        and p.status = 'ready'
    )
    and exists (
      select 1
      from public.storefront_products sp
      where sp.storefront_id = storefront_id
        and sp.product_id = product_id
        and sp.is_visible = true
    )
  );

create policy "marketplace_wishlist_delete_own" on public.marketplace_wishlist_items
  for delete using (auth.uid() = user_id);
