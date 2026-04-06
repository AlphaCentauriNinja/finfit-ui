-- Real estate transactions table for tracking mortgage payments and adjustments
CREATE TABLE public.real_estate_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id uuid REFERENCES public.real_estate_properties(id) ON DELETE CASCADE NOT NULL,
    transaction_type text NOT NULL CHECK (transaction_type IN ('PAYMENT', 'ADJUSTMENT')),
    amount numeric(15,2) NOT NULL,
    invested_amount_impact numeric(15,2) DEFAULT 0 NOT NULL,
    current_value_impact numeric(15,2) DEFAULT 0 NOT NULL,
    transaction_date date DEFAULT CURRENT_DATE NOT NULL,
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.real_estate_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own real estate transactions"
    ON public.real_estate_transactions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_re_transactions_user_id ON public.real_estate_transactions(user_id);
CREATE INDEX idx_re_transactions_property_id ON public.real_estate_transactions(property_id);
