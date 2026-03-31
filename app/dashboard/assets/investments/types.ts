export type InvestmentAccountType = 'ISA' | 'INVEST'
export type InvestmentAccountTaxStatus = 'TAX-FREE' | 'TAXED'

export type InvestmentAccountDbRow = {
    id: string
    user_id: string
    name: string
    type: InvestmentAccountType
    tax_status: InvestmentAccountTaxStatus
    created_at: string
}

export type InvestmentHoldingDbRow = {
    id: string
    account_id: string
    user_id: string
    ticker: string
    name: string
    invested_amount: number
    current_value: number
    created_at: string
    updated_at: string
}

export type InvestmentHoldingRow = {
    id: string
    accountId: string
    ticker: string
    name: string
    investedAmount: number
    currentValue: number
}

export type InvestmentAccountCardData = {
    id: string
    name: string
    type: InvestmentAccountType
    taxStatus: InvestmentAccountTaxStatus
    holdings: InvestmentHoldingRow[]
    totalInvested: number
    totalCurrentValue: number
    pnl: number
    pnlPct: number
}
