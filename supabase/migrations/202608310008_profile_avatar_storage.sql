-- Profile avatar support with an owner-scoped Supabase Storage bucket.
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles drop constraint if exists profiles_avatar_url_https;
alter table public.profiles add constraint profiles_avatar_url_https check (
  avatar_url is null or avatar_url ~ '^https://'
);

grant update (name, avatar_url, updated_at) on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatar_insert_own_folder" on storage.objects;
create policy "avatar_insert_own_folder" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatar_update_own_folder" on storage.objects;
create policy "avatar_update_own_folder" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatar_delete_own_folder" on storage.objects;
create policy "avatar_delete_own_folder" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text);

comment on column public.profiles.avatar_url is 'Public URL of the user-owned PNG, JPEG, or WebP avatar in the avatars bucket.';
