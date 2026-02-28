create table if not exists public.pension_contributions (
    id uuid primary key default gen_random_uuid(),
    pension_account_id uuid not null references public.pension_accounts(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    contribution_name text not null,
    contribution_value numeric(14, 2) not null check (contribution_value > 0),
    contribution_date date not null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists pension_contributions_user_id_idx on public.pension_contributions(user_id);
create index if not exists pension_contributions_account_id_idx on public.pension_contributions(pension_account_id);
create index if not exists pension_contributions_account_date_idx on public.pension_contributions(pension_account_id, contribution_date desc);

alter table public.pension_contributions enable row level security;

drop policy if exists "pension_contributions_select_own" on public.pension_contributions;
create policy "pension_contributions_select_own"
on public.pension_contributions
for select
using (auth.uid() = user_id);

drop policy if exists "pension_contributions_insert_own" on public.pension_contributions;
create policy "pension_contributions_insert_own"
on public.pension_contributions
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

drop policy if exists "pension_contributions_update_own" on public.pension_contributions;
create policy "pension_contributions_update_own"
on public.pension_contributions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "pension_contributions_delete_own" on public.pension_contributions;
create policy "pension_contributions_delete_own"
on public.pension_contributions
for delete
using (auth.uid() = user_id);

create or replace function public.set_pension_contributions_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists pension_contributions_set_updated_at on public.pension_contributions;
create trigger pension_contributions_set_updated_at
before update on public.pension_contributions
for each row
execute function public.set_pension_contributions_updated_at();
