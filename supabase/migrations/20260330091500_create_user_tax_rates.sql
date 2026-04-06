-- Create user_tax_rates table to allow custom tax configurations
create table if not exists public.user_tax_rates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    rate_pct numeric not null check (rate_pct >= 0),
    is_default boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    unique (user_id, rate_pct)
);

create index if not exists user_tax_rates_user_id_idx on public.user_tax_rates(user_id);

alter table public.user_tax_rates enable row level security;

drop policy if exists "user_tax_rates_select_own" on public.user_tax_rates;
create policy "user_tax_rates_select_own"
on public.user_tax_rates
for select
using (auth.uid() = user_id);

drop policy if exists "user_tax_rates_insert_own" on public.user_tax_rates;
create policy "user_tax_rates_insert_own"
on public.user_tax_rates
for insert
with check (auth.uid() = user_id);

drop policy if exists "user_tax_rates_update_own" on public.user_tax_rates;
create policy "user_tax_rates_update_own"
on public.user_tax_rates
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_tax_rates_delete_own" on public.user_tax_rates;
create policy "user_tax_rates_delete_own"
on public.user_tax_rates
for delete
using (auth.uid() = user_id);

drop trigger if exists user_tax_rates_set_updated_at on public.user_tax_rates;
create trigger user_tax_rates_set_updated_at
before update on public.user_tax_rates
for each row
execute function public.set_generic_updated_at();

-- Drop the restrictive tax_rate_pct constraint on bullion_holdings
do $$
begin
    if exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_tax_rate_pct_check'
    ) then
        alter table public.bullion_holdings drop constraint bullion_holdings_tax_rate_pct_check;
    end if;
end $$;

-- Optional: ensure a constraint that ensures tax_rate_pct is non-negative
do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_tax_rate_pct_non_negative'
    ) then
        alter table public.bullion_holdings
            add constraint bullion_holdings_tax_rate_pct_non_negative
                check (tax_rate_pct is null or tax_rate_pct >= 0);
    end if;
end $$;
