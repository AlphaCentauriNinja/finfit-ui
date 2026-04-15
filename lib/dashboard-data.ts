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
    metal: string | null
    weight_per_item_grams: number | string | null
    purchase_value: number | string | null
    purchase_currency: string | null
    amount: number | string | null
    tax_rate_pct: number | string | null
    tax_amount: number | string | null
    total_price_incl_tax: number | string | null
}

export type InvestmentHoldingRow = {
    id: string
    current_value: number | string | null
}

export type InvestmentAccountTransactionRow = {
    account_id: string | null
    holding_id: string | null
    current_value_impact: number | string | null
    transaction_date?: string | null
}

export type RealEstatePropertyRow = {
    id: string
    estimated_value?: number | string | null
    current_value?: number | string | null
    market_value?: number | string | null
    mortgage_balance?: number | string | null
}

type ValueSnapshot = {
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
            metal: string
            amount: number
            weightPerItemGrams: number
            investedGbp: number
        }[]
        totalInvested: number
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

type BuildDashboardSnapshotInput = {
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
    investmentHoldings?: InvestmentHoldingRow[] | null
    investmentAccountTransactions?: InvestmentAccountTransactionRow[] | null
    investmentLoadError?: boolean
    realEstateProperties?: RealEstatePropertyRow[] | null
    realEstateLoadError?: boolean
}

const toNumber = (value: number | string | null | undefined): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const normalized = value
            .trim()
            .replace(/£/g, '')
            .replace(/,/g, '')
            .replace(/\s+/g, '')

        const parsed = Number(normalized)
        if (Number.isFinite(parsed)) return parsed
    }
    return Number(value ?? 0)
}

const getTodayIso = (): string => new Date().toISOString().slice(0, 10)

const formatMonthLabel = (monthKey: string, multiYear: boolean): string => {
    const [yearPart, monthPart] = monthKey.split('-')
    const year = Number(yearPart)
    const month = Number(monthPart)
    const date = new Date(year, month - 1, 1)
    if (Number.isNaN(date.getTime())) return monthKey
    const monthStr = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date).toUpperCase()
    if (!multiYear) return monthStr
    // Include short year suffix when data spans multiple calendar years
    return `${monthStr} '${String(year).slice(2)}`
}

