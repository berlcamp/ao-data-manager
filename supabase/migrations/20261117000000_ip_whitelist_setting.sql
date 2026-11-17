-- System-wide key/value settings (e.g. the IP whitelisting toggle).
create table if not exists public.adm_system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.adm_system_settings enable row level security;

create policy "authenticated read" on public.adm_system_settings
  for select to authenticated
  using (true);

create policy "super admin write" on public.adm_system_settings
  for all to authenticated
  using ((select auth.jwt() ->> 'email') = 'berlcamp@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'berlcamp@gmail.com');

insert into public.adm_system_settings (key, value)
values ('ip_whitelist_enabled', 'false'::jsonb)
on conflict (key) do nothing;

-- Whitelisted IPs: add a label and let only the super admin manage them.
alter table public.adm_ip_whitelists
  add column if not exists label text,
  add column if not exists created_at timestamptz not null default now();

create policy "super admin insert" on public.adm_ip_whitelists
  for insert to authenticated
  with check ((select auth.jwt() ->> 'email') = 'berlcamp@gmail.com');

create policy "super admin update" on public.adm_ip_whitelists
  for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'berlcamp@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'berlcamp@gmail.com');

create policy "super admin delete" on public.adm_ip_whitelists
  for delete to authenticated
  using ((select auth.jwt() ->> 'email') = 'berlcamp@gmail.com');
