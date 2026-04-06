alter table public.bullion_holdings
    add column if not exists purchase_date date,
    add column if not exists purchase_value numeric,
    add column if not exists purchase_currency text;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_purchase_value_positive_check'
    ) then
        alter table public.bullion_holdings
            add constraint bullion_holdings_purchase_value_positive_check
                check (purchase_value is null or purchase_value > 0);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_purchase_currency_check'
    ) then
        alter table public.bullion_holdings
            add constraint bullion_holdings_purchase_currency_check
                check (purchase_currency is null or purchase_currency in ('GBP', 'EUR', 'USD', 'CHF', 'CAD'));
    end if;
end $$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_purchase_value_currency_pair_check'
    ) then
        alter table public.bullion_holdings
            add constraint bullion_holdings_purchase_value_currency_pair_check
                check (
                    (purchase_value is null and purchase_currency is null)
                    or (purchase_value is not null and purchase_currency is not null)
                );
    end if;
end $$;
