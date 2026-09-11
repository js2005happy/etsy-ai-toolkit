-- Marketplace moderation audit fields. Human moderation remains explicit and
-- does not create automated listing removal or enforcement.

alter table public.marketplace_reports
  add column if not exists reviewer_user_id uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists resolution_note text;

create index if not exists marketplace_reports_reviewer_idx
  on public.marketplace_reports(reviewer_user_id, reviewed_at desc nulls last);

comment on column public.marketplace_reports.reviewer_user_id is 'Authenticated moderator who last reviewed this report.';
comment on column public.marketplace_reports.resolution_note is 'Internal human-review note; does not itself perform a takedown.';
