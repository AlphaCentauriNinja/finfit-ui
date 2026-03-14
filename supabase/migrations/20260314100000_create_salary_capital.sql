create table if not exists public.salary_capital (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    capital_name text not null,
    monthly_amount numeric(14, 2) not null check (monthly_amount >= 0),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists salary_capital_user_id_idx on public.salary_capital(user_id);
create index if not exists salary_capital_user_id_created_at_idx on public.salary_capital(user_id, created_at desc);

alter table public.salary_capital enable row level security;

drop policy if exists "salary_capital_select_own" on public.salary_capital;
create policy "salary_capital_select_own"
on public.salary_capital
for select
using (auth.uid() = user_id);

drop policy if exists "salary_capital_insert_own" on public.salary_capital;
create policy "salary_capital_insert_own"
on public.salary_capital
for insert
with check (auth.uid() = user_id);

drop policy if exists "salary_capital_update_own" on public.salary_capital;
create policy "salary_capital_update_own"
on public.salary_capital
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "salary_capital_delete_own" on public.salary_capital;
create policy "salary_capital_delete_own"
on public.salary_capital
for delete
using (auth.uid() = user_id);

create or replace function public.set_salary_capital_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists set_salary_capital_updated_at on public.salary_capital;
create trigger set_salary_capital_updated_at
before update on public.salary_capital
for each row
execute function public.set_salary_capital_updated_at();