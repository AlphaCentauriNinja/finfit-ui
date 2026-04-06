alter table public.bullion_holdings
    add column if not exists catalog_product_id text,
    add column if not exists catalog_variant_id text;

create index if not exists bullion_holdings_catalog_product_id_idx
    on public.bullion_holdings (catalog_product_id);

create index if not exists bullion_holdings_catalog_variant_id_idx
    on public.bullion_holdings (catalog_variant_id);

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_catalog_variants'::regclass
          and conname = 'bullion_catalog_variants_product_id_id_key'
    ) then
        alter table public.bullion_catalog_variants
            add constraint bullion_catalog_variants_product_id_id_key unique (product_id, id);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_catalog_product_id_fkey'
    ) then
        alter table public.bullion_holdings
            add constraint bullion_holdings_catalog_product_id_fkey
                foreign key (catalog_product_id)
                references public.bullion_catalog_products(id);
    end if;
end $$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_catalog_variant_id_fkey'
    ) then
        alter table public.bullion_holdings
            add constraint bullion_holdings_catalog_variant_id_fkey
                foreign key (catalog_variant_id)
                references public.bullion_catalog_variants(id);
    end if;
end $$;

do $$
begin
    if exists (
        select 1
        from public.bullion_holdings
        where catalog_product_id is null
           or catalog_variant_id is null
    ) then
        raise exception 'bullion_holdings contains rows without catalog references. Backfill catalog_product_id and catalog_variant_id before enforcing the schema.';
    end if;
end $$;

do $$
begin
    if exists (
        select 1
        from public.bullion_holdings h
        left join public.bullion_catalog_variants v
            on v.id = h.catalog_variant_id
           and v.product_id = h.catalog_product_id
        where v.id is null
    ) then
        raise exception 'bullion_holdings contains product and variant references that do not match each other.';
    end if;
end $$;

do $$
begin
    if exists (
        select 1
        from public.bullion_holdings h
        join public.bullion_catalog_products p
            on p.id = h.catalog_product_id
        where p.metal <> h.metal
           or p.type <> h.type
    ) then
        raise exception 'bullion_holdings contains metal/type values that do not match the referenced bullion catalog product.';
    end if;
end $$;

alter table public.bullion_holdings
    alter column catalog_product_id set not null,
    alter column catalog_variant_id set not null;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.bullion_holdings'::regclass
          and conname = 'bullion_holdings_catalog_product_variant_fkey'
    ) then
        alter table public.bullion_holdings
            add constraint bullion_holdings_catalog_product_variant_fkey
                foreign key (catalog_product_id, catalog_variant_id)
                references public.bullion_catalog_variants(product_id, id);
    end if;
end $$;

create or replace function public.validate_bullion_holding_catalog_snapshot()
returns trigger
language plpgsql
as $$
declare
    referenced_product record;
begin
    select metal, type
    into referenced_product
    from public.bullion_catalog_products
    where id = new.catalog_product_id;

    if not found then
        raise exception 'Referenced bullion catalog product % does not exist.', new.catalog_product_id;
    end if;

    if referenced_product.metal <> new.metal then
        raise exception 'Bullion holding metal % does not match catalog product metal %.', new.metal, referenced_product.metal;
    end if;

    if referenced_product.type <> new.type then
        raise exception 'Bullion holding type % does not match catalog product type %.', new.type, referenced_product.type;
    end if;

    return new;
end;
$$;

drop trigger if exists validate_bullion_holding_catalog_snapshot on public.bullion_holdings;

create trigger validate_bullion_holding_catalog_snapshot
    before insert or update on public.bullion_holdings
    for each row
    execute function public.validate_bullion_holding_catalog_snapshot();
