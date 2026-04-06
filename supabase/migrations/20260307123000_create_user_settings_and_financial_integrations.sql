create extension if not exists pgcrypto;

create table if not exists public.user_settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    full_name text,
    phone text,
    date_of_birth date,
    preferred_currency text not null default 'GBP' check (preferred_currency in ('GBP', 'EUR', 'USD', 'CHF', 'CAD')),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_settings_user_id_idx on public.user_settings(user_id);

alter table public.user_settings enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
on public.user_settings
for select
using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
on public.user_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
on public.user_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_settings_delete_own" on public.user_settings;
create policy "user_settings_delete_own"
on public.user_settings
for delete
using (auth.uid() = user_id);

create table if not exists public.open_banking_connections (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    provider_name text not null,
    account_label text,
    external_connection_id text,
    connection_status text not null default 'pending' check (connection_status in ('pending', 'connected', 'error', 'revoked')),
    last_synced_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists open_banking_connections_user_id_idx on public.open_banking_connections(user_id);
create index if not exists open_banking_connections_user_id_status_idx on public.open_banking_connections(user_id, connection_status);

alter table public.open_banking_connections enable row level security;

drop policy if exists "open_banking_connections_select_own" on public.open_banking_connections;
create policy "open_banking_connections_select_own"
on public.open_banking_connections
for select
using (auth.uid() = user_id);

drop policy if exists "open_banking_connections_insert_own" on public.open_banking_connections;
create policy "open_banking_connections_insert_own"
on public.open_banking_connections
for insert
with check (auth.uid() = user_id);

drop policy if exists "open_banking_connections_update_own" on public.open_banking_connections;
create policy "open_banking_connections_update_own"
on public.open_banking_connections
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "open_banking_connections_delete_own" on public.open_banking_connections;
create policy "open_banking_connections_delete_own"
on public.open_banking_connections
for delete
using (auth.uid() = user_id);

create table if not exists public.api_integrations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    provider_name text not null,
    key_label text not null default 'default',
    account_label text,
    api_key_ciphertext text,
    api_secret_ciphertext text,
    is_active boolean not null default true,
    last_synced_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    unique (user_id, provider_name, key_label)
);

create index if not exists api_integrations_user_id_idx on public.api_integrations(user_id);
create index if not exists api_integrations_user_provider_idx on public.api_integrations(user_id, provider_name);

alter table public.api_integrations enable row level security;

drop policy if exists "api_integrations_select_own" on public.api_integrations;
create policy "api_integrations_select_own"
on public.api_integrations
for select
using (auth.uid() = user_id);

drop policy if exists "api_integrations_insert_own" on public.api_integrations;
create policy "api_integrations_insert_own"
on public.api_integrations
for insert
with check (auth.uid() = user_id);

drop policy if exists "api_integrations_update_own" on public.api_integrations;
create policy "api_integrations_update_own"
on public.api_integrations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "api_integrations_delete_own" on public.api_integrations;
create policy "api_integrations_delete_own"
on public.api_integrations
for delete
using (auth.uid() = user_id);

create or replace function public.set_generic_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row
execute function public.set_generic_updated_at();

drop trigger if exists open_banking_connections_set_updated_at on public.open_banking_connections;
create trigger open_banking_connections_set_updated_at
before update on public.open_banking_connections
for each row
execute function public.set_generic_updated_at();

drop trigger if exists api_integrations_set_updated_at on public.api_integrations;
create trigger api_integrations_set_updated_at
before update on public.api_integrations
for each row
execute function public.set_generic_updated_at();

insert into public.user_settings (user_id, full_name)
select
    au.id,
    coalesce(
        nullif(au.raw_user_meta_data ->> 'full_name', ''),
        nullif(au.raw_user_meta_data ->> 'name', ''),
        split_part(au.email, '@', 1)
    )
from auth.users au
on conflict (user_id) do nothing;
