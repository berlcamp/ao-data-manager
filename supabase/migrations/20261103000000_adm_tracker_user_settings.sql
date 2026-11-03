-- Per-user settings for the Document Tracker (e.g. default location for new documents).
create table if not exists public.adm_tracker_user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  default_location text,
  updated_at timestamptz not null default now()
);

alter table public.adm_tracker_user_settings enable row level security;

create policy "own settings" on public.adm_tracker_user_settings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
