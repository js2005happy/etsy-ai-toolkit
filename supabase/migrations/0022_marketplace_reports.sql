-- Marketplace abuse/report intake. Reports are private to the reporting user and
-- service-role moderators. This migration does not create automated takedowns.

create table if not exists public.marketplace_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  storefront_id uuid not null references public.storefronts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  reason text not null check (reason in ('misleading','prohibited','counterfeit','unsafe','spam','other')),
  details text,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reporter_user_id, product_id, reason)
);

create index if not exists marketplace_reports_reporter_idx on public.marketplace_reports(reporter_user_id, created_at desc);
create index if not exists marketplace_reports_status_idx on public.marketplace_reports(status, created_at asc);

alter table public.marketplace_reports enable row level security;

revoke all on public.marketplace_reports from anon;
revoke all on public.marketplace_reports from authenticated;
grant select, insert on public.marketplace_reports to authenticated;

drop policy if exists marketplace_reports_select_own on public.marketplace_reports;
create policy marketplace_reports_select_own on public.marketplace_reports
for select to authenticated
using (reporter_user_id = auth.uid());

drop policy if exists marketplace_reports_insert_own on public.marketplace_reports;
create policy marketplace_reports_insert_own on public.marketplace_reports
for insert to authenticated
with check (
  reporter_user_id = auth.uid()
  and exists (
    select 1
    from public.storefronts s
    join public.storefront_products sp on sp.storefront_id = s.id
    join public.products p on p.id = sp.product_id
    where s.id = storefront_id
      and p.id = product_id
      and s.is_published = true
      and sp.is_visible = true
      and p.status = 'ready'
      and p.user_id = s.user_id
  )
);

comment on table public.marketplace_reports is 'Private marketplace listing reports; no automated enforcement is performed by this table.';
