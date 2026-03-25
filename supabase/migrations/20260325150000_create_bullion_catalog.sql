create table if not exists public.bullion_catalog_products (
    id text primary key,
    metal text not null check (metal in ('GOLD', 'SILVER')),
    type text not null check (type in ('COIN', 'BAR')),
    name text not null,
    country text,
    purity numeric,
    fine_metal_oz numeric,
    fine_metal_g numeric,
    gross_weight_g numeric,
    liquidity_tier integer,
    sort_order integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (metal, type, name)
);

create table if not exists public.bullion_catalog_variants (
    id text primary key,
    product_id text not null references public.bullion_catalog_products(id) on delete cascade,
    name text not null,
    fine_metal_oz numeric,
    fine_metal_g numeric,
    gross_weight_g numeric,
    sort_order integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (product_id, name)
);

create index if not exists bullion_catalog_products_lookup_idx
    on public.bullion_catalog_products (metal, type, sort_order, name);

create index if not exists bullion_catalog_variants_lookup_idx
    on public.bullion_catalog_variants (product_id, sort_order, name);

alter table public.bullion_catalog_products enable row level security;
alter table public.bullion_catalog_variants enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'bullion_catalog_products'
          and policyname = 'Authenticated users can view bullion catalog products'
    ) then
        create policy "Authenticated users can view bullion catalog products"
            on public.bullion_catalog_products
            for select
            to authenticated
            using (true);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'bullion_catalog_variants'
          and policyname = 'Authenticated users can view bullion catalog variants'
    ) then
        create policy "Authenticated users can view bullion catalog variants"
            on public.bullion_catalog_variants
            for select
            to authenticated
            using (true);
    end if;
end $$;

insert into public.bullion_catalog_products (
    id,
    metal,
    type,
    name,
    country,
    purity,
    fine_metal_oz,
    fine_metal_g,
    gross_weight_g,
    liquidity_tier,
    sort_order
)
values
    ('gold-coin-british-gold-sovereign', 'GOLD', 'COIN', 'British Gold Sovereign', 'United Kingdom', 0.9167, 0.2354, 7.322, 7.98, 1, 1),
    ('gold-coin-british-gold-britannia', 'GOLD', 'COIN', 'British Gold Britannia', 'UK', 0.9999, null, null, null, 1, 2),
    ('gold-coin-american-gold-eagle', 'GOLD', 'COIN', 'American Gold Eagle', 'USA', 0.9167, null, null, null, 1, 3),
    ('gold-coin-american-gold-buffalo', 'GOLD', 'COIN', 'American Gold Buffalo', 'USA', 0.9999, null, null, null, 1, 4),
    ('gold-coin-canadian-gold-maple-leaf', 'GOLD', 'COIN', 'Canadian Gold Maple Leaf', 'Canada', 0.9999, null, null, null, 1, 5),
    ('gold-coin-krugerrand-gold', 'GOLD', 'COIN', 'Krugerrand Gold', 'South Africa', 0.9167, null, null, null, 1, 6),
    ('gold-coin-austrian-philharmonic-gold', 'GOLD', 'COIN', 'Austrian Philharmonic Gold', 'Austria', 0.9999, null, null, null, 1, 7),
    ('gold-coin-chinese-gold-panda', 'GOLD', 'COIN', 'Chinese Gold Panda', 'China', 0.999, null, null, null, 1, 8),
    ('silver-coin-american-silver-eagle', 'SILVER', 'COIN', 'American Silver Eagle', 'USA', 0.999, null, null, null, 1, 9),
    ('silver-coin-canadian-silver-maple-leaf', 'SILVER', 'COIN', 'Canadian Silver Maple Leaf', 'Canada', 0.9999, null, null, null, 1, 10),
    ('silver-coin-british-silver-britannia', 'SILVER', 'COIN', 'British Silver Britannia', 'UK', 0.999, null, null, null, 1, 11),
    ('silver-coin-austrian-silver-philharmonic', 'SILVER', 'COIN', 'Austrian Silver Philharmonic', 'Austria', 0.999, null, null, null, 1, 12),
    ('silver-coin-australian-silver-kangaroo', 'SILVER', 'COIN', 'Australian Silver Kangaroo', 'Australia', 0.9999, null, null, null, 1, 13),
    ('silver-coin-chinese-silver-panda', 'SILVER', 'COIN', 'Chinese Silver Panda', 'China', 0.999, null, null, null, 1, 14),
    ('gold-bar-standard', 'GOLD', 'BAR', 'Gold Bar', null, null, null, null, null, null, 1),
    ('silver-bar-standard', 'SILVER', 'BAR', 'Silver Bar', null, null, null, null, null, null, 2)
