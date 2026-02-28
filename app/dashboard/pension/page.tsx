import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddPensionButton from './AddPensionButton'
import PensionAccountCard from './PensionAccountCard'
import PensionPerformanceChart from './PensionPerformanceChart'

type PensionAccountRow = {
    id: string
    provider_name: string
    current_value: number | string | null
}

type PensionContributionRow = {
    pension_account_id: string
    contribution_value: number | string | null
    contribution_date: string | null
}

type PensionValueRow = {
    pension_account_id: string
    value_amount: number | string | null
    value_date: string | null
    created_at: string
}

type ValueSnapshot = {
    amount: number
    valueDate: string
    createdAt: string
}

type ChartPoint = {
    date: string
    label: string
    totalValue: number
    contributions: number
    pnl: number
}

const toNumber = (value: number | string | null | undefined): number => {
    if (typeof value === 'number') return value
    return Number(value ?? 0)
}

const getTodayIso = (): string => new Date().toISOString().slice(0, 10)

const formatChartDate = (dateValue: string): string => {
    const date = new Date(`${dateValue}T00:00:00`)
    if (Number.isNaN(date.getTime())) return dateValue
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
    }).format(date)
}

export default async function PensionPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    const { data, error } = await supabase
        .from('pension_accounts')
        .select('id, provider_name, current_value, created_at')
        .order('created_at', { ascending: false })

    const { data: contributionData, error: contributionError } = await supabase
        .from('pension_contributions')
        .select('pension_account_id, contribution_value, contribution_date')

    const { data: valueData, error: valueError } = await supabase
        .from('pension_account_values')
        .select('pension_account_id, value_amount, value_date, created_at')

    const contributionTotalsByAccount = ((contributionData as PensionContributionRow[] | null) ?? []).reduce<Record<string, number>>(
        (acc, contribution) => {
            const parsedValue = toNumber(contribution.contribution_value)

            if (!Number.isFinite(parsedValue)) return acc

            acc[contribution.pension_account_id] = (acc[contribution.pension_account_id] ?? 0) + parsedValue
            return acc
        },
        {}
    )

    const valueSnapshotsByAccount = ((valueData as PensionValueRow[] | null) ?? []).reduce<Record<string, ValueSnapshot[]>>(
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
    const pnlByAccount: Record<string, number> = {}
    const sortedSnapshotsByAccount: Record<string, ValueSnapshot[]> = {}

    Object.entries(valueSnapshotsByAccount).forEach(([accountId, snapshots]) => {
        const orderedSnapshots = [...snapshots].sort((a, b) => {
            if (a.valueDate !== b.valueDate) return a.valueDate.localeCompare(b.valueDate)
            return a.createdAt.localeCompare(b.createdAt)
        })

        sortedSnapshotsByAccount[accountId] = orderedSnapshots

        if (orderedSnapshots.length === 0) return

        const latest = orderedSnapshots[orderedSnapshots.length - 1]
        const previous = orderedSnapshots.length > 1
            ? orderedSnapshots[orderedSnapshots.length - 2]
            : null

        latestValueByAccount[accountId] = latest
        pnlByAccount[accountId] = previous ? latest.amount - previous.amount : 0
    })

    const accountBaseValues: Record<string, number> = ((data as PensionAccountRow[] | null) ?? []).reduce<Record<string, number>>(
        (acc, account) => {
            const parsedAmount = toNumber(account.current_value)
            acc[account.id] = Number.isFinite(parsedAmount) ? parsedAmount : 0
            return acc
        },
        {}
    )

    const pensions = ((data as PensionAccountRow[] | null) ?? []).map((account) => {
        const parsedAmount = toNumber(account.current_value)
        const latestValue = latestValueByAccount[account.id]
        const contributionTotal = contributionTotalsByAccount[account.id] ?? 0

        return {
            id: account.id,
            name: account.provider_name,
            value: latestValue
                ? latestValue.amount
                : (Number.isFinite(parsedAmount) ? parsedAmount : 0),
            pnl: pnlByAccount[account.id] ?? 0,
            contributionTotal,
            latestValueDate: latestValue?.valueDate ?? null,
        }
    })

    const total = pensions.reduce((sum, pension) => sum + pension.value, 0)
    const allDates = new Set<string>([getTodayIso()])

        ; ((contributionData as PensionContributionRow[] | null) ?? []).forEach((contribution) => {
            if (contribution.contribution_date) {
                allDates.add(contribution.contribution_date)
            }
        })

        ; ((valueData as PensionValueRow[] | null) ?? []).forEach((valueRow) => {
            if (valueRow.value_date) {
                allDates.add(valueRow.value_date)
            }
        })

    const sortedDates = [...allDates].sort((a, b) => a.localeCompare(b))

    const contributionByDate = ((contributionData as PensionContributionRow[] | null) ?? []).reduce<Record<string, number>>(
        (acc, contribution) => {
            if (!contribution.contribution_date) return acc
            const parsedValue = toNumber(contribution.contribution_value)
            if (!Number.isFinite(parsedValue)) return acc
            acc[contribution.contribution_date] = (acc[contribution.contribution_date] ?? 0) + parsedValue
            return acc
        },
        {}
    )

    const chartData: ChartPoint[] = sortedDates.reduce<ChartPoint[]>((acc, dateValue) => {
        const previousContribution = acc.length > 0
            ? acc[acc.length - 1].contributions
            : 0
        const cumulativeContribution = previousContribution + (contributionByDate[dateValue] ?? 0)

        const totalValueOnDate = pensions.reduce((sum, pension) => {
            const snapshots = sortedSnapshotsByAccount[pension.id] ?? []
            const fallbackValue = accountBaseValues[pension.id] ?? 0
            let accountValue = fallbackValue

            for (const snapshot of snapshots) {
                if (snapshot.valueDate <= dateValue) {
                    accountValue = snapshot.amount
                } else {
                    break
                }
            }

            return sum + accountValue
        }, 0)

        acc.push({
            date: dateValue,
            label: formatChartDate(dateValue),
            totalValue: totalValueOnDate,
            contributions: cumulativeContribution,
            pnl: totalValueOnDate - cumulativeContribution,
        })

        return acc
    }, [])

    const latestChartPoint = chartData.length > 0
        ? chartData[chartData.length - 1]
        : null
    const totalPnlPerformance = latestChartPoint
        ? latestChartPoint.pnl
        : total
    const totalPnlPillClassName = totalPnlPerformance > 0
        ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200'
        : totalPnlPerformance < 0
            ? 'border-rose-400/35 bg-rose-500/15 text-rose-200'
            : 'border-amber-400/35 bg-amber-500/15 text-amber-200'
    const totalPnlLabel = `${totalPnlPerformance >= 0 ? '+' : ''}£${totalPnlPerformance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Pension Accounts</h1>
                <AddPensionButton />
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 mb-8">
                <p className="text-sm font-medium text-white/60">Total Value</p>
                <p className="text-3xl font-bold text-white mt-2">
                    £{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="mt-3">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${totalPnlPillClassName}`}>
                        PNL Performance {totalPnlLabel}
                    </span>
                </div>
            </div>

            <PensionPerformanceChart data={chartData} />

            {error || contributionError || valueError ? (
                <div className="mb-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    HTTP 500: could not load pension
                </div>
            ) : null}

            {pensions.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 text-white/70">
                    No pension accounts yet. Use <span className="text-white font-medium">Add Pension</span> to create your first entry.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {pensions.map((pension) => (
                        <PensionAccountCard
                            key={pension.id}
                            pension={pension}
                            total={total}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
