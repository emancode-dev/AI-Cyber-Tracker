-- Development-only seed. It uses the first existing Auth user if one exists.
-- Run only in local/dev environments. It does nothing when auth.users is empty.
do $$
declare
  demo_user uuid;
begin
  select id into demo_user from auth.users order by created_at asc limit 1;
  if demo_user is not null then
    insert into public.websites (user_id, name, url, domain, authorization_confirmed, authorization_confirmed_at)
    values (demo_user, 'Authorized Demo Website', 'https://example.com/', 'example.com', true, now())
    on conflict (user_id, url) do nothing;
  end if;
end $$;
