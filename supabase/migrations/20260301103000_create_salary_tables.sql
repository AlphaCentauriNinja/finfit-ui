create extension if not exists pgcrypto;

create table if not exists public.salary_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    employer_name text not null,
    monthly_net_salary numeric(14, 2) not null check (monthly_net_salary >= 0),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists salary_profiles_user_id_idx on public.salary_profiles(user_id);

alter table public.salary_profiles enable row level security;

drop policy if exists "salary_profiles_select_own" on public.salary_profiles;
create policy "salary_profiles_select_own"
on public.salary_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "salary_profiles_insert_own" on public.salary_profiles;
create policy "salary_profiles_insert_own"
on public.salary_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "salary_profiles_update_own" on public.salary_profiles;
create policy "salary_profiles_update_own"
on public.salary_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "salary_profiles_delete_own" on public.salary_profiles;
create policy "salary_profiles_delete_own"
on public.salary_profiles
for delete
using (auth.uid() = user_id);

create or replace function public.set_salary_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists salary_profiles_set_updated_at on public.salary_profiles;
create trigger salary_profiles_set_updated_at
before update on public.salary_profiles
for each row
execute function public.set_salary_profiles_updated_at();

create table if not exists public.salary_expenditures (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    expenditure_name text not null,
    monthly_amount numeric(14, 2) not null check (monthly_amount >= 0),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists salary_expenditures_user_id_idx on public.salary_expenditures(user_id);
create index if not exists salary_expenditures_user_id_created_at_idx on public.salary_expenditures(user_id, created_at desc);

alter table public.salary_expenditures enable row level security;

drop policy if exists "salary_expenditures_select_own" on public.salary_expenditures;
create policy "salary_expenditures_select_own"
on public.salary_expenditures
for select
using (auth.uid() = user_id);

drop policy if exists "salary_expenditures_insert_own" on public.salary_expenditures;
create policy "salary_expenditures_insert_own"
on public.salary_expenditures
for insert
with check (auth.uid() = user_id);

drop policy if exists "salary_expenditures_update_own" on public.salary_expenditures;
create policy "salary_expenditures_update_own"
on public.salary_expenditures
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "salary_expenditures_delete_own" on public.salary_expenditures;
create policy "salary_expenditures_delete_own"
on public.salary_expenditures
for delete
using (auth.uid() = user_id);

create or replace function public.set_salary_expenditures_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists salary_expenditures_set_updated_at on public.salary_expenditures;
create trigger salary_expenditures_set_updated_at
before update on public.salary_expenditures
for each row
execute function public.set_salary_expenditures_updated_at();

