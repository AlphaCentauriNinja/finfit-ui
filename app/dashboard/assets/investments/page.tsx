'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    CandlestickChart,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Plus,
    Edit3,
    History,
    Landmark,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import EmptyStateAlert from '@/app/dashboard/components/EmptyStateAlert'
import AssetOnboardingHero from '@/app/dashboard/components/AssetOnboardingHero'
import AddInvestmentAccountModal from './AddInvestmentAccountModal'
import AddInvestmentHoldingModal from './AddInvestmentHoldingModal'
import type { InvestmentAccountDbRow, InvestmentHoldingDbRow, InvestmentHoldingRow, InvestmentAccountCardData } from './types'

type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'CHF' | 'CAD'

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
    GBP: 'en-GB',
    EUR: 'de-DE',
    USD: 'en-US',
    CHF: 'de-CH',
    CAD: 'en-CA',
}

function normalizeCurrency(value: string | null | undefined): CurrencyCode {
    if (value === 'GBP' || value === 'EUR' || value === 'USD' || value === 'CHF' || value === 'CAD') {
        return value
    }
    return 'GBP'
}

function formatCurrency(value: number, currency: CurrencyCode): string {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

function formatSignedCurrency(value: number, currency: CurrencyCode): string {
    return `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value), currency)}`
}

export default function InvestmentsPage() {
    const router = useRouter()
    const { hideValues } = usePrivacy()
    const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('GBP')

    const [accounts, setAccounts] = useState<InvestmentAccountCardData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
    const [isAddHoldingOpen, setIsAddHoldingOpen] = useState(false)

    // Load data from Supabase
    useEffect(() => {
        let isMounted = true

        const loadData = async () => {
            const supabase = createClient()

            const { data: { user }, error: userError } = await supabase.auth.getUser()
            
            if (!isMounted) return

            if (userError || !user) {
                setLoadError('Please sign in to view your investments.')
                setIsLoading(false)
                return
            }

            const [settingsRes, accountsRes, holdingsRes] = await Promise.all([
                supabase.from('user_settings').select('preferred_currency').maybeSingle(),
                supabase.from('investment_accounts').select('*').order('created_at', { ascending: true }),
                supabase.from('investment_holdings').select('*').order('created_at', { ascending: false }),
            ])

            if (!isMounted) return

            if (settingsRes.data) {
                setPreferredCurrency(normalizeCurrency(settingsRes.data.preferred_currency))
            }

            if (accountsRes.error) {
                setLoadError(accountsRes.error.message)
                setIsLoading(false)
                return
            }

            const dbAccounts = (accountsRes.data ?? []) as InvestmentAccountDbRow[]
            const dbHoldings = (holdingsRes.data ?? []) as InvestmentHoldingDbRow[]

            // Map and aggregate
            const parsedAccounts: InvestmentAccountCardData[] = dbAccounts.map((acc) => {
                const accHoldings = dbHoldings
                    .filter((h) => h.account_id === acc.id)
                    .map((h) => ({
                        id: h.id,
                        accountId: h.account_id,
                        ticker: h.ticker,
                        name: h.name,
                        investedAmount: Number(h.invested_amount),
                        currentValue: Number(h.current_value),
                    }))

                const totalInvested = accHoldings.reduce((sum, h) => sum + h.investedAmount, 0)
                const totalCurrentValue = accHoldings.reduce((sum, h) => sum + h.currentValue, 0)
                const pnl = totalCurrentValue - totalInvested
                const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0

                return {
                    id: acc.id,
                    name: acc.name,
                    type: acc.type,
                    taxStatus: acc.tax_status,
                    holdings: accHoldings,
                    totalInvested,
                    totalCurrentValue,
                    pnl,
                    pnlPct,
                }
            })

            setAccounts(parsedAccounts)
            setLoadError(null)
            setIsLoading(false)
        }

        void loadData()

        return () => { isMounted = false }
    }, [])

    // Global aggregations
    const allHoldings = useMemo(() => accounts.flatMap((a) => a.holdings), [accounts])
    
    const globalInvested = useMemo(() => allHoldings.reduce((s, h) => s + h.investedAmount, 0), [allHoldings])
    const globalCurrent = useMemo(() => allHoldings.reduce((s, h) => s + h.currentValue, 0), [allHoldings])
    const globalPnl = globalCurrent - globalInvested
    const globalPnlPct = globalInvested > 0 ? (globalPnl / globalInvested) * 100 : 0
    const globalIsUp = globalPnl > 0
    const globalIsDown = globalPnl < 0

    if (isLoading) {
        return (
            <div className="w-full animate-pulse transition-opacity">
                <div className="mb-6 h-8 w-48 rounded-lg bg-white/5" />
                <div className="h-[200px] w-full rounded-2xl bg-white/5" />
            </div>
        )
    }

    if (loadError) {
        return (
            <div className="w-full">
                <div className="mb-6 h-8 w-48 rounded-lg bg-white/5" />
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-300">
                    <p className="font-semibold">Unable to load investments</p>
                    <p className="mt-1 text-sm opacity-80">{loadError}</p>
                </div>
            </div>
        )
    }

    if (accounts.length === 0) {
        return (
            <div className="w-full">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Investments Portfolio</h1>
                        <p className="text-sm text-white/65 mt-1">Manage broker accounts, ISAs, and aggregate performance.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsAddAccountOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 transition-colors"
                        >
                            <Landmark className="h-3.5 w-3.5" />
                            Add Account
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <EmptyStateAlert
                        description="No investment accounts tracked yet. Add your first ISA or Taxable account to start monitoring performance."
                    />

                    <AssetOnboardingHero
                        title="Track Your Investment Portfolio"
                        description="FinFit helps you aggregate multiple broker accounts into a single view. Start by creating an account wrapper, then add your stock, ETF, or fund holdings."
                        items={[
                            {
                                icon: Landmark,
                                title: "ISA Accounts",
                                description: "Individual Savings Accounts with tax-efficient wrappers. Track your annual allowance usage and tax-free growth across all providers.",
                                colorClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                            },
                            {
                                icon: CandlestickChart,
                                title: "Taxable (Invest)",
                                description: "Standard brokerage accounts for stocks, funds, and ETFs. Aggregate performance from multiple taxable portfolios in one dashboard.",
                                colorClass: "bg-violet-500/10 border-violet-500/20 text-violet-400"
                            }
                        ]}
                        actionText="Create First Account"
                        onAction={() => setIsAddAccountOpen(true)}
                    />
                </div>

                <AddInvestmentAccountModal
                    isOpen={isAddAccountOpen}
                    onClose={() => setIsAddAccountOpen(false)}
                    onCreated={() => { router.refresh() }}
                />
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Investments Portfolio</h1>
                    <p className="text-sm text-white/65 mt-1">
                        Track ISAs, taxable accounts, and underlying ticker performance manually.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsAddAccountOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 transition-colors"
                    >
                        <Landmark className="h-3.5 w-3.5" />
                        Add Account
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsAddHoldingOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-500 transition-colors"
                    >
                        <TrendingUp className="h-3.5 w-3.5" />
                        Add Holding
                    </button>
                </div>
            </div>

            <div className="mb-8 grid gap-4 lg:grid-cols-4 md:grid-cols-2">
                <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-white/10 lg:col-span-2">
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Global Aggregated Value</p>
                    <div className="mt-2 flex items-baseline gap-3">
                        <p className="text-4xl font-bold text-white">{hideValues ? '****' : formatCurrency(globalCurrent, preferredCurrency)}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium">
                        <div className="flex gap-2 items-center">
                            <span className="text-white/60">Invested:</span>
                            <span className="text-white">{hideValues ? '****' : formatCurrency(globalInvested, preferredCurrency)}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-white/60">PNL:</span>
                            <span className={`flex items-center gap-1.5 ${globalIsUp ? 'text-emerald-400' : globalIsDown ? 'text-rose-400' : 'text-white'}`}>
                                {hideValues ? '****' : formatSignedCurrency(globalPnl, preferredCurrency)}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${globalIsUp ? 'bg-emerald-500/10 text-emerald-300' : globalIsDown ? 'bg-rose-500/10 text-rose-300' : 'bg-white/10 text-white/70'}`}>
                                    {hideValues ? '****' : `${globalPnlPct >= 0 ? '+' : ''}${globalPnlPct.toFixed(2)}%`}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {accounts.map(acc => {
                    const isUp = acc.pnl > 0
                    const isDown = acc.pnl < 0
                    
                    return (
                        <div key={acc.id} className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-bold text-white truncate">{acc.name}</h3>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded flex-shrink-0 ${
                                        acc.type === 'ISA' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                    }`}>
                                        {acc.type}
                                    </span>
                                </div>
                                <p className="text-xs text-white/50 mt-1">{acc.taxStatus} · {acc.holdings.length} {acc.holdings.length === 1 ? 'asset' : 'assets'}</p>
                            </div>

                            <div className="mt-4">
                                <p className="text-xl font-bold text-white">{hideValues ? '****' : formatCurrency(acc.totalCurrentValue, preferredCurrency)}</p>
                                <p className={`text-xs mt-1 ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-white/70'}`}>
                                    {hideValues ? '****' : `${isUp ? '+' : ''}${formatCurrency(acc.pnl, preferredCurrency)} (${acc.pnlPct.toFixed(2)}%)`}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="w-full max-w-none bg-white/5 backdrop-blur-sm rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Underlying Asset Metrics</h3>
                </div>
                {allHoldings.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-white/50 border-t border-white/10">
                        No holdings added yet. Click "Add Holding" to inject assets into your accounts.
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[1000px] table-fixed text-sm">
                            <thead className="bg-[#0f172a]">
                                <tr className="text-white/60 border-b border-white/10">
                                    <th className="text-left font-medium px-4 py-3">Account & Ticker</th>
                                    <th className="text-center font-medium px-4 py-3">Invested</th>
                                    <th className="text-center font-medium px-4 py-3">Current Value</th>
                                    <th className="text-center font-medium px-4 py-3">PNL %</th>
                                    <th className="text-center font-medium px-4 py-3">PNL</th>
                                    <th className="text-center font-medium px-4 py-3">Trend</th>
                                    <th className="text-center font-medium px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allHoldings.map((row) => {
                                    const rowPnl = row.currentValue - row.investedAmount
                                    const rowPnlPct = row.investedAmount > 0 ? (rowPnl / row.investedAmount) * 100 : 0
                                    const rowPnlClassName = rowPnl > 0
                                        ? 'text-emerald-400'
                                        : rowPnl < 0
                                            ? 'text-rose-400'
                                            : 'text-amber-400'

                                    const account = accounts.find(a => a.id === row.accountId)

                                    return (
                                        <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] last:border-b-0">
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white flex items-center gap-2">
                                                        {row.ticker}
                                                        <span className="text-xs bg-white/10 text-white/70 px-1.5 rounded">{account?.name.substring(0, 15)}</span>
                                                    </span>
                                                    <span className="text-xs text-white/50">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center text-white/80">
                                                {hideValues ? '****' : formatCurrency(row.investedAmount, preferredCurrency)}
                                            </td>
                                            <td className="px-4 py-4 text-center text-white font-medium">
                                                {hideValues ? '****' : formatCurrency(row.currentValue, preferredCurrency)}
                                            </td>
                                            <td className={`px-4 py-4 text-center font-semibold ${rowPnlClassName}`}>
                                                {hideValues ? '****' : `${rowPnlPct >= 0 ? '+' : ''}${rowPnlPct.toFixed(2)}%`}
                                            </td>
                                            <td className={`px-4 py-4 text-center font-semibold ${rowPnlClassName}`}>
                                                {hideValues ? '****' : formatSignedCurrency(rowPnl, preferredCurrency)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    {!hideValues && rowPnl > 0 ? (
                                                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                                    ) : !hideValues && rowPnl < 0 ? (
                                                        <ArrowDownRight className="w-4 h-4 text-rose-400" />
                                                    ) : (
                                                        <Minus className="w-4 h-4 text-white/60" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button type="button" className="text-white/40 hover:text-white transition">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AddInvestmentAccountModal
                isOpen={isAddAccountOpen}
                onClose={() => setIsAddAccountOpen(false)}
                onCreated={() => { window.location.reload() }}
            />

            <AddInvestmentHoldingModal
                isOpen={isAddHoldingOpen}
                onClose={() => setIsAddHoldingOpen(false)}
                accounts={accounts}
                onCreated={(row) => { router.refresh() }}
            />
        </div>
    )
}
