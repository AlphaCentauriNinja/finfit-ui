import { toNumber } from '@/lib/utils/number'
import type { BuildDashboardSnapshotInput, DashboardDataSnapshot, DashboardAsset } from './dashboard/types'

import { buildPensionSnapshot } from './dashboard/builders/pension'
import { buildBudgetSnapshot } from './dashboard/builders/budget'
import { buildSavingsSnapshot } from './dashboard/builders/savings'
import { buildCryptoSnapshot } from './dashboard/builders/crypto'
import { buildBullionSnapshot } from './dashboard/builders/bullion'
import { buildInvestmentsSnapshot } from './dashboard/builders/investments'
import { buildRealEstateSnapshot } from './dashboard/builders/real-estate'
import { buildDebtSnapshot } from './dashboard/builders/debt'
import { getTodayIso, parseDayKey } from './dashboard/builders/utils'

export * from './dashboard/types'

export const buildDashboardSnapshot = ({
    pensionAccounts,
    pensionContributions,
    pensionValues,
    pensionLoadError = false,
    budgetProfile,
    budgetExpenditures,
    budgetCapital,
    budgetLoadError = false,
    savingsAccounts = [],
    savingsPots = [],
    savingsHistory = [],
    savingsLoadError = false,
    debtEntries = [],
    debtLoadError = false,
    cryptoAssets = [],
    cryptoLoadError = false,
    bullionHoldings = [],
    bullionLoadError = false,
    investmentAccounts = [],
    investmentHoldings = [],
    investmentAccountTransactions = [],
    investmentLoadError = false,
    realEstateProperties = [],
    realEstateLoadError = false,
}: BuildDashboardSnapshotInput): DashboardDataSnapshot => {

    const pension = buildPensionSnapshot(pensionAccounts ?? [], pensionContributions ?? [], pensionValues ?? [])
    const budget = buildBudgetSnapshot(budgetProfile, budgetExpenditures ?? [], budgetCapital ?? [])
    const savings = buildSavingsSnapshot(savingsAccounts ?? [], savingsPots ?? [], savingsHistory ?? [])
    const crypto = buildCryptoSnapshot(cryptoAssets ?? [])
    const bullion = buildBullionSnapshot(bullionHoldings ?? [])
    const investments = buildInvestmentsSnapshot(investmentAccounts ?? [], investmentHoldings ?? [], investmentAccountTransactions ?? [])
    const realEstate = buildRealEstateSnapshot(realEstateProperties ?? [])
    const debt = buildDebtSnapshot(debtEntries ?? [])

    const mergedAssets = [
        { name: 'Pension', value: pension.totalValue },
        { name: 'Savings', value: savings.totalValue },
        { name: 'Investments', value: investments.totalValue },
        { name: 'Crypto', value: crypto.totalValue },
        { name: 'Bullion', value: bullion.totalInvested },
        { name: 'Real Estate', value: realEstate.totalEquity },
    ]

    const totalAssets = mergedAssets.reduce((sum, asset) => sum + asset.value, 0)
    const assetsWithAllocation: DashboardAsset[] = mergedAssets.map((asset) => ({
        ...asset,
        allocation: totalAssets > 0 ? (asset.value / totalAssets) * 100 : 0,
    }))

    // YTD Portfolio start of year calculations
    const todayIso = getTodayIso()
    const currentYear = todayIso.slice(0, 4)
    const startOfYearDayKey = `${currentYear}-01-01`
    const startOfYearMonthKey = `${currentYear}-01`

    // Pension: uses the value snapshot at the start of the year
    const pensionStartOfYearValue = pension.getStartOfYearValue(startOfYearMonthKey)

    // Savings: total value minus flow since start of year
    const savingsFlowSinceStartOfYear = savings.transactions.reduce((sum, transaction) => {
        if (transaction.dayKey >= startOfYearDayKey) {
            return sum + transaction.amount
        }
        return sum
    }, 0)
    const savingsStartOfYearValue = savings.totalValue - savingsFlowSinceStartOfYear

    // Investments: total minus flows since start of year
    const investmentCurrentFlowSinceStartOfYear = (investmentAccountTransactions ?? []).reduce((sum, transaction) => {
        const dayKey = parseDayKey(transaction.transaction_date || '')
        if (!dayKey || dayKey < startOfYearDayKey) return sum
        return sum + toNumber(transaction.current_value_impact)
    }, 0)
    const investmentsStartOfYearValue = investments.totalValue - investmentCurrentFlowSinceStartOfYear

    const startOfYearValue =
        pensionStartOfYearValue +
        savingsStartOfYearValue +
        investmentsStartOfYearValue +
        crypto.totalValue +
        bullion.totalInvested +
        realEstate.totalEquity

    const ytdPnl = totalAssets - startOfYearValue
    const ytdPercentage = startOfYearValue > 0 ? (ytdPnl / startOfYearValue) * 100 : 0

    return {
        portfolio: {
            totalAssets,
            assetsWithAllocation,
            startOfYearValue,
            ytdPnl,
            ytdPercentage,
        },
        crypto: {
            ...crypto,
            loadError: cryptoLoadError,
        },
        bullion: {
            ...bullion,
            loadError: bullionLoadError,
        },
        investments: {
            ...investments,
            loadError: investmentLoadError,
        },
        realEstate: {
            ...realEstate,
            loadError: realEstateLoadError,
        },
        pension: {
            accounts: pension.accounts,
            totalValue: pension.totalValue,
            totalPnl: pension.totalPnl,
            totalPnlPercentage: pension.totalPnlPercentage,
            chartData: pension.chartData,
            comparisonLabel: pension.comparisonLabel,
            loadError: pensionLoadError,
        },
        budget: {
            ...budget,
            loadError: budgetLoadError,
        },
        savings: {
            accounts: savings.accounts,
            totalValue: savings.totalValue,
            chartData: savings.chartData,
            loadError: savingsLoadError,
        },
        debt: {
            ...debt,
            loadError: debtLoadError,
        },
    }
}
