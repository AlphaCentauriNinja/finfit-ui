create extension if not exists pgcrypto;

create table if not exists public.pension_accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    provider_name text not null,
    current_value numeric(14, 2) not null check (current_value >= 0),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists pension_accounts_user_id_idx on public.pension_accounts(user_id);
create index if not exists pension_accounts_user_id_created_at_idx on public.pension_accounts(user_id, created_at desc);

alter table public.pension_accounts enable row level security;

drop policy if exists "pension_accounts_select_own" on public.pension_accounts;
create policy "pension_accounts_select_own"
on public.pension_accounts
for select
using (auth.uid() = user_id);

drop policy if exists "pension_accounts_insert_own" on public.pension_accounts;
create policy "pension_accounts_insert_own"
on public.pension_accounts
for insert
with check (auth.uid() = user_id);

drop policy if exists "pension_accounts_update_own" on public.pension_accounts;
create policy "pension_accounts_update_own"
on public.pension_accounts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "pension_accounts_delete_own" on public.pension_accounts;
create policy "pension_accounts_delete_own"
on public.pension_accounts
for delete
using (auth.uid() = user_id);

create or replace function public.set_pension_accounts_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists pension_accounts_set_updated_at on public.pension_accounts;
create trigger pension_accounts_set_updated_at
before update on public.pension_accounts
for each row
execute function public.set_pension_accounts_updated_at();
