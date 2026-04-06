insert into public.bullion_catalog_variants (
    id,
    product_id,
    name,
    fine_metal_oz,
    fine_metal_g,
    gross_weight_g,
    sort_order
)
values
    ('gold-bar-standard-1-tola', 'gold-bar-standard', '1 tola', 0.375, 11.6638, 11.6638, 11),
    ('gold-bar-standard-5-tola', 'gold-bar-standard', '5 tola', 1.875, 58.319, 58.319, 12),
    ('gold-bar-standard-10-tola', 'gold-bar-standard', '10 tola', 3.75, 116.638, 116.638, 13),
    ('silver-bar-standard-1-tola', 'silver-bar-standard', '1 tola', 0.375, 11.6638, 11.6638, 10),
    ('silver-bar-standard-5-tola', 'silver-bar-standard', '5 tola', 1.875, 58.319, 58.319, 11),
    ('silver-bar-standard-10-tola', 'silver-bar-standard', '10 tola', 3.75, 116.638, 116.638, 12)
on conflict (id) do update set
    product_id = excluded.product_id,
    name = excluded.name,
    fine_metal_oz = excluded.fine_metal_oz,
    fine_metal_g = excluded.fine_metal_g,
    gross_weight_g = excluded.gross_weight_g,
    sort_order = excluded.sort_order;
