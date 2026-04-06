-- Create RPC to update investment holding totals
CREATE OR REPLACE FUNCTION public.update_investment_holding_totals(
    target_holding_id uuid,
    v_invested_impact numeric,
    v_current_impact numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.investment_holdings
    SET 
        invested_amount = invested_amount + v_invested_impact,
        current_value = current_value + v_current_impact,
        updated_at = now()
    WHERE id = target_holding_id;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.update_investment_holding_totals TO authenticated;
