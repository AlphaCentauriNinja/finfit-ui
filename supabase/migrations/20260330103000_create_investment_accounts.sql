-- investment_accounts table
CREATE TABLE public.investment_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('ISA', 'INVEST')),
    tax_status text NOT NULL CHECK (tax_status IN ('TAX-FREE', 'TAXED')),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.investment_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own investment accounts."
    ON public.investment_accounts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- investment_holdings table
CREATE TABLE public.investment_holdings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id uuid REFERENCES public.investment_accounts(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ticker text NOT NULL,
    name text NOT NULL,
    invested_amount numeric(15,2) DEFAULT 0 NOT NULL,
    current_value numeric(15,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.investment_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own investment holdings."
    ON public.investment_holdings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
