import { toNumber } from '@/lib/utils/number'
import type { InvestmentAccountRow, InvestmentHoldingRow, InvestmentAccountTransactionRow } from '../types'

export const buildInvestmentsSnapshot = (
    investmentAccounts: InvestmentAccountRow[],
    investmentHoldings: InvestmentHoldingRow[],
    investmentAccountTransactions: InvestmentAccountTransactionRow[]
) => {
    const investmentAccountNameById = new Map(
        investmentAccounts.map((account) => [account.id, (account.name ?? '').trim() || null] as const)
    )

    const investmentHoldingsSummary = investmentHoldings.map((holding) => {
        const investedAmount = toNumber(holding.invested_amount ?? 0)
        const currentValue = toNumber(holding.current_value)

        return {
            id: holding.id,
            accountId: holding.account_id ?? null,
            accountName: holding.account_id ? (investmentAccountNameById.get(holding.account_id) ?? null) : null,
            ticker: (holding.ticker ?? '').trim() || null,
            name: (holding.name ?? '').trim() || null,
            investedAmount: Number.isFinite(investedAmount) ? investedAmount : 0,
            currentValue: Number.isFinite(currentValue) ? currentValue : 0,
        }
    })

    const accountLevelInvestmentCurrentValue = investmentAccountTransactions.reduce((sum, tx) => {
        if (tx.holding_id) return sum
        return sum + toNumber(tx.current_value_impact)
    }, 0)
    const accountLevelInvestmentInvested = investmentAccountTransactions.reduce((sum, tx) => {
        if (tx.holding_id) return sum
        return sum + toNumber(tx.invested_amount_impact)
    }, 0)

    const holdingsInvestmentCurrentValue = investmentHoldingsSummary.reduce((sum, holding) => sum + holding.currentValue, 0)
    const holdingsInvestmentInvested = investmentHoldingsSummary.reduce((sum, holding) => sum + holding.investedAmount, 0)
    const totalInvestmentsCurrentValue = holdingsInvestmentCurrentValue + accountLevelInvestmentCurrentValue
    const totalInvestmentsInvested = holdingsInvestmentInvested + accountLevelInvestmentInvested

    return {
        holdings: investmentHoldingsSummary,
        totalValue: totalInvestmentsCurrentValue,
        totalInvested: totalInvestmentsInvested,
    }
}
