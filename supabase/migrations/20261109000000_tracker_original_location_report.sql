-- Office Report by original location: one row per document, using the
-- document's first route log (its original location). Later routes are
-- ignored, so a document never appears more than once.
create or replace function public.fetch_original_location_report(
  p_location text default null, -- null = all locations
  p_from date default null,
  p_to date default null,
  p_types text[] default null, -- null = all types
  p_user uuid default null -- only documents whose first route was logged by this user
)
returns table (
  id bigint,
  title text,
  date date,
  "time" text,
  "user" text,
  adm_trackers json
)
language sql
stable
set search_path = public
as $$
  select
    r.id,
    r.title,
    r.date,
    r.time,
    r.user,
    json_build_object(
      'id', t.id,
      'routing_slip_no', t.routing_slip_no,
      'type', t.type,
      'requester', t.requester,
      'agency', t.agency,
      'amount', t.amount,
      'particulars', t.particulars,
      'location', t.location,
      'status', t.status
    ) as adm_trackers
  from adm_tracker_routes r
  join adm_trackers t on t.id = r.tracker_id
  where t.archived = false
    and (p_location is null or r.title = p_location)
    and (p_from is null or r.date >= p_from)
    and (p_to is null or r.date <= p_to)
    and (p_types is null or t.type = any(p_types))
    and (p_user is null or r.user_id = p_user)
    -- keep only the document's first route
    and not exists (
      select 1 from adm_tracker_routes r2
      where r2.tracker_id = r.tracker_id
        and r2.id < r.id
    )
  order by r.date, r.id
$$;

grant execute on function public.fetch_original_location_report(text, date, date, text[], uuid) to authenticated;
