import { assets as mockedAssets } from '@/lib/assets'

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

export type SalaryProfileRow = {
    employer_name: string | null
    monthly_net_salary: number | string | null
}

export type SalaryExpenditureRow = {
    id: string
    expenditure_name: string | null
    monthly_amount: number | string | null
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
}

export type DashboardSalaryProfile = {
    employerName: string
    monthlyNetSalary: number
}

export type DashboardSalaryExpenditure = {
    id: string
    name: string
    amount: number
}

export type DashboardDataSnapshot = {
    portfolio: {
        totalAssets: number
        assetsWithAllocation: DashboardAsset[]
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
    salary: {
        profile: DashboardSalaryProfile
        expenditures: DashboardSalaryExpenditure[]
        totalExpenditure: number
        committedOutgoingRatio: number
        annualNetSalary: number
        disposableIncome: number
        loadError: boolean
    }
}

type BuildDashboardSnapshotInput = {
    pensionAccounts?: PensionAccountRow[] | null
    pensionContributions?: PensionContributionRow[] | null
    pensionValues?: PensionValueRow[] | null
    pensionLoadError?: boolean
    salaryProfile?: SalaryProfileRow | null
    salaryExpenditures?: SalaryExpenditureRow[] | null
    salaryLoadError?: boolean
}

const toNumber = (value: number | string | null | undefined): number => {
    if (typeof value === 'number') return value
    return Number(value ?? 0)
}

const getTodayIso = (): string => new Date().toISOString().slice(0, 10)

const formatMonthLabel = (monthKey: string): string => {
    const [yearPart, monthPart] = monthKey.split('-')
    const year = Number(yearPart)
    const month = Number(monthPart)
    const date = new Date(year, month - 1, 1)
    if (Number.isNaN(date.getTime())) return monthKey
    return new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date).toUpperCase()
}

export const buildDashboardSnapshot = ({
    pensionAccounts,
    pensionContributions,
    pensionValues,
    pensionLoadError = false,
    salaryProfile,
    salaryExpenditures,
    salaryLoadError = false,
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

    const accountBaseValues = accountRows.reduce<Record<string, number>>((acc, account) => {
        const parsedAmount = toNumber(account.current_value)
        acc[account.id] = Number.isFinite(parsedAmount) ? parsedAmount : 0
        return acc
    }, {})

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

    const pensionBeeAccountIds = pensionAccountsSummary
        .filter((pension) => pension.name.toLowerCase().includes('pensionbee'))
        .map((pension) => pension.id)
    const comparisonAccountIds = pensionBeeAccountIds.length > 0
        ? pensionBeeAccountIds
        : (pensionAccountsSummary[0] ? [pensionAccountsSummary[0].id] : [])
    const comparisonLabel = pensionBeeAccountIds.length > 0
        ? 'PENSIONBEE'
        : (pensionAccountsSummary[0]?.name ? pensionAccountsSummary[0].name.toUpperCase() : 'BENCHMARK')

    const valueAtMonth = (accountId: string, monthKey: string): number => {
        const snapshots = sortedSnapshotsByAccount[accountId] ?? []
        const fallbackValue = accountBaseValues[accountId] ?? 0
        let accountValue = fallbackValue

        for (const snapshot of snapshots) {
            if (snapshot.valueDate.slice(0, 7) <= monthKey) {
                accountValue = snapshot.amount
            } else {
                break
            }
        }

        return accountValue
    }

    const chartData = sortedMonths.reduce<DashboardPensionChartPoint[]>((acc, monthKey) => {
        const current = pensionAccountsSummary.reduce((sum, pension) => sum + valueAtMonth(pension.id, monthKey), 0)
        const comparison = comparisonAccountIds.reduce((sum, accountId) => sum + valueAtMonth(accountId, monthKey), 0)

        acc.push({
            month: monthKey,
            label: formatMonthLabel(monthKey),
            current,
            comparison,
        })

        return acc
    }, [])

    if (chartData.length === 0) {
        const monthKey = getTodayIso().slice(0, 7)
        chartData.push({
            month: monthKey,
            label: formatMonthLabel(monthKey),
            current: 0,
            comparison: 0,
        })
    }

    const mergedAssets = mockedAssets.map((asset) => (
        asset.name === 'Pension'
            ? { ...asset, value: totalPensionValue }
            : asset
    ))
    const totalAssets = mergedAssets.reduce((sum, asset) => sum + asset.value, 0)
    const assetsWithAllocation: DashboardAsset[] = mergedAssets.map((asset) => ({
        ...asset,
        allocation: totalAssets > 0 ? (asset.value / totalAssets) * 100 : 0,
    }))

    const monthlyNetSalary = (() => {
        const parsed = toNumber(salaryProfile?.monthly_net_salary)
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
    })()
    const employerName = (salaryProfile?.employer_name ?? '').trim() || 'Not set'

    const expenditures = (salaryExpenditures ?? [])
        .map<DashboardSalaryExpenditure | null>((expenditure) => {
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
        .filter((entry): entry is DashboardSalaryExpenditure => Boolean(entry))

    const totalExpenditure = expenditures.reduce((sum, expenditure) => sum + expenditure.amount, 0)
    const committedOutgoingRatio = monthlyNetSalary > 0
        ? (totalExpenditure / monthlyNetSalary) * 100
        : 0
    const annualNetSalary = monthlyNetSalary * 12
    const disposableIncome = monthlyNetSalary - totalExpenditure

    return {
        portfolio: {
            totalAssets,
            assetsWithAllocation,
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
        salary: {
            profile: {
                employerName,
                monthlyNetSalary,
            },
            expenditures,
            totalExpenditure,
            committedOutgoingRatio,
            annualNetSalary,
            disposableIncome,
            loadError: salaryLoadError,
        },
    }
}
