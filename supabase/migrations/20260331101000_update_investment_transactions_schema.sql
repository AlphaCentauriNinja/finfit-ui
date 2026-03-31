-- Update investment_transactions table to support account-level entries
ALTER TABLE public.investment_transactions 
    ADD COLUMN account_id uuid REFERENCES public.investment_accounts(id) ON DELETE CASCADE;

-- Update existing rows to link account_id based on holding_id
UPDATE public.investment_transactions tx
SET account_id = h.account_id
FROM public.investment_holdings h
WHERE tx.holding_id = h.id;

-- Make account_id NOT NULL for future entries
ALTER TABLE public.investment_transactions 
    ALTER COLUMN account_id SET NOT NULL;

-- Make holding_id NULLABLE to support account-only transactions (deposits/withdrawals)
ALTER TABLE public.investment_transactions 
    ALTER COLUMN holding_id DROP NOT NULL;

-- Create index for performance
CREATE INDEX idx_investment_transactions_account_id ON public.investment_transactions(account_id);
