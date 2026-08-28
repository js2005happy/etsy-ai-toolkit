-- Etsy AI Toolkit — Paddle subscription + customer mirror
-- Mirrors Paddle state from verified webhooks. `profiles.plan` remains the
-- denormalized access flag (free | pro) that the frontend reads; it is
-- recomputed from `subscriptions.status` by the webhook access helper.

-- 1. customers: one row per Paddle customer (ctm_...)
create table if not exists public.customers (
  customer_id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_user_id_key
  on public.customers (user_id) where user_id is not null;

-- 2. subscriptions: one row per Paddle subscription (sub_...)
create table if not exists public.subscriptions (
  subscription_id text primary key,
  customer_id text not null references public.customers (customer_id) on delete cascade,
  status text not null,
  price_id text not null,
  product_id text not null,
  scheduled_change_action text,
  scheduled_change_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_customer_id_idx
  on public.subscriptions (customer_id);

-- 3. Row Level Security — service role (webhook + server routes) bypasses RLS;
--    users may only read their own rows.
alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;

create policy "users read own customer"
  on public.customers for select
  using (auth.uid() = user_id);

create policy "users read own subscriptions"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.customers c
      where c.customer_id = subscriptions.customer_id
        and c.user_id = auth.uid()
    )
  );
