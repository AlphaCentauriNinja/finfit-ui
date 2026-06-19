import { toNumber } from '@/lib/utils/number'
import type { SavingsAccountRow, SavingsPotRow, SavingsHistoryRow, DashboardSavingsAccount, DashboardSavingsPot, DashboardSavingsChartPoint } from '../types'
import { parseDayKey, getTodayIso, formatMonthLabel, formatDayLabel } from './utils'

export const buildSavingsSnapshot = (
    savingsAccounts: SavingsAccountRow[],
    savingsPots: SavingsPotRow[],
    savingsHistory: SavingsHistoryRow[]
) => {
    const potsByAccount = savingsPots.reduce<Record<string, DashboardSavingsPot[]>>((acc, potRow) => {
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

    const historyByPot = savingsHistory.reduce<Record<string, number>>((acc, row) => {
        const amount = toNumber(row.amount)
        if (!Number.isFinite(amount)) return acc
        acc[row.pot_id] = (acc[row.pot_id] ?? 0) + amount
        return acc
    }, {})

    const savingsAccountsSummary: DashboardSavingsAccount[] = savingsAccounts.map((accRow) => {
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

    // Build savings timeline from individual transactions so each entry can move the line.
    const activePotIds = new Set(savingsPots.map((pot) => pot.id))
    const savingsTransactions = savingsHistory
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

    return {
        accounts: savingsAccountsSummary,
        totalValue: totalSavingsValue,
        chartData: savingsChartData,
        transactions: savingsTransactions, // We'll export this to use in dashboard-data.ts startOfYear logic
    }
}
