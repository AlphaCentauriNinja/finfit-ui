-- Migration: Create crypto_assets table
create table public.crypto_assets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    ticker text not null,
    name text not null,
    amount numeric not null,
    usd numeric not null,
    invested_gbp numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security policies
alter table public.crypto_assets enable row level security;

create policy "Users can view their own crypto assets"
    on public.crypto_assets
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own crypto assets"
    on public.crypto_assets
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own crypto assets"
    on public.crypto_assets
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own crypto assets"
    on public.crypto_assets
    for delete
    using (auth.uid() = user_id);
