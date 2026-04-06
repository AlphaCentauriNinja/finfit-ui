-- Real estate properties table
CREATE TABLE public.real_estate_properties (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    address text,
    estimated_value numeric(15,2),
    current_value numeric(15,2),
    market_value numeric(15,2),
    mortgage_balance numeric(15,2),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.real_estate_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own properties"
    ON public.real_estate_properties
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_real_estate_user_id ON public.real_estate_properties(user_id);
