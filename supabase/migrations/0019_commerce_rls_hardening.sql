-- Tighten ownership invariants for commerce child rows.
-- RLS must protect both user_id and referenced parent ids so an authenticated
-- client cannot attach its own row to another user's product/order/storefront
-- even if a UUID is guessed or leaked.

-- Product variants ----------------------------------------------------------
drop policy if exists "product_variants_update_own" on public.product_variants;
create policy "product_variants_update_own" on public.product_variants
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.user_id = auth.uid()
    )
  );

-- Platform listings ---------------------------------------------------------
drop policy if exists "platform_listings_update_own" on public.platform_listings;
create policy "platform_listings_update_own" on public.platform_listings
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.user_id = auth.uid()
    )
  );

-- Sync audit events ---------------------------------------------------------
drop policy if exists "commerce_sync_events_insert_own" on public.commerce_sync_events;
create policy "commerce_sync_events_insert_own" on public.commerce_sync_events
  for insert
  with check (
    auth.uid() = user_id
    and (
      product_id is null
      or exists (
        select 1 from public.products p
        where p.id = product_id and p.user_id = auth.uid()
      )
    )
    and (
      platform_listing_id is null
      or exists (
        select 1 from public.platform_listings pl
        where pl.id = platform_listing_id and pl.user_id = auth.uid()
      )
    )
  );

-- Order items ---------------------------------------------------------------
drop policy if exists "commerce_order_items_insert_own" on public.commerce_order_items;
create policy "commerce_order_items_insert_own" on public.commerce_order_items
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.commerce_orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
    and (
      product_id is null
      or exists (
        select 1 from public.products p
        where p.id = product_id and p.user_id = auth.uid()
      )
    )
    and (
      platform_listing_id is null
      or exists (
        select 1 from public.platform_listings pl
        where pl.id = platform_listing_id and pl.user_id = auth.uid()
      )
    )
  );

-- Storefront product membership --------------------------------------------
drop policy if exists "storefront_products_update_own" on public.storefront_products;
create policy "storefront_products_update_own" on public.storefront_products
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.storefronts s
      where s.id = storefront_id and s.user_id = auth.uid()
    )
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.user_id = auth.uid()
    )
  );

-- Service-role API routes remain responsible for provider ingestion and
-- audited external mutations. No public/anon policies are introduced here.
