-- Add tax columns to bullion_holdings for silver VAT tracking
alter table public.bullion_holdings
    add column if not exists tax_rate_pct numeric,
    add column if not exists tax_amount numeric,
    add column if not exists total_price_incl_tax numeric;

-- Restrict to known tax rates: 0% (VAT free) or 20% (standard UK VAT)
do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_tax_rate_pct_check'
    ) then
        alter table public.bullion_holdings
            add constraint bullion_holdings_tax_rate_pct_check
                check (tax_rate_pct is null or tax_rate_pct in (0, 20));
    end if;
end $$;

-- tax_amount must be non-negative when set
do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_tax_amount_check'
    ) then
        alter table public.bullion_holdings
            add constraint bullion_holdings_tax_amount_check
                check (tax_amount is null or tax_amount >= 0);
    end if;
end $$;

-- total_price_incl_tax must be positive when set
do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_total_price_incl_tax_check'
    ) then
        alter table public.bullion_holdings
            add constraint bullion_holdings_total_price_incl_tax_check
                check (total_price_incl_tax is null or total_price_incl_tax > 0);
    end if;
end $$;
