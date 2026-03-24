'use client'

import Link from 'next/link'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { Target, ArrowRight } from 'lucide-react'
import { babySteps } from '@/lib/baby-steps'
import { useDashboardData } from '@/app/dashboard/components/providers/DashboardDataProvider'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'

import { useMemo } from 'react'

export function PortfolioGraph() {
    const dashboardData = useDashboardData()
    const totalAssets = dashboardData.portfolio.totalAssets

    const portfolioData = useMemo(() => {
        const currentMonth = new Date().getMonth()
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        if (totalAssets === 0) {
            return Array.from({ length: 7 }).map((_, i) => ({
                name: months[(currentMonth - 6 + i + 12) % 12],
                value: 0
            }))
        }
        
        const curve = [0.85, 0.88, 0.87, 0.92, 0.95, 0.98, 1.0]
        return curve.map((multiplier, i) => ({
            name: months[(currentMonth - 6 + i + 12) % 12],
            value: totalAssets * multiplier
        }))
    }, [totalAssets])

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Portfolio Performance</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    +12.5% YTD
                </span>
            </div>
            <div className="h-[300px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `£${value / 1000}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#facc15' }}
                            formatter={(value) => [`£${Number(value ?? 0).toLocaleString()}`, 'Portfolio Value']}
                        />
                        <Area
                            type="natural"
                            dataKey="value"
                            stroke="#facc15"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0, fill: '#fde047' }}
                            isAnimationActive
                            animationDuration={900}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export function FinFitScoreWidget() {
    const score = 3
    const currentStep = babySteps[score - 1]

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white">FinFit Score</h3>
                    <p className="text-xs text-white/50 mt-1">AI-determined from the FinFit 7 levels</p>
                </div>
                <p className="text-indigo-300 font-bold text-xl leading-none">
                    {score}
                    <span className="text-sm text-white/50 ml-0.5">/7</span>
                </p>
            </div>

            <div className="mb-4">
                <div className="grid grid-cols-7 gap-2">
                    {babySteps.map((stepData, index) => {
                        const value = index + 1
                        const isActive = value <= score

                        return (
                            <div
                                key={stepData.step}
                                className={`h-11 rounded-lg border flex items-center justify-center text-2xl leading-none font-bold ${isActive
                                    ? 'bg-purple-500/25 text-purple-400 border-purple-400/60'
                                    : 'bg-white/5 text-slate-400 border-white/10'
                                    }`}
                            >
                                {value}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-white/45">Current Step</p>
                <p className="text-sm font-semibold text-white mt-1">Baby Step {score}</p>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">{currentStep.title}</p>
            </div>

            <Link
                href="/dashboard/finfit-levels"
                className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 mt-4 transition-colors"
            >
                See FinFit Levels
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    )
}


const spendingFallbackData = [
    { name: 'Housing', amount: 1200 },
    { name: 'Food', amount: 600 },
    { name: 'Transport', amount: 300 },
    { name: 'Utilities', amount: 250 },
    { name: 'Ent.', amount: 400 },
]

const SPENDING_COLORS = ['#c084fc', '#818cf8', '#2dd4bf', '#fb923c', '#f472b6', '#a78bfa', '#4ade80']

type SpendingPieTooltipProps = {
    active?: boolean
    payload?: Array<{
        name?: string
        value?: number | string
    }>
}

function SpendingPieTooltip({ active, payload }: SpendingPieTooltipProps) {
    if (!active || !payload?.length) return null
    const item = payload[0]
    const value = Number(item.value ?? 0)

    return (
        <div className="rounded-lg border border-white/10 bg-[#0e1629] px-3 py-2 text-xs shadow-xl">
            <p className="text-white/70">{item.name}</p>
            <p className="font-semibold text-white">
                £{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </div>
    )
}

export function SpendingBreakdown() {
    const dashboardData = useDashboardData()
    const { hideValues } = usePrivacy()
    const providerSpendingData = useMemo(() => {
        const topExpenditures = [...dashboardData.budget.expenditures]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 6)
            .map((entry) => ({
                name: entry.name.length > 12 ? `${entry.name.slice(0, 12)}...` : entry.name,
                amount: entry.amount,
            }))

        if (dashboardData.budget.totalCapital > 0) {
            topExpenditures.push({
                name: 'Capital',
                amount: dashboardData.budget.totalCapital,
            })
        }

        return topExpenditures.sort((a, b) => b.amount - a.amount)
    }, [dashboardData.budget.expenditures, dashboardData.budget.totalCapital])
    const spendingData = providerSpendingData.length > 0 ? providerSpendingData : spendingFallbackData

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Monthly Spending</h3>
            {!hideValues ? (
                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={spendingData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={78}
                                paddingAngle={3}
                                dataKey="amount"
                                nameKey="name"
                                stroke="none"
                            >
                                {spendingData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={SPENDING_COLORS[index % SPENDING_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px' }}
                                content={<SpendingPieTooltip />}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-xs text-white/50">
                    Spending values are hidden.
                </div>
            )}
            {!hideValues && dashboardData.budget.totalCapital > 0 ? (
                <p className="mt-3 text-xs text-white/60">
                    Includes £{dashboardData.budget.totalCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} monthly capital.
                </p>
            ) : null}
        </div>
    )
}

export function DebtWidget() {
    const dashboardData = useDashboardData()
    const { hideValues } = usePrivacy()
    const totalDebt = dashboardData.debt.totalDebt
    const debtCount = dashboardData.debt.debtCount
    const hasNoDebt = debtCount === 0 || totalDebt <= 0

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white">Debt</h3>
                    <p className="text-xs text-white/50 mt-1">Track liabilities across cards and loans</p>
                </div>
                <span className="text-xs font-semibold rounded-lg px-2 py-1 bg-white/5 text-white/70">
                    {debtCount} account{debtCount === 1 ? '' : 's'}
                </span>
            </div>

            {dashboardData.debt.loadError ? (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5">
                    <p className="text-xs text-rose-200">Unable to load debt data.</p>
                </div>
            ) : hasNoDebt ? (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5">
                    <p className="text-sm font-semibold text-emerald-300">Well done, no debt</p>
                </div>
            ) : (
                <div>
                    <p className="text-3xl font-bold text-rose-300">
                        {hideValues ? '****' : `£${totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                    <p className="text-xs text-white/60 mt-1">Total outstanding debt</p>
                </div>
            )}

            <Link
                href="/dashboard/debt"
                className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 mt-4 transition-colors"
            >
                Open debt tracker
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    )
}

export function GoalTracker() {
    const dashboardData = useDashboardData()
    const { hideValues } = usePrivacy()

    // Flatten all pots from all accounts and filter for ones with targets
    const goals = dashboardData.savings.accounts
        .flatMap(acc => acc.pots)
        .filter(pot => pot.targetAmount && pot.targetAmount > 0)
        .sort((a, b) => b.balance / (b.targetAmount ?? 1) - a.balance / (a.targetAmount ?? 1)) // Sort by progress

    if (goals.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Goals</h3>
                    <Target className="w-4 h-4 text-white/50" />
                </div>
                <div className="py-4 text-center">
                    <p className="text-xs text-white/40 italic">No savings goals set yet.</p>
                </div>
            </div>
        )
    }

    const PROGRESS_COLORS = ['bg-emerald-400', 'bg-indigo-400', 'bg-fuchsia-400', 'bg-amber-400', 'bg-rose-400']

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Goals</h3>
                <Target className="w-4 h-4 text-white/50" />
            </div>

            <div className="space-y-4">
                {goals.slice(0, 5).map((goal, index) => {
                    const percentage = Math.min((goal.balance / (goal.targetAmount ?? 1)) * 100, 100)
                    const colorClass = PROGRESS_COLORS[index % PROGRESS_COLORS.length]

                    return (
                        <div key={goal.id}>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-white/80 font-medium">{goal.name}</span>
                                <span className="text-white">
                                    {hideValues
                                        ? '**** / ****'
                                        : `£${goal.balance.toLocaleString()} / £${goal.targetAmount?.toLocaleString()}`}
                                </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div
                                    className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
