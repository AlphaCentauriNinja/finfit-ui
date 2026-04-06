-- Change sort_order from integer to numeric to support fractional weights (e.g., 0.5, 0.1)
alter table public.bullion_catalog_products 
    alter column sort_order type numeric using sort_order::numeric;

alter table public.bullion_catalog_variants 
    alter column sort_order type numeric using sort_order::numeric;
