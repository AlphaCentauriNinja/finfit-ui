alter table if exists public.user_settings
    add column if not exists country text,
    add column if not exists city text;

update public.user_settings
set country = coalesce(country, 'United Kingdom'),
    city = coalesce(city, 'London')
where country is null
   or city is null;
