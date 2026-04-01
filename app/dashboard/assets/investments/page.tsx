'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    CandlestickChart,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Plus,
    History,
    Landmark,
    TrendingUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import EmptyStateAlert from '@/app/dashboard/components/EmptyStateAlert'
import AssetOnboardingHero from '@/app/dashboard/components/AssetOnboardingHero'
import InvestmentAccountCard from './InvestmentAccountCard'
import EditAccountModal from './EditAccountModal'
import AccountTransactionModal from './AccountTransactionModal'
import AccountHistoryModal from './AccountHistoryModal'
import InvestmentEditModal from './InvestmentEditModal'
import InvestmentTransactionModal from './InvestmentTransactionModal'
import InvestmentHistoryModal from './InvestmentHistoryModal'
import AddInvestmentAccountModal from './AddInvestmentAccountModal'
import AddInvestmentHoldingModal from './AddInvestmentHoldingModal'
import { useDashboardDataActions } from '@/app/dashboard/components/providers/DashboardDataProvider'
import InvestmentPerformanceModal from './InvestmentPerformanceModal'
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

function formatCurrency(value: number, currency: string): string {
    const code = normalizeCurrency(currency)
    return new Intl.NumberFormat(CURRENCY_LOCALE[code], {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

function formatSignedCurrency(value: number, currency: string): string {
    return `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value), currency)}`
}

export default function InvestmentsPage() {
    const { hideValues } = usePrivacy()
    const { updateInvestmentsValue } = useDashboardDataActions()
    const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('GBP')

    const [accounts, setAccounts] = useState<InvestmentAccountCardData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
    const [isAddHoldingOpen, setIsAddHoldingOpen] = useState(false)
    const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined)

    // Account Management states
    const [editingAccount, setEditingAccount] = useState<InvestmentAccountCardData | null>(null)
    const [transactionAccount, setTransactionAccount] = useState<InvestmentAccountCardData | null>(null)
    const [historyAccount, setHistoryAccount] = useState<InvestmentAccountCardData | null>(null)
    const [isPerformanceOpen, setIsPerformanceOpen] = useState(false)

    // Holding Management states
    const [editingHolding, setEditingHolding] = useState<InvestmentHoldingRow | null>(null)
    const [transactionHolding, setTransactionHolding] = useState<InvestmentHoldingRow | null>(null)
    const [historyHolding, setHistoryHolding] = useState<InvestmentHoldingRow | null>(null)

    // Load data from Supabase
    const loadData = useCallback(async () => {
        setIsLoading(true)
        setLoadError(null)

        const supabase = createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
            setLoadError('Please sign in to view your investments.')
            setIsLoading(false)
            return
        }

        const [settingsRes, accountsRes, holdingsRes, accountTxRes] = await Promise.all([
            supabase.from('user_settings').select('preferred_currency').maybeSingle(),
            supabase.from('investment_accounts').select('*').order('created_at', { ascending: true }),
            supabase.from('investment_holdings').select('*').order('created_at', { ascending: false }),
            supabase
                .from('investment_transactions')
                .select('account_id, invested_amount_impact, current_value_impact, holding_id')
                .is('holding_id', null)
                .eq('user_id', user.id)
        ])

        if (settingsRes.data) {
            setPreferredCurrency(normalizeCurrency(settingsRes.data.preferred_currency))
        }

        if (accountsRes.error) {
            setLoadError(accountsRes.error.message)
            setIsLoading(false)
            return
        }

        if (accountTxRes.error) {
            setLoadError(accountTxRes.error.message)
            setIsLoading(false)
            return
        }

        const dbAccounts = (accountsRes.data ?? []) as InvestmentAccountDbRow[]
        const dbHoldings = (holdingsRes.data ?? []) as InvestmentHoldingDbRow[]
        const accountOnlyTransactions = accountTxRes.data ?? []

        const accountAdjustments = accountOnlyTransactions.reduce<Record<string, { invested: number; current: number }>>((acc, tx) => {
            const key = tx.account_id
            if (!acc[key]) acc[key] = { invested: 0, current: 0 }
            acc[key].invested += Number(tx.invested_amount_impact) || 0
            acc[key].current += Number(tx.current_value_impact) || 0
            return acc
        }, {})

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

            const adj = accountAdjustments[acc.id] || { invested: 0, current: 0 }

            const holdingsInvested = accHoldings.reduce((sum, h) => sum + h.investedAmount, 0)
            const holdingsCurrent = accHoldings.reduce((sum, h) => sum + h.currentValue, 0)
            const totalInvested = holdingsInvested + adj.invested
            const totalCurrentValue = holdingsCurrent + adj.current
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
        const nextTotalInvestments = parsedAccounts.reduce((sum, acc) => sum + acc.totalCurrentValue, 0)
        updateInvestmentsValue(nextTotalInvestments)
        setLoadError(null)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        void loadData()
    }, [loadData])

    // Real-time sync for investment tables
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('investment-live-sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'investment_holdings' },
                () => { void loadData() }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'investment_transactions' },
                () => { void loadData() }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'investment_accounts' },
                () => { void loadData() }
            )
            .subscribe()

        return () => {
            void supabase.removeChannel(channel)
        }
    }, [loadData])

    // Global aggregations (include account-level adjustments)
    const globalInvested = useMemo(() => accounts.reduce((sum, acc) => sum + acc.totalInvested, 0), [accounts])
    const globalCurrent = useMemo(() => accounts.reduce((sum, acc) => sum + acc.totalCurrentValue, 0), [accounts])
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
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
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
                    onCreated={loadData}
                />
            </div>
        )
    }

    const openAddHolding = (accId?: string) => {
        setSelectedAccountId(accId)
        setIsAddHoldingOpen(true)
    }

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Investments Portfolio</h1>
                    <p className="text-sm text-white/65 mt-1">
                        Track ISAs, taxable accounts, and underlying ticker performance.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsAddAccountOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Add Account
                    </button>
                    <button
                        type="button"
                        onClick={() => openAddHolding()}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
                    >
                        <TrendingUp className="h-4 w-4" />
                        Add Investment
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsPerformanceOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-100 hover:bg-amber-500/20 transition-all active:scale-95"
                    >
                        <CandlestickChart className="h-4 w-4" />
                        Performance
                    </button>
                </div>
            </div>

            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                <p className="text-sm font-medium text-white/60">Total Investment Value</p>
                <div className="mt-2 flex items-baseline gap-4">
                    <p className="text-3xl font-bold text-white">
                        {hideValues ? '****' : formatCurrency(globalCurrent, preferredCurrency)}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            globalIsUp ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 
                            globalIsDown ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 
                            'border-white/10 bg-white/5 text-white/70'
                        }`}>
                            {globalIsUp ? <ArrowUpRight className="mr-1 h-3.5 w-3.5" /> : 
                             globalIsDown ? <ArrowDownRight className="mr-1 h-3.5 w-3.5" /> : 
                             <Minus className="mr-1 h-3.5 w-3.5" />}
                            PNL {hideValues ? '****' : formatSignedCurrency(globalPnl, preferredCurrency)}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            globalIsUp ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 
                            globalIsDown ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 
                            'border-white/10 bg-white/5 text-white/70'
                        }`}>
                            {hideValues ? '****' : `${globalPnlPct >= 0 ? '+' : ''}${globalPnlPct.toFixed(2)}%`}
                        </span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-6 text-sm font-medium">
                    <div className="flex gap-2 items-center">
                        <span className="text-white/40 uppercase tracking-widest text-[10px]">Net Invested:</span>
                        <span className="text-white/80">{hideValues ? '****' : formatCurrency(globalInvested, preferredCurrency)}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {accounts.map((account) => (
                    <InvestmentAccountCard
                        key={account.id}
                        account={account}
                        totalPortfolioValue={globalCurrent}
                        preferredCurrency={preferredCurrency}
                        formatCurrency={formatCurrency}
                        onEdit={(acc) => setEditingAccount(acc)}
                        onTransaction={(acc) => setTransactionAccount(acc)}
                        onHistory={(acc) => setHistoryAccount(acc)}
                        onAddHolding={(accId) => openAddHolding(accId)}
                        onEditHolding={(holding) => setEditingHolding(holding)}
                    />
                ))}
            </div>

            {/* Account Modals */}
            <AddInvestmentAccountModal
                isOpen={isAddAccountOpen}
                onClose={() => setIsAddAccountOpen(false)}
                onCreated={loadData}
            />

            {editingAccount && (
                <EditAccountModal
                    isOpen={true}
                    onClose={() => setEditingAccount(null)}
                    account={editingAccount}
                />
            )}

            {transactionAccount && (
                <AccountTransactionModal
                    isOpen={true}
                    onClose={() => setTransactionAccount(null)}
                    account={transactionAccount}
                    onSaved={loadData}
                />
            )}

            {historyAccount && (
                <AccountHistoryModal
                    isOpen={true}
                    onClose={() => setHistoryAccount(null)}
                    account={historyAccount}
                    preferredCurrency={preferredCurrency}
                    formatCurrency={formatCurrency}
                    onChanged={loadData}
                />
            )}

            {/* Holding Modals */}
            <AddInvestmentHoldingModal
                isOpen={isAddHoldingOpen}
                onClose={() => {
                    setIsAddHoldingOpen(false)
                    setSelectedAccountId(undefined)
                }}
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onCreated={() => { void loadData() }}
            />

            {editingHolding && (
                <InvestmentEditModal
                    isOpen={true}
                    onClose={() => setEditingHolding(null)}
                    holding={editingHolding}
                    onUpdated={() => void loadData()}
                    onDeleted={() => {
                        setEditingHolding(null)
                        void loadData()
                    }}
                />
            )}

            {transactionHolding && (
                <InvestmentTransactionModal
                    isOpen={true}
                    onClose={() => setTransactionHolding(null)}
                    holding={transactionHolding}
                    onSaved={loadData}
                />
            )}

            {historyHolding && (
                <InvestmentHistoryModal
                    isOpen={true}
                    onClose={() => setHistoryHolding(null)}
                    holding={historyHolding}
                    preferredCurrency={preferredCurrency}
                    formatCurrency={formatCurrency}
                />
            )}

            <InvestmentPerformanceModal
                isOpen={isPerformanceOpen}
                onClose={() => setIsPerformanceOpen(false)}
            />
        </div>
    )
}
