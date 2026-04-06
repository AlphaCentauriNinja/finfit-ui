-- Create investment_transactions table
CREATE TABLE public.investment_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    holding_id uuid REFERENCES public.investment_holdings(id) ON DELETE CASCADE NOT NULL,
    transaction_type text NOT NULL CHECK (transaction_type IN ('BUY', 'SELL', 'ADJUSTMENT')),
    amount numeric(15,2) DEFAULT 0 NOT NULL,
    invested_amount_impact numeric(15,2) DEFAULT 0 NOT NULL,
    current_value_impact numeric(15,2) DEFAULT 0 NOT NULL,
    transaction_date date DEFAULT CURRENT_DATE NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own investment transactions."
    ON public.investment_transactions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_investment_transactions_holding_id ON public.investment_transactions(holding_id);
CREATE INDEX idx_investment_transactions_user_id ON public.investment_transactions(user_id);
