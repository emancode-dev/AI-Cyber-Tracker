-- Keep target authorization tied to the exact URL being assessed.
create or replace function public.guard_website_url_authorization()
returns trigger
language plpgsql
as $$
begin
  if new.url is distinct from old.url then
    if new.authorization_confirmed is not true
       or new.authorization_confirmed_at is null
       or (old.authorization_confirmed_at is not null and new.authorization_confirmed_at <= old.authorization_confirmed_at) then
      raise exception 'Changing a website URL requires a fresh authorization confirmation timestamp.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists websites_guard_url_authorization on public.websites;
create trigger websites_guard_url_authorization
  before update on public.websites
  for each row execute function public.guard_website_url_authorization();
