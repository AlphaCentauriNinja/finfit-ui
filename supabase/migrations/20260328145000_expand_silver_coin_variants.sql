-- Expand Silver Coin Catalog and Variant Order
-- First, fix existing Gold Sovereign and Panda sort orders to be Lowest to Highest
update public.bullion_catalog_variants set sort_order = 1 where id = 'gold-coin-british-gold-sovereign-quarter-sovereign';
update public.bullion_catalog_variants set sort_order = 2 where id = 'gold-coin-british-gold-sovereign-half-sovereign';
update public.bullion_catalog_variants set sort_order = 3 where id = 'gold-coin-british-gold-sovereign-full-sovereign';
update public.bullion_catalog_variants set sort_order = 4 where id = 'gold-coin-british-gold-sovereign-double-sovereign';
update public.bullion_catalog_variants set sort_order = 5 where id = 'gold-coin-british-gold-sovereign-five-sovereign';

update public.bullion_catalog_variants set sort_order = 1 where id = 'gold-coin-chinese-gold-panda-1-g';
update public.bullion_catalog_variants set sort_order = 2 where id = 'gold-coin-chinese-gold-panda-3-g';
update public.bullion_catalog_variants set sort_order = 3 where id = 'gold-coin-chinese-gold-panda-8-g';
update public.bullion_catalog_variants set sort_order = 4 where id = 'gold-coin-chinese-gold-panda-15-g';
update public.bullion_catalog_variants set sort_order = 5 where id = 'gold-coin-chinese-gold-panda-30-g';

-- Add new Silver Products
insert into public.bullion_catalog_products (id, metal, type, name, country, purity, liquidity_tier, sort_order)
values
    ('silver-coin-krugerrand-silver', 'SILVER', 'COIN', 'Silver Krugerrand', 'South Africa', 0.999, 1, 15),
    ('silver-coin-mexican-libertad', 'SILVER', 'COIN', 'Mexican Libertad', 'Mexico', 0.999, 1, 16),
    ('silver-coin-australian-kookaburra', 'SILVER', 'COIN', 'Australian Kookaburra', 'Australia', 0.9999, 1, 17),
    ('silver-coin-australian-lunar-series', 'SILVER', 'COIN', 'Australian Lunar Series', 'Australia', 0.9999, 1, 18),
    ('silver-coin-armenian-noahs-ark', 'SILVER', 'COIN', 'Armenian Noahs Ark', 'Armenia', 0.999, 1, 19)
on conflict (id) do update set
    metal = excluded.metal,
    type = excluded.type,
    name = excluded.name,
    country = excluded.country,
    purity = excluded.purity,
    liquidity_tier = excluded.liquidity_tier,
    sort_order = excluded.sort_order;

