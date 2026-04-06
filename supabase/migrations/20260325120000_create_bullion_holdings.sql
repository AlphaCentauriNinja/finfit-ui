-- Catalog references are enforced in a later migration once the bullion catalog tables exist.
create table public.bullion_holdings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    metal text not null check (metal in ('GOLD', 'SILVER')),
    type text not null check (type in ('COIN', 'BAR')),
    description text not null,
    amount numeric not null check (amount > 0),
    weight_per_item_grams numeric not null check (weight_per_item_grams > 0),
    manufacturer text,
    country text,
    mint_year text,
    purchase_date date,
    purchase_value numeric check (purchase_value is null or purchase_value > 0),
    purchase_currency text check (purchase_currency is null or purchase_currency in ('GBP', 'EUR', 'USD', 'CHF', 'CAD')),
    link_label text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    check (
        (purchase_value is null and purchase_currency is null)
        or (purchase_value is not null and purchase_currency is not null)
    )
);

alter table public.bullion_holdings enable row level security;

create policy "Users can view their own bullion holdings"
    on public.bullion_holdings
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own bullion holdings"
    on public.bullion_holdings
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own bullion holdings"
    on public.bullion_holdings
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own bullion holdings"
    on public.bullion_holdings
    for delete
    using (auth.uid() = user_id);