on conflict (id) do update set
    metal = excluded.metal,
    type = excluded.type,
    name = excluded.name,
    country = excluded.country,
    purity = excluded.purity,
    fine_metal_oz = excluded.fine_metal_oz,
    fine_metal_g = excluded.fine_metal_g,
    gross_weight_g = excluded.gross_weight_g,
    liquidity_tier = excluded.liquidity_tier,
    sort_order = excluded.sort_order;

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
    ('gold-coin-british-gold-sovereign-full-sovereign', 'gold-coin-british-gold-sovereign', 'Full Sovereign', 0.2354, 7.322, 7.98, 1),
    ('gold-coin-british-gold-sovereign-half-sovereign', 'gold-coin-british-gold-sovereign', 'Half Sovereign', 0.1177, 3.661, 3.99, 2),
    ('gold-coin-british-gold-sovereign-quarter-sovereign', 'gold-coin-british-gold-sovereign', 'Quarter Sovereign', 0.0588, 1.830, 1.994, 3),
    ('gold-coin-british-gold-sovereign-double-sovereign', 'gold-coin-british-gold-sovereign', 'Double Sovereign', 0.4708, 14.644, 15.96, 4),
    ('gold-coin-british-gold-sovereign-five-sovereign', 'gold-coin-british-gold-sovereign', 'Five Sovereign', 1.177, 36.61, 39.9, 5),
    ('gold-coin-british-gold-britannia-1-oz', 'gold-coin-british-gold-britannia', '1 oz', 1, 31.1035, 31.107, 1),
    ('gold-coin-british-gold-britannia-1-2-oz', 'gold-coin-british-gold-britannia', '1/2 oz', 0.5, 15.5517, 15.553, 2),
    ('gold-coin-british-gold-britannia-1-4-oz', 'gold-coin-british-gold-britannia', '1/4 oz', 0.25, 7.7759, 7.777, 3),
    ('gold-coin-british-gold-britannia-1-10-oz', 'gold-coin-british-gold-britannia', '1/10 oz', 0.1, 3.1103, 3.111, 4),
    ('gold-coin-american-gold-eagle-1-oz', 'gold-coin-american-gold-eagle', '1 oz', 1, 31.1035, 33.93, 1),
    ('gold-coin-american-gold-eagle-1-2-oz', 'gold-coin-american-gold-eagle', '1/2 oz', 0.5, 15.5517, 16.965, 2),
    ('gold-coin-american-gold-eagle-1-4-oz', 'gold-coin-american-gold-eagle', '1/4 oz', 0.25, 7.7759, 8.482, 3),
    ('gold-coin-american-gold-eagle-1-10-oz', 'gold-coin-american-gold-eagle', '1/10 oz', 0.1, 3.1103, 3.393, 4),
    ('gold-coin-american-gold-buffalo-1-oz', 'gold-coin-american-gold-buffalo', '1 oz', 1, 31.1035, 31.107, 1),
    ('gold-coin-canadian-gold-maple-leaf-1-oz', 'gold-coin-canadian-gold-maple-leaf', '1 oz', 1, 31.1035, 31.107, 1),
    ('gold-coin-canadian-gold-maple-leaf-1-2-oz', 'gold-coin-canadian-gold-maple-leaf', '1/2 oz', 0.5, 15.5517, 15.553, 2),
    ('gold-coin-canadian-gold-maple-leaf-1-4-oz', 'gold-coin-canadian-gold-maple-leaf', '1/4 oz', 0.25, 7.7759, 7.777, 3),
    ('gold-coin-canadian-gold-maple-leaf-1-10-oz', 'gold-coin-canadian-gold-maple-leaf', '1/10 oz', 0.1, 3.1103, 3.111, 4),
    ('gold-coin-canadian-gold-maple-leaf-1-20-oz', 'gold-coin-canadian-gold-maple-leaf', '1/20 oz', 0.05, 1.5552, 1.555, 5),
    ('gold-coin-canadian-gold-maple-leaf-1-100-oz', 'gold-coin-canadian-gold-maple-leaf', '1/100 oz', 0.01, 0.311, 0.311, 6),
    ('gold-coin-krugerrand-gold-1-oz', 'gold-coin-krugerrand-gold', '1 oz', 1, 31.1035, 33.93, 1),
    ('gold-coin-krugerrand-gold-1-2-oz', 'gold-coin-krugerrand-gold', '1/2 oz', 0.5, 15.5517, 16.965, 2),
    ('gold-coin-krugerrand-gold-1-4-oz', 'gold-coin-krugerrand-gold', '1/4 oz', 0.25, 7.7759, 8.482, 3),
    ('gold-coin-krugerrand-gold-1-10-oz', 'gold-coin-krugerrand-gold', '1/10 oz', 0.1, 3.1103, 3.393, 4),
    ('gold-coin-austrian-philharmonic-gold-1-oz', 'gold-coin-austrian-philharmonic-gold', '1 oz', 1, 31.1035, 31.107, 1),
    ('gold-coin-austrian-philharmonic-gold-1-2-oz', 'gold-coin-austrian-philharmonic-gold', '1/2 oz', 0.5, 15.5517, 15.553, 2),
    ('gold-coin-austrian-philharmonic-gold-1-4-oz', 'gold-coin-austrian-philharmonic-gold', '1/4 oz', 0.25, 7.7759, 7.777, 3),
    ('gold-coin-austrian-philharmonic-gold-1-10-oz', 'gold-coin-austrian-philharmonic-gold', '1/10 oz', 0.1, 3.1103, 3.111, 4),
    ('gold-coin-austrian-philharmonic-gold-1-20-oz', 'gold-coin-austrian-philharmonic-gold', '1/20 oz', 0.05, 1.5552, 1.555, 5),
    ('gold-coin-chinese-gold-panda-30-g', 'gold-coin-chinese-gold-panda', '30 g', 0.9645, 30, 30.03, 1),
    ('gold-coin-chinese-gold-panda-15-g', 'gold-coin-chinese-gold-panda', '15 g', 0.4823, 15, 15.015, 2),
    ('gold-coin-chinese-gold-panda-8-g', 'gold-coin-chinese-gold-panda', '8 g', 0.2572, 8, 8.008, 3),
    ('gold-coin-chinese-gold-panda-3-g', 'gold-coin-chinese-gold-panda', '3 g', 0.0965, 3, 3.003, 4),
    ('gold-coin-chinese-gold-panda-1-g', 'gold-coin-chinese-gold-panda', '1 g', 0.0321, 1, 1.001, 5),
    ('silver-coin-american-silver-eagle-1-oz', 'silver-coin-american-silver-eagle', '1 oz', 1, 31.1035, 31.135, 1),
    ('silver-coin-canadian-silver-maple-leaf-1-oz', 'silver-coin-canadian-silver-maple-leaf', '1 oz', 1, 31.1035, 31.107, 1),
    ('silver-coin-british-silver-britannia-1-oz', 'silver-coin-british-silver-britannia', '1 oz', 1, 31.1035, 31.135, 1),
    ('silver-coin-austrian-silver-philharmonic-1-oz', 'silver-coin-austrian-silver-philharmonic', '1 oz', 1, 31.1035, 31.135, 1),
    ('silver-coin-australian-silver-kangaroo-1-oz', 'silver-coin-australian-silver-kangaroo', '1 oz', 1, 31.1035, 31.107, 1),
    ('silver-coin-chinese-silver-panda-30-g', 'silver-coin-chinese-silver-panda', '30 g', 0.9645, 30, 30.03, 1),
    ('gold-bar-standard-1-g', 'gold-bar-standard', '1 g', 0.0321, 1, 1, 1),
    ('gold-bar-standard-2-5-g', 'gold-bar-standard', '2.5 g', 0.0804, 2.5, 2.5, 2),
    ('gold-bar-standard-5-g', 'gold-bar-standard', '5 g', 0.1607, 5, 5, 3),
    ('gold-bar-standard-10-g', 'gold-bar-standard', '10 g', 0.3215, 10, 10, 4),
    ('gold-bar-standard-20-g', 'gold-bar-standard', '20 g', 0.643, 20, 20, 5),
    ('gold-bar-standard-50-g', 'gold-bar-standard', '50 g', 1.6075, 50, 50, 6),
    ('gold-bar-standard-100-g', 'gold-bar-standard', '100 g', 3.215, 100, 100, 7),
    ('gold-bar-standard-250-g', 'gold-bar-standard', '250 g', 8.0375, 250, 250, 8),
    ('gold-bar-standard-500-g', 'gold-bar-standard', '500 g', 16.075, 500, 500, 9),
    ('gold-bar-standard-1000-g', 'gold-bar-standard', '1000 g', 32.15, 1000, 1000, 10),
    ('gold-bar-standard-1-tola', 'gold-bar-standard', '1 tola', 0.375, 11.6638, 11.6638, 11),
    ('gold-bar-standard-5-tola', 'gold-bar-standard', '5 tola', 1.875, 58.319, 58.319, 12),
    ('gold-bar-standard-10-tola', 'gold-bar-standard', '10 tola', 3.75, 116.638, 116.638, 13),
    ('silver-bar-standard-50-g', 'silver-bar-standard', '50 g', 1.6075, 50, 50, 1),
    ('silver-bar-standard-100-g', 'silver-bar-standard', '100 g', 3.215, 100, 100, 2),
    ('silver-bar-standard-250-g', 'silver-bar-standard', '250 g', 8.0375, 250, 250, 3),
    ('silver-bar-standard-500-g', 'silver-bar-standard', '500 g', 16.075, 500, 500, 4),
    ('silver-bar-standard-1000-g', 'silver-bar-standard', '1000 g', 32.15, 1000, 1000, 5),
    ('silver-bar-standard-1-oz', 'silver-bar-standard', '1 oz', 1, 31.1035, 31.1035, 6),
    ('silver-bar-standard-5-oz', 'silver-bar-standard', '5 oz', 5, 155.517, 155.517, 7),
    ('silver-bar-standard-10-oz', 'silver-bar-standard', '10 oz', 10, 311.035, 311.035, 8),
    ('silver-bar-standard-100-oz', 'silver-bar-standard', '100 oz', 100, 3110.35, 3110.35, 9),
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
