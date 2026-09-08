-- Craftly — protect Paddle entitlements from out-of-order webhook delivery.
-- Paddle does not guarantee webhook delivery order, so keep the timestamp of the
-- newest entitlement-changing event applied to each profile. The application
-- only applies an older event when this value is null or strictly older.

alter table public.profiles
  add column if not exists paddle_entitlement_event_at timestamptz;
