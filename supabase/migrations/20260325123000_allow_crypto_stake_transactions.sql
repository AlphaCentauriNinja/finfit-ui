alter table public.crypto_transactions
    drop constraint if exists crypto_transactions_transaction_type_check;

alter table public.crypto_transactions
    drop constraint if exists crypto_transactions_total_value_gbp_check;

alter table public.crypto_transactions
    alter column total_value_gbp drop not null;

alter table public.crypto_transactions
    add constraint crypto_transactions_transaction_type_check
    check (transaction_type in ('BUY', 'SELL', 'STAKE'));

alter table public.crypto_transactions
    add constraint crypto_transactions_total_value_gbp_check
    check (
        (transaction_type = 'STAKE' and total_value_gbp is null)
        or (transaction_type in ('BUY', 'SELL') and total_value_gbp is not null and total_value_gbp > 0)
    );
