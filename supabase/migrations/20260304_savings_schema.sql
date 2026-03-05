-- Table: savings_accounts
create table savings_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table savings_accounts enable row level security;

create policy "Users can modify their own savings accounts"
  on savings_accounts for all
  using (auth.uid() = user_id);

-- Table: savings_pots
create table savings_pots (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references savings_accounts(id) on delete cascade not null,
  name text not null,
  balance numeric not null default 0,
  target_amount numeric null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table savings_pots enable row level security;

create policy "Users can modify pots for their own accounts"
  on savings_pots for all
  using (
    account_id in (
      select id from savings_accounts where user_id = auth.uid()
    )
  );
