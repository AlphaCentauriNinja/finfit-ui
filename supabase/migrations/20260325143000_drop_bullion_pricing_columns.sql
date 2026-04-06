alter table public.bullion_holdings
    drop column if exists intrinsic_price_gbp,
    drop column if exists market_price_gbp;
