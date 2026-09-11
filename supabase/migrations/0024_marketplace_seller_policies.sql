-- Seller-authored Marketplace policies. These fields are descriptive seller statements only;
-- Craftly does not independently verify or guarantee them.

alter table public.storefronts
  add column if not exists shipping_policy text,
  add column if not exists returns_policy text,
  add column if not exists custom_order_policy text,
  add column if not exists processing_time_text text;

comment on column public.storefronts.shipping_policy is 'Seller-authored shipping policy shown publicly; not verified by Craftly.';
comment on column public.storefronts.returns_policy is 'Seller-authored returns/exchanges policy shown publicly; not verified by Craftly.';
comment on column public.storefronts.custom_order_policy is 'Seller-authored custom-order policy shown publicly; not verified by Craftly.';
comment on column public.storefronts.processing_time_text is 'Seller-authored processing-time statement shown publicly; not verified by Craftly.';
