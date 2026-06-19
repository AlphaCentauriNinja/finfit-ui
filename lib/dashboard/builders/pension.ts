import { toNumber } from '@/lib/utils/number'
import type { PensionAccountRow, PensionContributionRow, PensionValueRow, DashboardPensionAccount, DashboardPensionChartPoint, ValueSnapshot } from '../types'
import { formatMonthLabel } from './utils'

export const buildPensionSnapshot = (
    accountRows: PensionAccountRow[],
    contributionRows: PensionContributionRow[],
    valueRows: PensionValueRow[]
) => {
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

    const totalPensionValue = pensionAccountsSummary.reduce((sum, account) => sum + account.value, 0)
    const totalPensionPnl = pensionAccountsSummary.reduce((sum, account) => sum + account.pnl, 0)
    const totalPensionContributions = pensionAccountsSummary.reduce((sum, account) => sum + account.contributionTotal, 0)
    const totalPensionPnlPercentage = totalPensionContributions > 0 ? (totalPensionPnl / totalPensionContributions) * 100 : 0

    // Build timeline for charts
    const timelineEvents: Array<{ date: string; amount: number; type: 'value' | 'contribution'; accountId?: string }> = []

    // 1. Add all historical value snapshots to timeline
    Object.entries(sortedSnapshotsByAccount).forEach(([accountId, snapshots]) => {
        snapshots.forEach((snapshot) => {
            timelineEvents.push({
                date: snapshot.valueDate,
                amount: snapshot.amount,
                type: 'value',
                accountId: accountId
            })
        })
    })

    // 2. Add contributions to timeline
    contributionRows.forEach((row) => {
        if (!row.contribution_date) return
        const amount = toNumber(row.contribution_value)
        if (!Number.isFinite(amount)) return
        timelineEvents.push({
            date: row.contribution_date,
            amount: amount,
            type: 'contribution',
            accountId: row.pension_account_id
        })
    })

    // Sort timeline chronologically
    timelineEvents.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        // If dates are identical, process 'contribution' BEFORE 'value' so value snapshot overrides the total
        if (a.type !== b.type) return a.type === 'contribution' ? -1 : 1
        return 0
    })

    const monthData: Record<string, { current: number; contributions: number }> = {}
    const latestValueByAccountTracker: Record<string, number> = {}
    let runningContributions = 0

    // Initialize the tracker with starting values for accounts that have no snapshots yet
    // OR we can just rely on snapshots. If an account has no snapshots, it doesn't appear on the chart
    // until it gets a snapshot. But it's better to initialize it with its current_value
    // if there are NO snapshots at all for that account.
    accountRows.forEach((acc) => {
        const snapshots = sortedSnapshotsByAccount[acc.id] ?? []
        if (snapshots.length === 0) {
            // If no snapshots exist, we assume its current_value has been there since its creation
            // We'll just track it from the beginning
            latestValueByAccountTracker[acc.id] = toNumber(acc.current_value) || 0
        } else {
            // It will be populated when we encounter its snapshots in the timeline
            latestValueByAccountTracker[acc.id] = 0
        }
    })

    // If there are no timeline events but we have some starting values, we should at least show the current month
    if (timelineEvents.length === 0) {
        const currentMonth = new Date().toISOString().slice(0, 7)
        const initialTotal = Object.values(latestValueByAccountTracker).reduce((sum, val) => sum + val, 0)
        monthData[currentMonth] = { current: initialTotal, contributions: 0 }
    }

    timelineEvents.forEach((event) => {
        const monthKey = event.date.slice(0, 7)
        
        if (event.type === 'value' && event.accountId) {
            // Value snapshot sets the absolute value
            latestValueByAccountTracker[event.accountId] = event.amount
        } else if (event.type === 'contribution') {
            runningContributions += event.amount
            if (event.accountId) {
                // A contribution inherently increases the account value
                latestValueByAccountTracker[event.accountId] += event.amount
            }
        }

        const currentTotal = Object.values(latestValueByAccountTracker).reduce((sum, val) => sum + val, 0)

        // Overwrite the month data with the latest state at the end of that event
        monthData[monthKey] = { 
            current: currentTotal, 
            contributions: runningContributions 
        }
    })

    const months = Object.keys(monthData).sort()
    const multiYear = months.length > 0 && months[0].slice(0, 4) !== months[months.length - 1].slice(0, 4)

    const pensionChartData: DashboardPensionChartPoint[] = months.map((monthKey, index) => {
        const data = monthData[monthKey]
        const comparison = index > 0 ? monthData[months[index - 1]].current : 0
        return {
            month: monthKey,
            label: formatMonthLabel(monthKey, multiYear),
            current: data.current,
            comparison,
            contributions: data.contributions,
        }
    })

    const startOfYearPrefix = `${new Date().getFullYear()}-01`
    const lastYearPrefix = `${new Date().getFullYear() - 1}-12`
    const startOfYearMonth = months.find(m => m >= startOfYearPrefix) || months.find(m => m === lastYearPrefix) || months[0]
    const comparisonLabel = startOfYearMonth ? `vs ${formatMonthLabel(startOfYearMonth, multiYear)}` : 'vs Previous'

    const getStartOfYearValue = (monthKey: string) => {
        let sum = 0
        pensionAccountsSummary.forEach((account) => {
            const snapshots = sortedSnapshotsByAccount[account.id] ?? []
            let accountValue: number | null = null
            for (const snapshot of snapshots) {
                if (snapshot.valueDate.slice(0, 7) <= monthKey) {
                    accountValue = snapshot.amount
                } else {
                    break
                }
            }
            sum += (accountValue ?? account.value)
        })
        return sum
    }

    return {
        accounts: pensionAccountsSummary,
        totalValue: totalPensionValue,
        totalPnl: totalPensionPnl,
        totalPnlPercentage: totalPensionPnlPercentage,
        chartData: pensionChartData,
        comparisonLabel,
        getStartOfYearValue
    }
}