const parseDayKey = (value: string): string | null => {
    const normalized = value.trim()

    const directMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (directMatch) {
        const year = Number(directMatch[1])
        const month = Number(directMatch[2])
        const day = Number(directMatch[3])
        if (year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${directMatch[1]}-${directMatch[2]}-${directMatch[3]}`
        }
    }

    const slashMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (slashMatch) {
        const day = Number(slashMatch[1])
        const month = Number(slashMatch[2])
        const year = Number(slashMatch[3])
        if (year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`
        }
    }

    const monthMap: Record<string, string> = {
        jan: '01',
        feb: '02',
        mar: '03',
        apr: '04',
        may: '05',
        jun: '06',
        jul: '07',
        aug: '08',
        sep: '09',
        oct: '10',
        nov: '11',
        dec: '12',
    }
    const longMatch = normalized.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/)
    if (longMatch) {
        const day = String(Number(longMatch[1])).padStart(2, '0')
        const monthToken = longMatch[2].slice(0, 3).toLowerCase()
        const month = monthMap[monthToken]
        const year = longMatch[3]
        if (month) {
            return `${year}-${month}-${day}`
        }
    }

    const parsed = new Date(normalized)
    if (Number.isNaN(parsed.getTime())) return null

    const year = parsed.getUTCFullYear()
    const month = String(parsed.getUTCMonth() + 1).padStart(2, '0')
    const day = String(parsed.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const formatDayLabel = (dayKey: string, multiYear: boolean): string => {
    const [yearPart, monthPart, dayPart] = dayKey.split('-')
    const year = Number(yearPart)
    const month = Number(monthPart)
    const day = Number(dayPart)
    const date = new Date(year, month - 1, day)
    if (Number.isNaN(date.getTime())) return dayKey
    const monthStr = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date)
    if (!multiYear) return `${dayPart} ${monthStr}`
    return `${dayPart} ${monthStr} '${String(year).slice(2)}`
}

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
    investmentHoldings = [],
    investmentAccountTransactions = [],
    investmentLoadError = false,
    realEstateProperties = [],
    realEstateLoadError = false,
}: BuildDashboardSnapshotInput): DashboardDataSnapshot => {
    const accountRows = pensionAccounts ?? []
    const contributionRows = pensionContributions ?? []
    const valueRows = pensionValues ?? []

    const contributionTotalsByAccount = contributionRows.reduce<Record<string, number>>(
        (acc, contribution) => {
            const parsedValue = toNumber(contribution.contribution_value)
            if (!Number.isFinite(parsedValue)) return acc

            acc[contribution.pension_account_id] = (acc[contribution.pension_account_id] ?? 0) + parsedValue
            return acc
        },
        {}
    )

    const valueSnapshotsByAccount = valueRows.reduce<Record<string, ValueSnapshot[]>>(
        (acc, valueRow) => {
            const parsedAmount = toNumber(valueRow.value_amount)
            if (!Number.isFinite(parsedAmount) || !valueRow.value_date) return acc

            if (!acc[valueRow.pension_account_id]) {
                acc[valueRow.pension_account_id] = []
            }

            acc[valueRow.pension_account_id].push({
                amount: parsedAmount,
                valueDate: valueRow.value_date,
                createdAt: valueRow.created_at,
            })

            return acc
        },
        {}
    )

    const latestValueByAccount: Record<string, ValueSnapshot> = {}
    const sortedSnapshotsByAccount: Record<string, ValueSnapshot[]> = {}

    Object.entries(valueSnapshotsByAccount).forEach(([accountId, snapshots]) => {
        const orderedSnapshots = [...snapshots].sort((a, b) => {
            if (a.valueDate !== b.valueDate) return a.valueDate.localeCompare(b.valueDate)
            return a.createdAt.localeCompare(b.createdAt)
        })

        sortedSnapshotsByAccount[accountId] = orderedSnapshots

        if (orderedSnapshots.length === 0) return
        latestValueByAccount[accountId] = orderedSnapshots[orderedSnapshots.length - 1]
    })


    const pensionAccountsSummary: DashboardPensionAccount[] = accountRows.map((account) => {
        const parsedAmount = toNumber(account.current_value)
        const snapshots = sortedSnapshotsByAccount[account.id] ?? []
        const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null
        const previousSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null
        const latestValue = latestSnapshot ?? latestValueByAccount[account.id]
        const contributionTotal = contributionTotalsByAccount[account.id] ?? 0
        const currentValue = latestValue
            ? latestValue.amount
            : (Number.isFinite(parsedAmount) ? parsedAmount : 0)

        let pnl = 0
        let pnlPercentage = 0

        if (contributionTotal > 0) {
            pnl = currentValue - contributionTotal
            pnlPercentage = (pnl / contributionTotal) * 100
        } else if (latestSnapshot && previousSnapshot) {
            pnl = latestSnapshot.amount - previousSnapshot.amount
            pnlPercentage = previousSnapshot.amount !== 0 ? (pnl / previousSnapshot.amount) * 100 : 0
        } else if (latestSnapshot && Number.isFinite(parsedAmount) && parsedAmount !== 0) {
            pnl = latestSnapshot.amount - parsedAmount
            pnlPercentage = (pnl / parsedAmount) * 100
        }

        return {
            id: account.id,
            name: account.provider_name,
            value: currentValue,
            pnl,
            pnlPercentage,
            contributionTotal,
            latestValueDate: latestValue?.valueDate ?? null,
        }
    })

    const totalPensionValue = pensionAccountsSummary.reduce((sum, pension) => sum + pension.value, 0)
    const totalPnl = pensionAccountsSummary.reduce((sum, pension) => sum + pension.pnl, 0)
    const totalContributions = pensionAccountsSummary.reduce((sum, pension) => sum + pension.contributionTotal, 0)
    const totalPnlPercentage = totalContributions > 0 ? (totalPnl / totalContributions) * 100 : 0

    const allDates = new Set<string>([getTodayIso()])

    contributionRows.forEach((contribution) => {
        if (contribution.contribution_date) {
            allDates.add(contribution.contribution_date)
        }
    })

    valueRows.forEach((valueRow) => {
        if (valueRow.value_date) {
            allDates.add(valueRow.value_date)
        }
    })

    const sortedDates = [...allDates].sort((a, b) => a.localeCompare(b))
    const sortedMonths = [...new Set(sortedDates.map((dateValue) => dateValue.slice(0, 7)))].sort((a, b) => a.localeCompare(b))

    // Build cumulative contributions per month
    const contributionsByMonth: Record<string, number> = {}
    for (const contribution of contributionRows) {
        const month = contribution.contribution_date?.slice(0, 7)
        if (!month) continue
        const value = toNumber(contribution.contribution_value)
        if (!Number.isFinite(value)) continue
        contributionsByMonth[month] = (contributionsByMonth[month] ?? 0) + value
    }
    const cumulativeContributionsAtMonth = (monthKey: string): number => {
        let total = 0
        for (const m of sortedMonths) {
            if (m > monthKey) break
            total += contributionsByMonth[m] ?? 0
        }
        return total
    }

    const pensionBeeAccountIds = pensionAccountsSummary
        .filter((pension) => pension.name.toLowerCase().includes('pensionbee'))
        .map((pension) => pension.id)
    const comparisonAccountIds = pensionBeeAccountIds.length > 0
        ? pensionBeeAccountIds
        : (pensionAccountsSummary[0] ? [pensionAccountsSummary[0].id] : [])
    const comparisonLabel = pensionBeeAccountIds.length > 0
        ? 'PENSIONBEE'
        : (pensionAccountsSummary[0]?.name ? pensionAccountsSummary[0].name.toUpperCase() : 'BENCHMARK')

    // Returns null when no value snapshot exists at or before `monthKey`.
    // Using null avoids polluting the chart with the account's creation/seed value
    // for months that pre-date any real value entry.
    const valueAtMonth = (accountId: string, monthKey: string): number | null => {
        const snapshots = sortedSnapshotsByAccount[accountId] ?? []
        let accountValue: number | null = null

        for (const snapshot of snapshots) {
            if (snapshot.valueDate.slice(0, 7) <= monthKey) {
                accountValue = snapshot.amount
            } else {
                break
            }
        }

        return accountValue
    }

    // Determine if data spans more than one calendar year so labels include the year
    const yearsInData = new Set(sortedMonths.map((m) => m.slice(0, 4)))
    const multiYear = yearsInData.size > 1

    // Carry-forward accumulator: when a month has no new snapshot we use the last
    // known total rather than dropping to 0.
    let lastKnownTotal = 0

    const chartData = sortedMonths.reduce<DashboardPensionChartPoint[]>((acc, monthKey) => {
        const contributions = cumulativeContributionsAtMonth(monthKey)

        const accountValues = pensionAccountsSummary.map((pension) => valueAtMonth(pension.id, monthKey))
        const hasAnySnapshot = accountValues.some((v) => v !== null)
        const rawCurrent = accountValues.reduce<number>((sum, v) => sum + (v ?? 0), 0)

        if (hasAnySnapshot) {
            // Update carry-forward whenever we have real snapshot data
            lastKnownTotal = rawCurrent
        }

        // Use the snapshot total if we have one, otherwise carry forward the last known
        // total. If nothing has been recorded yet at all, fall back to contributions
        // as the best-effort floor so the value line never goes below contributions.
        const current = Math.max(
            hasAnySnapshot ? rawCurrent : lastKnownTotal || contributions,
            contributions
        )

        const comparisonValues = comparisonAccountIds.map((accountId) => valueAtMonth(accountId, monthKey))
        const comparison = comparisonValues.reduce<number>((sum, v) => sum + (v ?? 0), 0)

        acc.push({
            month: monthKey,
            label: formatMonthLabel(monthKey, multiYear),
            current,
            comparison,
            contributions,
        })

        return acc
    }, [])

    if (chartData.length === 0) {
        const monthKey = getTodayIso().slice(0, 7)
        chartData.push({
            month: monthKey,
            label: formatMonthLabel(monthKey, false),
            current: 0,
            comparison: 0,
            contributions: 0,
        })
    }

    // Savings logic
    const potsByAccount = (savingsPots ?? []).reduce<Record<string, DashboardSavingsPot[]>>((acc, potRow) => {
        const balance = toNumber(potRow.balance)
        if (!Number.isFinite(balance) || balance < 0) return acc

        const targetAmountRaw = potRow.target_amount ? toNumber(potRow.target_amount) : null
        const targetAmount = targetAmountRaw !== null && Number.isFinite(targetAmountRaw) && targetAmountRaw >= 0 ? targetAmountRaw : null

        if (!acc[potRow.account_id]) acc[potRow.account_id] = []
        acc[potRow.account_id].push({
            id: potRow.id,
            name: (potRow.name ?? '').trim(),
            balance,
            targetAmount,
        })
        return acc
    }, {})

    // Sort pots alphabetically by name
    Object.values(potsByAccount).forEach(pots => pots.sort((a, b) => a.name.localeCompare(b.name)))

    const historyByPot = (savingsHistory ?? []).reduce<Record<string, number>>((acc, row) => {
        const amount = toNumber(row.amount)
        if (!Number.isFinite(amount)) return acc
        acc[row.pot_id] = (acc[row.pot_id] ?? 0) + amount
        return acc
    }, {})

    const savingsAccountsSummary: DashboardSavingsAccount[] = (savingsAccounts ?? []).map((accRow) => {
        const pots = potsByAccount[accRow.id] ?? []
        const totalValue = pots.reduce((sum, pot) => sum + pot.balance, 0)

        let totalPnl = 0
        let totalDeposits = 0

        pots.forEach(pot => {
            const deposits = historyByPot[pot.id] ?? 0
            if (deposits > 0) {
                totalDeposits += deposits
                totalPnl += (pot.balance - deposits)
            }
        })

        const totalPnlPercentage = totalDeposits > 0 ? (totalPnl / totalDeposits) * 100 : 0

        return {
            id: accRow.id,
            name: (accRow.name ?? '').trim(),
            totalValue,
            totalPnl,
            totalPnlPercentage,
            pots,
        }
    }).sort((a, b) => a.name.localeCompare(b.name))

    const totalSavingsValue = savingsAccountsSummary.reduce((sum, acc) => sum + acc.totalValue, 0)

    const cryptoAssetsSummary = (cryptoAssets ?? []).map((row) => {
        const amount = toNumber(row.amount);
        const usd = toNumber(row.usd);
        const investedGbp = toNumber(row.invested_gbp);

        return {
            id: row.id,
            ticker: row.ticker,
            name: row.name,
            amount: Number.isFinite(amount) ? amount : 0,
            usd: Number.isFinite(usd) ? usd : 0,
            investedGbp: Number.isFinite(investedGbp) ? investedGbp : 0,
            marketValueGbp: 0, // This is dynamic based on live price, calculated in the component normally, but we provide a base snapshot
        };
    }).filter(asset => asset.amount > 0);

    const USD_TO_GBP = 0.746;
    const totalCryptoValueSnapshot = cryptoAssetsSummary.reduce(
        (sum, asset) => sum + (asset.amount * asset.usd * USD_TO_GBP),
        0
    );
    const totalCryptoInvested = cryptoAssetsSummary.reduce(
        (sum, asset) => sum + asset.investedGbp,
        0
    );

    const CURRENCY_TO_GBP: Record<string, number> = {
        GBP: 1,
        EUR: 1 / 1.17,
        USD: 0.746, // Consistent with crypto USD_TO_GBP
        CHF: 1 / 1.13,
        CAD: 1 / 1.74,
    }

    const bullionHoldingsSummary = (bullionHoldings ?? []).map((holding) => {
        const currency = holding.purchase_currency || 'GBP'
        const rate = CURRENCY_TO_GBP[currency] ?? 1
        const amount = toNumber(holding.amount)
        const parsedAmount = Number.isFinite(amount) ? amount : 0
        const weightPerItemGrams = toNumber(holding.weight_per_item_grams)
        const parsedWeight = Number.isFinite(weightPerItemGrams) ? weightPerItemGrams : 0

        let investedPerUnit = 0
        const totalInclTax = toNumber(holding.total_price_incl_tax)
        if (Number.isFinite(totalInclTax) && totalInclTax > 0) {
            investedPerUnit = totalInclTax * rate
        } else {
            const value = toNumber(holding.purchase_value)
            const taxPct = toNumber(holding.tax_rate_pct)
            const taxMultiplier = Number.isFinite(taxPct) && taxPct > 0 ? 1 + taxPct / 100 : 1
            investedPerUnit = value * rate * taxMultiplier
        }

        return {
            id: holding.id,
            metal: holding.metal === 'GOLD' || holding.metal === 'SILVER' ? holding.metal : 'GOLD',
            amount: parsedAmount,
            weightPerItemGrams: parsedWeight,
            investedGbp: investedPerUnit * parsedAmount,
        }
    })

    const totalBullionInvested = bullionHoldingsSummary.reduce((sum, holding) => sum + holding.investedGbp, 0)

    const totalInvestmentsValue = (investmentHoldings ?? []).reduce((sum, holding) => {
        return sum + toNumber(holding.current_value)
    }, 0)
    const accountLevelInvestmentCurrentValue = (investmentAccountTransactions ?? []).reduce((sum, tx) => {
        if (tx.holding_id) return sum
        return sum + toNumber(tx.current_value_impact)
    }, 0)
    const totalInvestmentsCurrentValue = totalInvestmentsValue + accountLevelInvestmentCurrentValue

    const totalRealEstateValue = (realEstateProperties ?? []).reduce((sum, prop) => {
        const value =
            toNumber(prop.current_value) ||
            toNumber(prop.estimated_value) ||
            toNumber(prop.market_value)
        return sum + value
    }, 0)
    const totalRealEstateMortgage = (realEstateProperties ?? []).reduce((sum, prop) => {
        const mortgage = toNumber(prop.mortgage_balance)
        return sum + (Number.isFinite(mortgage) ? mortgage : 0)
    }, 0)
    const totalRealEstateEquity = totalRealEstateValue - totalRealEstateMortgage

    const mergedAssets = [
        { name: 'Pension', value: totalPensionValue },
        { name: 'Savings', value: totalSavingsValue },
        { name: 'Investments', value: totalInvestmentsCurrentValue },
        { name: 'Crypto', value: totalCryptoValueSnapshot },
        { name: 'Bullion', value: totalBullionInvested },
        { name: 'Real Estate', value: totalRealEstateEquity },
    ]
    const totalAssets = mergedAssets.reduce((sum, asset) => sum + asset.value, 0)
    const assetsWithAllocation: DashboardAsset[] = mergedAssets.map((asset) => ({
        ...asset,
        allocation: totalAssets > 0 ? (asset.value / totalAssets) * 100 : 0,
    }))

    const monthlyNetSalary = (() => {
        const parsed = toNumber(budgetProfile?.monthly_net_salary)
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
    })()
    const employerName = (budgetProfile?.employer_name ?? '').trim() || 'Not set'

    const expenditures = (budgetExpenditures ?? [])
        .map<DashboardBudgetExpenditure | null>((expenditure) => {
            const amount = toNumber(expenditure.monthly_amount)
            const name = (expenditure.expenditure_name ?? '').trim()

            if (!expenditure.id || !name || !Number.isFinite(amount) || amount < 0) {
                return null
            }

            return {
                id: expenditure.id,
                name,
                amount,
            }
        })
        .filter((entry): entry is DashboardBudgetExpenditure => Boolean(entry))

    const capital = (budgetCapital ?? [])
        .map<DashboardBudgetCapital | null>((cap) => {
            const amount = toNumber(cap.monthly_amount)
            const name = (cap.capital_name ?? '').trim()

            if (!cap.id || !name || !Number.isFinite(amount) || amount < 0) {
                return null
            }

            return {
                id: cap.id,
                name,
                amount,
            }
        })
        .filter((entry): entry is DashboardBudgetCapital => Boolean(entry))

    const totalExpenditure = expenditures.reduce((sum, expenditure) => sum + expenditure.amount, 0)
    const totalCapital = capital.reduce((sum, cap) => sum + cap.amount, 0)
    const committedOutgoingRatio = monthlyNetSalary > 0
        ? ((totalExpenditure + totalCapital) / monthlyNetSalary) * 100
        : 0
    const annualNetSalary = monthlyNetSalary * 12
    const disposableIncome = monthlyNetSalary - totalExpenditure - totalCapital

    // Build savings timeline from individual transactions so each entry can move the line.
    const activePotIds = new Set((savingsPots ?? []).map((pot) => pot.id))
    const savingsTransactions = (savingsHistory ?? [])
        .map((row) => {
            if (!activePotIds.has(row.pot_id)) return null

            const amount = toNumber(row.amount)
            if (!Number.isFinite(amount) || amount === 0) return null

            const dayKey = parseDayKey(row.date || row.created_at)
            if (!dayKey) return null

            return {
                id: row.id,
                dayKey,
                amount,
                createdAt: row.created_at || '',
            }
        })
        .filter((row): row is { id: string; dayKey: string; amount: number; createdAt: string } => Boolean(row))
        .sort((a, b) => {
            if (a.dayKey !== b.dayKey) return a.dayKey.localeCompare(b.dayKey)
            if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
            return a.id.localeCompare(b.id)
        })

    const savingsChartData: DashboardSavingsChartPoint[] = []
    const currentDayKey = getTodayIso()
    const historyDayKeys = savingsTransactions.map((transaction) => transaction.dayKey)

    if (historyDayKeys.length === 0) {
        const currentMonthKey = currentDayKey.slice(0, 7)
        for (let i = 5; i >= 0; i--) {
            const d = new Date(
                Number(currentMonthKey.slice(0, 4)),
                Number(currentMonthKey.slice(5, 7)) - 1 - i,
                1
            )
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const dayKey = `${monthKey}-01`
            savingsChartData.push({
                month: dayKey,
                label: formatMonthLabel(monthKey, false),
                current: totalSavingsValue,
            })
        }
    } else {
        const totalFlow = savingsTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
        let runningValue = totalSavingsValue - totalFlow

        const firstDayKey = historyDayKeys[0]
        const firstDayDate = new Date(`${firstDayKey}T00:00:00`)
        const dayBeforeFirst = new Date(firstDayDate)
        dayBeforeFirst.setDate(dayBeforeFirst.getDate() - 1)
        const dayBeforeFirstKey = `${dayBeforeFirst.getFullYear()}-${String(dayBeforeFirst.getMonth() + 1).padStart(2, '0')}-${String(dayBeforeFirst.getDate()).padStart(2, '0')}`

        savingsChartData.push({
            month: dayBeforeFirstKey,
            label: formatDayLabel(dayBeforeFirstKey, firstDayKey.slice(0, 4) !== currentDayKey.slice(0, 4)),
            current: Number(Math.max(0, runningValue).toFixed(2)),
        })

        savingsTransactions.forEach((transaction) => {
            runningValue += transaction.amount
            savingsChartData.push({
                month: transaction.dayKey,
                label: formatDayLabel(transaction.dayKey, transaction.dayKey.slice(0, 4) !== currentDayKey.slice(0, 4)),
                current: Number(Math.max(0, runningValue).toFixed(2)),
            })
        })

        const lastHistoryDay = historyDayKeys[historyDayKeys.length - 1]
        if (lastHistoryDay !== currentDayKey) {
            savingsChartData.push({
                month: currentDayKey,
                label: formatDayLabel(currentDayKey, currentDayKey.slice(0, 4) !== firstDayKey.slice(0, 4)),
                current: Number(Math.max(0, totalSavingsValue).toFixed(2)),
            })
        }
    }

    const normalizedDebtAmounts = (debtEntries ?? [])
        .map((entry) => toNumber(entry.amount))
        .filter((amount) => Number.isFinite(amount))
        .map((amount) => Math.max(0, amount))
    const totalDebt = normalizedDebtAmounts.reduce((sum, amount) => sum + amount, 0)
    const debtCount = normalizedDebtAmounts.filter((amount) => amount > 0).length

    const todayIso = getTodayIso()
    const currentYear = todayIso.slice(0, 4)
    const startOfYearDayKey = `${currentYear}-01-01`
    const startOfYearMonthKey = `${currentYear}-01`

    const pensionStartOfYearValue = pensionAccountsSummary.reduce((sum, pension) => {
        const janValue = valueAtMonth(pension.id, startOfYearMonthKey)
        return sum + (janValue ?? pension.value)
    }, 0)

    const savingsFlowSinceStartOfYear = savingsTransactions.reduce((sum, transaction) => {
        if (transaction.dayKey >= startOfYearDayKey) {
            return sum + transaction.amount
        }
        return sum
    }, 0)
    const savingsStartOfYearValue = totalSavingsValue - savingsFlowSinceStartOfYear

    const investmentCurrentFlowSinceStartOfYear = (investmentAccountTransactions ?? []).reduce((sum, transaction) => {
        const dayKey = parseDayKey(transaction.transaction_date || '')
        if (!dayKey || dayKey < startOfYearDayKey) return sum
        return sum + toNumber(transaction.current_value_impact)
    }, 0)
    const investmentsStartOfYearValue = totalInvestmentsCurrentValue - investmentCurrentFlowSinceStartOfYear

    const startOfYearValue =
        pensionStartOfYearValue +
        savingsStartOfYearValue +
        investmentsStartOfYearValue +
        totalCryptoValueSnapshot +
        totalBullionInvested +
        totalRealEstateEquity
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
            assets: cryptoAssetsSummary,
            totalValue: totalCryptoValueSnapshot,
            totalInvested: totalCryptoInvested,
            loadError: cryptoLoadError || false,
        },
        bullion: {
            holdings: bullionHoldingsSummary,
            totalInvested: totalBullionInvested,
            loadError: bullionLoadError,
        },
        pension: {
            accounts: pensionAccountsSummary,
            totalValue: totalPensionValue,
            totalPnl,
            totalPnlPercentage,
            chartData,
            comparisonLabel,
            loadError: pensionLoadError,
        },
        budget: {
            profile: {
                employerName,
                monthlyNetSalary,
            },
            expenditures,
            capital,
            totalExpenditure,
            totalCapital,
            committedOutgoingRatio,
            annualNetSalary,
            disposableIncome,
            loadError: budgetLoadError,
        },
        savings: {
            accounts: savingsAccountsSummary,
            totalValue: totalSavingsValue,
            chartData: savingsChartData,
            loadError: savingsLoadError,
        },
        debt: {
            totalDebt,
            debtCount,
            loadError: debtLoadError,
        },
    }
}
