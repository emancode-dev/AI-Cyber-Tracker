-- Day 14: Row Level Security and least-privilege ownership rules.
alter table public.profiles enable row level security;
alter table public.websites enable row level security;
alter table public.scans enable row level security;
alter table public.findings enable row level security;

revoke all on public.profiles from anon;
revoke all on public.websites from anon;
revoke all on public.scans from anon;
revoke all on public.findings from anon;

grant select, insert on public.profiles to authenticated;
grant update (name, updated_at) on public.profiles to authenticated;
grant select, insert, update, delete on public.websites to authenticated;
grant select, insert, update, delete on public.scans to authenticated;
grant select, insert, update, delete on public.findings to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id and role = 'user');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "websites_select_own" on public.websites;
create policy "websites_select_own" on public.websites for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "websites_insert_own" on public.websites;
create policy "websites_insert_own" on public.websites for insert to authenticated with check ((select auth.uid()) = user_id and authorization_confirmed = true);

drop policy if exists "websites_update_own" on public.websites;
create policy "websites_update_own" on public.websites for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "websites_delete_own" on public.websites;
create policy "websites_delete_own" on public.websites for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "scans_select_owned_website" on public.scans;
create policy "scans_select_owned_website" on public.scans for select to authenticated using (exists (select 1 from public.websites w where w.id = scans.website_id and w.user_id = (select auth.uid())));

drop policy if exists "scans_insert_owned_website" on public.scans;
create policy "scans_insert_owned_website" on public.scans for insert to authenticated with check (exists (select 1 from public.websites w where w.id = scans.website_id and w.user_id = (select auth.uid()) and w.authorization_confirmed = true));

drop policy if exists "scans_update_owned_website" on public.scans;
create policy "scans_update_owned_website" on public.scans for update to authenticated using (exists (select 1 from public.websites w where w.id = scans.website_id and w.user_id = (select auth.uid()))) with check (exists (select 1 from public.websites w where w.id = scans.website_id and w.user_id = (select auth.uid())));

drop policy if exists "scans_delete_owned_website" on public.scans;
create policy "scans_delete_owned_website" on public.scans for delete to authenticated using (exists (select 1 from public.websites w where w.id = scans.website_id and w.user_id = (select auth.uid())));

drop policy if exists "findings_select_owned_scan" on public.findings;
create policy "findings_select_owned_scan" on public.findings for select to authenticated using (exists (select 1 from public.scans s join public.websites w on w.id = s.website_id where s.id = findings.scan_id and w.user_id = (select auth.uid())));

drop policy if exists "findings_insert_owned_scan" on public.findings;
create policy "findings_insert_owned_scan" on public.findings for insert to authenticated with check (exists (select 1 from public.scans s join public.websites w on w.id = s.website_id where s.id = findings.scan_id and w.user_id = (select auth.uid())));

drop policy if exists "findings_update_owned_scan" on public.findings;
create policy "findings_update_owned_scan" on public.findings for update to authenticated using (exists (select 1 from public.scans s join public.websites w on w.id = s.website_id where s.id = findings.scan_id and w.user_id = (select auth.uid()))) with check (exists (select 1 from public.scans s join public.websites w on w.id = s.website_id where s.id = findings.scan_id and w.user_id = (select auth.uid())));

drop policy if exists "findings_delete_owned_scan" on public.findings;
create policy "findings_delete_owned_scan" on public.findings for delete to authenticated using (exists (select 1 from public.scans s join public.websites w on w.id = s.website_id where s.id = findings.scan_id and w.user_id = (select auth.uid())));
