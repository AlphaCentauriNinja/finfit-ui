import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
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
    month: string
    label: string
    current: number
    comparison: number
}

type PnlState = 'positive' | 'negative' | 'neutral'

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
    return new Intl.DateTimeFormat('en-GB', {
        month: 'short',
    }).format(date).toUpperCase()
}

const getPnlState = (value: number): PnlState => {
    const epsilon = 0.000001
    if (value > epsilon) return 'positive'
    if (value < -epsilon) return 'negative'
    return 'neutral'
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
    const sortedSnapshotsByAccount: Record<string, ValueSnapshot[]> = {}

    Object.entries(valueSnapshotsByAccount).forEach(([accountId, snapshots]) => {
        const orderedSnapshots = [...snapshots].sort((a, b) => {
            if (a.valueDate !== b.valueDate) return a.valueDate.localeCompare(b.valueDate)
            return a.createdAt.localeCompare(b.createdAt)
        })

        sortedSnapshotsByAccount[accountId] = orderedSnapshots

        if (orderedSnapshots.length === 0) return

        const latest = orderedSnapshots[orderedSnapshots.length - 1]

        latestValueByAccount[accountId] = latest
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
    const sortedMonths = [...new Set(sortedDates.map((dateValue) => dateValue.slice(0, 7)))].sort((a, b) => a.localeCompare(b))

    const pensionBeeAccountIds = pensions
        .filter((pension) => pension.name.toLowerCase().includes('pensionbee'))
        .map((pension) => pension.id)
    const comparisonAccountIds = pensionBeeAccountIds.length > 0
        ? pensionBeeAccountIds
        : (pensions[0] ? [pensions[0].id] : [])
    const comparisonLabel = pensionBeeAccountIds.length > 0
        ? 'PENSIONBEE'
        : (pensions[0]?.name ? pensions[0].name.toUpperCase() : 'BENCHMARK')

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

    const chartData: ChartPoint[] = sortedMonths.reduce<ChartPoint[]>((acc, monthKey) => {
        const totalValueOnMonth = pensions.reduce((sum, pension) => {
            return sum + valueAtMonth(pension.id, monthKey)
        }, 0)

        const comparisonValueOnMonth = comparisonAccountIds.reduce((sum, accountId) => {
            return sum + valueAtMonth(accountId, monthKey)
        }, 0)

        acc.push({
            month: monthKey,
            label: formatMonthLabel(monthKey),
            current: totalValueOnMonth,
            comparison: comparisonValueOnMonth,
        })

        return acc
    }, [])

    if (chartData.length === 0) {
        chartData.push({
            month: getTodayIso().slice(0, 7),
            label: formatMonthLabel(getTodayIso().slice(0, 7)),
            current: 0,
            comparison: 0,
        })
    }

    const totalPnlPerformance = pensions.reduce((sum, pension) => sum + pension.pnl, 0)
    const totalContributions = pensions.reduce((sum, pension) => sum + pension.contributionTotal, 0)
    const totalPnlPercentage = totalContributions > 0
        ? (totalPnlPerformance / totalContributions) * 100
        : 0
    const totalPnlLabel = `${totalPnlPerformance >= 0 ? '+' : ''}£${totalPnlPerformance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const totalPnlPctLabel = `${totalPnlPercentage >= 0 ? '+' : ''}${totalPnlPercentage.toFixed(2)}%`
    const totalPnlState = getPnlState(totalPnlPerformance)
    const TotalPnlIcon = totalPnlState === 'positive' ? ArrowUpRight : totalPnlState === 'negative' ? ArrowDownRight : Minus
    const totalPnlPillTone = totalPnlState === 'positive'
        ? 'border-green-500 bg-green-500/20 text-green-200'
        : totalPnlState === 'negative'
            ? 'border-red-500 bg-red-500/20 text-red-200'
            : 'border-amber-500 bg-amber-500/20 text-amber-200'

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Pensions</h1>
                <AddPensionButton />
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 mb-8">
                <p className="text-sm font-medium text-white/60">Total Value</p>
                <p className="text-3xl font-bold text-white mt-2">
                    £{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${totalPnlPillTone}`}>
                        <TotalPnlIcon className="mr-1 h-3.5 w-3.5" />
                        PNL {totalPnlLabel}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${totalPnlPillTone}`}>
                        {totalPnlPctLabel}
                    </span>
                </div>
            </div>

            <PensionPerformanceChart data={chartData} comparisonLabel={comparisonLabel} />

            {error || contributionError || valueError ? (
                <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
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
