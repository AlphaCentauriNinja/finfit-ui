create table if not exists public.pension_account_values (
    id uuid primary key default gen_random_uuid(),
    pension_account_id uuid not null references public.pension_accounts(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    value_amount numeric(14, 2) not null check (value_amount >= 0),
    value_date date not null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists pension_account_values_user_id_idx on public.pension_account_values(user_id);
create index if not exists pension_account_values_account_id_idx on public.pension_account_values(pension_account_id);
create index if not exists pension_account_values_account_date_idx on public.pension_account_values(pension_account_id, value_date desc);

alter table public.pension_account_values enable row level security;

drop policy if exists "pension_account_values_select_own" on public.pension_account_values;
create policy "pension_account_values_select_own"
on public.pension_account_values
for select
using (auth.uid() = user_id);

drop policy if exists "pension_account_values_insert_own" on public.pension_account_values;
create policy "pension_account_values_insert_own"
on public.pension_account_values
for insert
with check (
    auth.uid() = user_id
    and exists (
        select 1
        from public.pension_accounts pa
        where pa.id = pension_account_id
          and pa.user_id = auth.uid()
    )
);

drop policy if exists "pension_account_values_update_own" on public.pension_account_values;
create policy "pension_account_values_update_own"
on public.pension_account_values
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "pension_account_values_delete_own" on public.pension_account_values;
create policy "pension_account_values_delete_own"
on public.pension_account_values
for delete
using (auth.uid() = user_id);

create or replace function public.set_pension_account_values_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists pension_account_values_set_updated_at on public.pension_account_values;
create trigger pension_account_values_set_updated_at
before update on public.pension_account_values
for each row
execute function public.set_pension_account_values_updated_at();
