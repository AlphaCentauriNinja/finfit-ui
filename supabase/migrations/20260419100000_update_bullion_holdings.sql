alter table public.bullion_holdings
    add column if not exists market_premium_pct numeric not null default 0,
    add column if not exists notes text,
    add column if not exists image_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'bullion_images',
    'bullion_images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
    name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can view own bullion images" on storage.objects;
create policy "Users can view own bullion images"
on storage.objects
for select
using (
    bucket_id = 'bullion_images'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload own bullion images" on storage.objects;
create policy "Users can upload own bullion images"
on storage.objects
for insert
with check (
    bucket_id = 'bullion_images'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own bullion images" on storage.objects;
create policy "Users can update own bullion images"
on storage.objects
for update
using (
    bucket_id = 'bullion_images'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'bullion_images'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own bullion images" on storage.objects;
create policy "Users can delete own bullion images"
on storage.objects
for delete
using (
    bucket_id = 'bullion_images'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
);
