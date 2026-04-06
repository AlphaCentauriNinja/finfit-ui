create extension if not exists pgcrypto;

create table if not exists public.debt_entries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    debt_type text not null check (debt_type in ('credit_card', 'private_loan', 'student_loan', 'car_finance', 'mortgage', 'other')),
    debt_name text not null,
    amount numeric(14, 2) not null check (amount >= 0),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists debt_entries_user_id_idx on public.debt_entries(user_id);
create index if not exists debt_entries_user_id_created_at_idx on public.debt_entries(user_id, created_at desc);

alter table public.debt_entries enable row level security;

drop policy if exists "debt_entries_select_own" on public.debt_entries;
create policy "debt_entries_select_own"
on public.debt_entries
for select
using (auth.uid() = user_id);

drop policy if exists "debt_entries_insert_own" on public.debt_entries;
create policy "debt_entries_insert_own"
on public.debt_entries
for insert
with check (auth.uid() = user_id);

drop policy if exists "debt_entries_update_own" on public.debt_entries;
create policy "debt_entries_update_own"
on public.debt_entries
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "debt_entries_delete_own" on public.debt_entries;
create policy "debt_entries_delete_own"
on public.debt_entries
for delete
using (auth.uid() = user_id);

create or replace function public.set_debt_entries_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists debt_entries_set_updated_at on public.debt_entries;
create trigger debt_entries_set_updated_at
before update on public.debt_entries
for each row
execute function public.set_debt_entries_updated_at();
