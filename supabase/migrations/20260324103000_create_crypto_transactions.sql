-- Migration: Create crypto_transactions table for per-asset buy/sell history
create table public.crypto_transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    crypto_asset_id uuid references public.crypto_assets(id) on delete cascade not null,
    transaction_type text not null check (transaction_type in ('BUY', 'SELL')),
    amount numeric not null check (amount > 0),
    total_value_gbp numeric not null check (total_value_gbp > 0),
    transaction_date date not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.crypto_transactions enable row level security;

create policy "Users can view their own crypto transactions"
    on public.crypto_transactions
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own crypto transactions"
    on public.crypto_transactions
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own crypto transactions"
    on public.crypto_transactions
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own crypto transactions"
    on public.crypto_transactions
    for delete
    using (auth.uid() = user_id);
