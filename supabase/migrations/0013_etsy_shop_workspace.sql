-- Craftly shop workspace. Etsy OAuth tokens remain only in etsy_connections;
-- these tables store the user-owned import, review, and analysis data.
create table if not exists public.etsy_listings (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  connection_id bigint not null references public.etsy_connections(id) on delete cascade,
  etsy_listing_id bigint not null,
  title text not null default '', description text not null default '', tags jsonb not null default '[]'::jsonb,
  price numeric, quantity integer, taxonomy_id bigint, attributes jsonb not null default '[]'::jsonb,
  variations jsonb not null default '[]'::jsonb, images jsonb not null default '[]'::jsonb,
  shipping_profile_id bigint, state text not null default 'draft', listing_url text,
  source_updated_at timestamptz, synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (connection_id, etsy_listing_id)
);
create index if not exists etsy_listings_user_state_idx on public.etsy_listings(user_id, state);
alter table public.etsy_listings enable row level security;
create policy "users manage own imported Etsy listings" on public.etsy_listings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.etsy_listing_versions (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.etsy_listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('import', 'ai', 'manual', 'restore')),
  snapshot jsonb not null, created_at timestamptz not null default now()
);
alter table public.etsy_listing_versions enable row level security;
create policy "users manage own Etsy listing versions" on public.etsy_listing_versions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.etsy_sync_jobs (
  id bigint generated always as identity primary key,
  connection_id bigint not null references public.etsy_connections(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('initial', 'incremental', 'manual')),
  status text not null default 'queued' check (status in ('queued', 'fetching', 'processing', 'completed', 'partial', 'failed')),
  total_count integer not null default 0, processed_count integer not null default 0, failed_count integer not null default 0,
  error_summary text, created_at timestamptz not null default now(), completed_at timestamptz
);
alter table public.etsy_sync_jobs enable row level security;
create policy "users read own Etsy sync jobs" on public.etsy_sync_jobs for select using (auth.uid() = user_id);
