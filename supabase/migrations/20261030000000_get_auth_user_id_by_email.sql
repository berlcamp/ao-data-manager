-- Look up an existing auth user's id by email, so accounts already registered
-- by another system on this Supabase project can be linked instead of re-created.
-- Callable only with the service role key (used by app/api/signup/route.ts).
create or replace function public.get_auth_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke execute on function public.get_auth_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.get_auth_user_id_by_email(text) to service_role;
