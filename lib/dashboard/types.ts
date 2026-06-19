export type PensionAccountRow = {
    id: string
    provider_name: string
    current_value: number | string | null
}

export type PensionContributionRow = {
    pension_account_id: string
    contribution_value: number | string | null
    contribution_date: string | null
}

export type PensionValueRow = {
    pension_account_id: string
    value_amount: number | string | null
    value_date: string | null
    created_at: string
}

export type BudgetProfileRow = {
    employer_name: string | null
    monthly_net_salary: number | string | null
}

export type BudgetExpenditureRow = {
    id: string
    expenditure_name: string | null
    monthly_amount: number | string | null
}

export type BudgetCapitalRow = {
    id: string
    capital_name: string | null
    monthly_amount: number | string | null
}

export type SavingsAccountRow = {
    id: string
    name: string
    created_at: string
}

export type SavingsPotRow = {
    id: string
    account_id: string
    name: string
    balance: number | string | null
    target_amount: number | string | null
    created_at: string
}

export type SavingsHistoryRow = {
    id: string
    pot_id: string
    amount: number | string | null
    date: string | null
    name: string | null
    created_at: string
}

export type DebtEntryRow = {
    id: string
    amount: number | string | null
}

export type CryptoAssetRow = {
    id: string
    ticker: string
    name: string
    amount: number | string | null
    usd: number | string | null
    invested_gbp: number | string | null
    created_at: string
}

export type BullionHoldingRow = {
    id: string
    title?: string | null
    description?: string | null
    metal?: string | null
    type?: string | null
    country?: string | null
    weight_per_item_grams?: number | string | null
    purchase_value?: number | string | null
    purchase_currency?: string | null
    amount?: number | string | null
    tax_rate_pct?: number | string | null
    tax_amount?: number | string | null
    total_price_incl_tax?: number | string | null
    market_premium_pct?: number | string | null
}

export type InvestmentAccountRow = {
    id: string
    name: string | null
    type: string | null
    tax_status: string | null
}

export type InvestmentHoldingRow = {
    id: string
    account_id?: string | null
    ticker?: string | null
    name?: string | null
    invested_amount?: number | string | null
    current_value: number | string | null
}

export type InvestmentAccountTransactionRow = {
    account_id: string | null
    holding_id: string | null
    invested_amount_impact?: number | string | null
    current_value_impact: number | string | null
    transaction_date?: string | null
}

export type RealEstatePropertyRow = {
    id: string
    name?: string | null
    address?: string | null
    estimated_value?: number | string | null
    current_value?: number | string | null
    market_value?: number | string | null
    mortgage_balance?: number | string | null
}

export type ValueSnapshot = {
    amount: number
    valueDate: string
    createdAt: string
}

export type DashboardAsset = {
    name: string
    value: number
    allocation: number
}

export type DashboardPensionAccount = {
    id: string
    name: string
    value: number
    pnl: number
    pnlPercentage: number
    contributionTotal: number
    latestValueDate: string | null
}

export type DashboardPensionChartPoint = {
    month: string
    label: string
    current: number
    comparison: number
    contributions: number
}

export type DashboardBudgetProfile = {
    employerName: string
    monthlyNetSalary: number
}

export type DashboardBudgetExpenditure = {
    id: string
    name: string
    amount: number
}

export type DashboardBudgetCapital = {
    id: string
    name: string
    amount: number
}

export type DashboardSavingsPot = {
    id: string
    name: string
    balance: number
    targetAmount: number | null
}

export type DashboardSavingsChartPoint = {
    month: string
    label: string
    current: number
}

export type DashboardSavingsAccount = {
    id: string
    name: string
    totalValue: number
    totalPnl: number
    totalPnlPercentage: number
    pots: DashboardSavingsPot[]
}

export type DashboardDataSnapshot = {
    portfolio: {
        totalAssets: number
        assetsWithAllocation: DashboardAsset[]
        startOfYearValue: number
        ytdPnl: number
        ytdPercentage: number
    }
    crypto: {
        assets: {
            id: string
            ticker: string
            name: string
            amount: number
            usd: number
            investedGbp: number
        }[]
        totalValue: number
        totalInvested: number
        loadError: boolean
    }
    bullion: {
        holdings: {
            id: string
            title: string | null
            description: string | null
            metal: string
            type: string | null
            country: string | null
            amount: number
            weightPerItemGrams: number
            investedGbp: number
            marketPremiumPct: number
        }[]
        totalInvested: number
        loadError: boolean
    }
    investments: {
        holdings: {
            id: string
            accountId: string | null
            accountName: string | null
            ticker: string | null
            name: string | null
            investedAmount: number
            currentValue: number
        }[]
        totalValue: number
        totalInvested: number
        loadError: boolean
    }
    realEstate: {
        properties: {
            id: string
            name: string
            address: string | null
            value: number
            mortgage: number
            equity: number
        }[]
        totalValue: number
        totalMortgage: number
        totalEquity: number
        loadError: boolean
    }
    pension: {
        accounts: DashboardPensionAccount[]
        totalValue: number
        totalPnl: number
        totalPnlPercentage: number
        chartData: DashboardPensionChartPoint[]
        comparisonLabel: string
        loadError: boolean
    }
    budget: {
        profile: DashboardBudgetProfile
        expenditures: DashboardBudgetExpenditure[]
        capital: DashboardBudgetCapital[]
        totalExpenditure: number
        totalCapital: number
        committedOutgoingRatio: number
        annualNetSalary: number
        disposableIncome: number
        loadError: boolean
    }
    savings: {
        accounts: DashboardSavingsAccount[]
        totalValue: number
        chartData: DashboardSavingsChartPoint[]
        loadError: boolean
    }
    debt: {
        totalDebt: number
        debtCount: number
        loadError: boolean
    }
}

export type BuildDashboardSnapshotInput = {
    pensionAccounts?: PensionAccountRow[] | null
    pensionContributions?: PensionContributionRow[] | null
    pensionValues?: PensionValueRow[] | null
    pensionLoadError?: boolean
    budgetProfile?: BudgetProfileRow | null
    budgetExpenditures?: BudgetExpenditureRow[] | null
    budgetCapital?: BudgetCapitalRow[] | null
    budgetLoadError?: boolean
    savingsAccounts?: SavingsAccountRow[] | null
    savingsPots?: SavingsPotRow[] | null
    savingsHistory?: SavingsHistoryRow[] | null
    savingsLoadError?: boolean
    debtEntries?: DebtEntryRow[] | null
    debtLoadError?: boolean
    cryptoAssets?: CryptoAssetRow[] | null
    cryptoLoadError?: boolean
    bullionHoldings?: BullionHoldingRow[] | null
    bullionLoadError?: boolean
    investmentAccounts?: InvestmentAccountRow[] | null
    investmentHoldings?: InvestmentHoldingRow[] | null
    investmentAccountTransactions?: InvestmentAccountTransactionRow[] | null
    investmentLoadError?: boolean
    realEstateProperties?: RealEstatePropertyRow[] | null
    realEstateLoadError?: boolean
}
