-- Users exempted from IP whitelisting are stored in asenso_system_access with
-- type = 'ip_exempt'. The existing "auth" policy lets any authenticated user
-- write that table, so restrict 'ip_exempt' rows to the super admin;
-- otherwise a blocked user could exempt themselves through the API.
create policy "ip_exempt super admin insert" on public.asenso_system_access
  as restrictive
  for insert to authenticated
  with check (
    type <> 'ip_exempt'
    or (select auth.jwt() ->> 'email') = 'berlcamp@gmail.com'
  );

create policy "ip_exempt super admin update" on public.asenso_system_access
  as restrictive
  for update to authenticated
  using (
    type <> 'ip_exempt'
    or (select auth.jwt() ->> 'email') = 'berlcamp@gmail.com'
  )
  with check (
    type <> 'ip_exempt'
    or (select auth.jwt() ->> 'email') = 'berlcamp@gmail.com'
  );

create policy "ip_exempt super admin delete" on public.asenso_system_access
  as restrictive
  for delete to authenticated
  using (
    type <> 'ip_exempt'
    or (select auth.jwt() ->> 'email') = 'berlcamp@gmail.com'
  );