-- Expand Silver Coin Variants (Lowest to Highest)
insert into public.bullion_catalog_variants (id, product_id, name, fine_metal_oz, fine_metal_g, gross_weight_g, sort_order)
values
    -- American Silver Eagle
    ('silver-coin-american-silver-eagle-0-1-oz', 'silver-coin-american-silver-eagle', '1/10 oz', 0.1, 3.11, 3.11, 0.1),
    ('silver-coin-american-silver-eagle-0-25-oz', 'silver-coin-american-silver-eagle', '1/4 oz', 0.25, 7.78, 7.78, 0.25),
    ('silver-coin-american-silver-eagle-0-5-oz', 'silver-coin-american-silver-eagle', '1/2 oz', 0.5, 15.55, 15.55, 0.5),
    ('silver-coin-american-silver-eagle-1-oz', 'silver-coin-american-silver-eagle', '1 oz', 1, 31.1035, 31.1035, 1),
    ('silver-coin-american-silver-eagle-2-oz', 'silver-coin-american-silver-eagle', '2 oz', 2, 62.21, 62.21, 2),
    ('silver-coin-american-silver-eagle-5-oz', 'silver-coin-american-silver-eagle', '5 oz', 5, 155.52, 155.52, 5),
    ('silver-coin-american-silver-eagle-10-oz', 'silver-coin-american-silver-eagle', '10 oz', 10, 311.04, 311.04, 10),

    -- Canadian Silver Maple Leaf
    ('silver-coin-canadian-silver-maple-leaf-0-1-oz', 'silver-coin-canadian-silver-maple-leaf', '1/10 oz', 0.1, 3.11, 3.11, 0.1),
    ('silver-coin-canadian-silver-maple-leaf-0-25-oz', 'silver-coin-canadian-silver-maple-leaf', '1/4 oz', 0.25, 7.78, 7.78, 0.25),
    ('silver-coin-canadian-silver-maple-leaf-0-5-oz', 'silver-coin-canadian-silver-maple-leaf', '1/2 oz', 0.5, 15.55, 15.55, 0.5),
    ('silver-coin-canadian-silver-maple-leaf-1-oz', 'silver-coin-canadian-silver-maple-leaf', '1 oz', 1, 31.1035, 31.1035, 1),
    ('silver-coin-canadian-silver-maple-leaf-2-oz', 'silver-coin-canadian-silver-maple-leaf', '2 oz', 2, 62.21, 62.21, 2),
    ('silver-coin-canadian-silver-maple-leaf-5-oz', 'silver-coin-canadian-silver-maple-leaf', '5 oz', 5, 155.52, 155.52, 5),
    ('silver-coin-canadian-silver-maple-leaf-10-oz', 'silver-coin-canadian-silver-maple-leaf', '10 oz', 10, 311.04, 311.04, 10),

    -- British Silver Britannia
    ('silver-coin-british-silver-britannia-0-1-oz', 'silver-coin-british-silver-britannia', '1/10 oz', 0.1, 3.11, 3.11, 0.1),
    ('silver-coin-british-silver-britannia-0-25-oz', 'silver-coin-british-silver-britannia', '1/4 oz', 0.25, 7.78, 7.78, 0.25),
    ('silver-coin-british-silver-britannia-0-5-oz', 'silver-coin-british-silver-britannia', '1/2 oz', 0.5, 15.55, 15.55, 0.5),
    ('silver-coin-british-silver-britannia-1-oz', 'silver-coin-british-silver-britannia', '1 oz', 1, 31.1035, 31.1035, 1),
    ('silver-coin-british-silver-britannia-2-oz', 'silver-coin-british-silver-britannia', '2 oz', 2, 62.21, 62.21, 2),
    ('silver-coin-british-silver-britannia-5-oz', 'silver-coin-british-silver-britannia', '5 oz', 5, 155.52, 155.52, 5),
    ('silver-coin-british-silver-britannia-10-oz', 'silver-coin-british-silver-britannia', '10 oz', 10, 311.04, 311.04, 10),

    -- Austrian Silver Philharmonic
    ('silver-coin-austrian-silver-philharmonic-0-1-oz', 'silver-coin-austrian-silver-philharmonic', '1/10 oz', 0.1, 3.11, 3.11, 0.1),
    ('silver-coin-austrian-silver-philharmonic-0-25-oz', 'silver-coin-austrian-silver-philharmonic', '1/4 oz', 0.25, 7.78, 7.78, 0.25),
    ('silver-coin-austrian-silver-philharmonic-0-5-oz', 'silver-coin-austrian-silver-philharmonic', '1/2 oz', 0.5, 15.55, 15.55, 0.5),
    ('silver-coin-austrian-silver-philharmonic-1-oz', 'silver-coin-austrian-silver-philharmonic', '1 oz', 1, 31.1035, 31.1035, 1),
    ('silver-coin-austrian-silver-philharmonic-2-oz', 'silver-coin-austrian-silver-philharmonic', '2 oz', 2, 62.21, 62.21, 2),
    ('silver-coin-austrian-silver-philharmonic-5-oz', 'silver-coin-austrian-silver-philharmonic', '5 oz', 5, 155.52, 155.52, 5),
    ('silver-coin-austrian-silver-philharmonic-10-oz', 'silver-coin-austrian-silver-philharmonic', '10 oz', 10, 311.04, 311.04, 10),

    -- Australian Silver Kangaroo
    ('silver-coin-australian-silver-kangaroo-0-1-oz', 'silver-coin-australian-silver-kangaroo', '1/10 oz', 0.1, 3.11, 3.11, 0.1),
    ('silver-coin-australian-silver-kangaroo-0-25-oz', 'silver-coin-australian-silver-kangaroo', '1/4 oz', 0.25, 7.78, 7.78, 0.25),
    ('silver-coin-australian-silver-kangaroo-0-5-oz', 'silver-coin-australian-silver-kangaroo', '1/2 oz', 0.5, 15.55, 15.55, 0.5),
    ('silver-coin-australian-silver-kangaroo-1-oz', 'silver-coin-australian-silver-kangaroo', '1 oz', 1, 31.1035, 31.1035, 1),
    ('silver-coin-australian-silver-kangaroo-2-oz', 'silver-coin-australian-silver-kangaroo', '2 oz', 2, 62.21, 62.21, 2),
    ('silver-coin-australian-silver-kangaroo-5-oz', 'silver-coin-australian-silver-kangaroo', '5 oz', 5, 155.52, 155.52, 5),
    ('silver-coin-australian-silver-kangaroo-10-oz', 'silver-coin-australian-silver-kangaroo', '10 oz', 10, 311.04, 311.04, 10),

    -- Silver Krugerrand
    ('silver-coin-krugerrand-silver-0-1-oz', 'silver-coin-krugerrand-silver', '1/10 oz', 0.1, 3.11, 3.11, 0.1),
    ('silver-coin-krugerrand-silver-0-25-oz', 'silver-coin-krugerrand-silver', '1/4 oz', 0.25, 7.78, 7.78, 0.25),
    ('silver-coin-krugerrand-silver-0-5-oz', 'silver-coin-krugerrand-silver', '1/2 oz', 0.5, 15.55, 15.55, 0.5),
    ('silver-coin-krugerrand-silver-1-oz', 'silver-coin-krugerrand-silver', '1 oz', 1, 31.1035, 31.1035, 1),
    ('silver-coin-krugerrand-silver-2-oz', 'silver-coin-krugerrand-silver', '2 oz', 2, 62.21, 62.21, 2),

    -- Mexican Libertad
    ('silver-coin-mexican-libertad-0-1-oz', 'silver-coin-mexican-libertad', '1/10 oz', 0.1, 3.11, 3.11, 0.1),
    ('silver-coin-mexican-libertad-0-25-oz', 'silver-coin-mexican-libertad', '1/4 oz', 0.25, 7.78, 7.78, 0.25),
    ('silver-coin-mexican-libertad-0-5-oz', 'silver-coin-mexican-libertad', '1/2 oz', 0.5, 15.55, 15.55, 0.5),
    ('silver-coin-mexican-libertad-1-oz', 'silver-coin-mexican-libertad', '1 oz', 1, 31.1035, 31.1035, 1),
    ('silver-coin-mexican-libertad-2-oz', 'silver-coin-mexican-libertad', '2 oz', 2, 62.21, 62.21, 2),
    ('silver-coin-mexican-libertad-5-oz', 'silver-coin-mexican-libertad', '5 oz', 5, 155.52, 155.52, 5),

    -- Australian Kookaburra
    ('silver-coin-australian-kookaburra-1-oz', 'silver-coin-australian-kookaburra', '1 oz', 1, 31.1035, 31.1035, 1),
    ('silver-coin-australian-kookaburra-2-oz', 'silver-coin-australian-kookaburra', '2 oz', 2, 62.21, 62.21, 2),
    ('silver-coin-australian-kookaburra-10-oz', 'silver-coin-australian-kookaburra', '10 oz', 10, 311.04, 311.04, 10),
    ('silver-coin-australian-kookaburra-1-kg', 'silver-coin-australian-kookaburra', '1 kg', 32.15, 1000, 1000, 32.15),

    -- Chinese Silver Panda
    ('silver-coin-chinese-silver-panda-30-g', 'silver-coin-chinese-silver-panda', '30 g', 0.9645, 30, 30.03, 1),
    ('silver-coin-chinese-silver-panda-150-g', 'silver-coin-chinese-silver-panda', '150 g', 4.8225, 150, 150.15, 2),
    ('silver-coin-chinese-silver-panda-1-kg', 'silver-coin-chinese-silver-panda', '1 kg', 32.15, 1000, 1001, 32.15),

    -- Additional Silver Bars
    ('silver-bar-standard-1-g', 'silver-bar-standard', '1 g', 0.0321, 1, 1, 0.03),
    ('silver-bar-standard-5-g', 'silver-bar-standard', '5 g', 0.1607, 5, 5, 0.16),
    ('silver-bar-standard-10-g', 'silver-bar-standard', '10 g', 0.3215, 10, 10, 0.32),
    ('silver-bar-standard-20-g', 'silver-bar-standard', '20 g', 0.643, 20, 20, 0.64),
    ('silver-bar-standard-50-g', 'silver-bar-standard', '50 g', 1.6075, 50, 50, 1.6),
    ('silver-bar-standard-100-g', 'silver-bar-standard', '100 g', 3.215, 100, 100, 3.2),
    ('silver-bar-standard-250-g', 'silver-bar-standard', '250 g', 8.0375, 250, 250, 8),
    ('silver-bar-standard-500-g', 'silver-bar-standard', '500 g', 16.075, 500, 500, 16),
    ('silver-bar-standard-1-oz', 'silver-bar-standard', '1 oz', 1, 31.1035, 31.1035, 1.0),
    ('silver-bar-standard-2-oz', 'silver-bar-standard', '2 oz', 2, 62.21, 62.21, 2.0),
    ('silver-bar-standard-5-oz', 'silver-bar-standard', '5 oz', 5, 155.52, 155.52, 5.0),
    ('silver-bar-standard-10-oz', 'silver-bar-standard', '10 oz', 10, 311.04, 311.04, 10.0),
    ('silver-bar-standard-1-kg', 'silver-bar-standard', '1 kg', 32.15, 1000, 1000, 32.15)
on conflict (id) do update set
    product_id = excluded.product_id,
    name = excluded.name,
    fine_metal_oz = excluded.fine_metal_oz,
    fine_metal_g = excluded.fine_metal_g,
    gross_weight_g = excluded.gross_weight_g,
    sort_order = excluded.sort_order;
;
