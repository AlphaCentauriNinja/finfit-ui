-- Table: savings_history
create table savings_history (
  id uuid default gen_random_uuid() primary key,
  pot_id uuid references savings_pots(id) on delete cascade not null,
  amount numeric not null,
  date date not null default current_date,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table savings_history enable row level security;

create policy "Users can modify history for their own pots"
  on savings_history for all
  using (
    pot_id in (
      select p.id 
      from savings_pots p
      join savings_accounts a on p.account_id = a.id
      where a.user_id = auth.uid()
    )
  );
