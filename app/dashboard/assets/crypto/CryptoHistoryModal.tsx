'use client'

import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Loader2, Minus, X } from 'lucide-react'
import {
    CURRENCY_LOCALE,
    GBP_TO_CURRENCY_RATE,
    type CurrencyCode,
} from '@/lib/crypto-data'
import { createClient } from '@/lib/supabase/client'

type Asset = {
    id: string
    ticker: string
    name: string
    amount: number
    usd: number
    investedGbp: number
    marketValueGbp: number
}

type Props = {
    isOpen: boolean
    onClose: () => void
    asset: Asset
    preferredCurrency: CurrencyCode
}

type TransactionType = 'BUY' | 'SELL'

type CryptoTransactionRow = {
    id: string
    transaction_type: TransactionType
    amount: number | string | null
    total_value_gbp: number | string | null
    transaction_date: string
    notes: string | null
    created_at: string
}

type TransactionEntry = {
    id: string
    type: TransactionType
    amount: number
    totalValueGbp: number
    transactionDate: string
    notes: string | null
    createdAt: string
}

type PnlState = 'positive' | 'negative' | 'neutral'

const getPnlState = (value: number): PnlState => {
    const epsilon = 0.000001
    if (value > epsilon) return 'positive'
    if (value < -epsilon) return 'negative'
    return 'neutral'
}

const convertFromGbp = (valueGbp: number, currency: CurrencyCode): number =>
    valueGbp * GBP_TO_CURRENCY_RATE[currency]

const formatCurrency = (value: number, currency: CurrencyCode): string =>
    new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)

const formatSignedCurrency = (value: number, currency: CurrencyCode): string =>
    `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value), currency)}`

const toNumber = (value: number | string | null | undefined): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) return parsed
    }
    return 0
}

const formatDate = (isoDate: string): string => {
    const date = new Date(`${isoDate}T00:00:00`)
    if (Number.isNaN(date.getTime())) return isoDate
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

export default function CryptoHistoryModal({ isOpen, onClose, asset, preferredCurrency }: Props) {
    const [transactions, setTransactions] = useState<TransactionEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    useEffect(() => {
        let active = true

        const fetchTransactions = async () => {
            setIsLoading(true)
            setLoadError(null)

            const supabase = createClient()
            const { data, error } = await supabase
                .from('crypto_transactions')
                .select('id, transaction_type, amount, total_value_gbp, transaction_date, notes, created_at')
                .eq('crypto_asset_id', asset.id)
                .order('transaction_date', { ascending: false })
                .order('created_at', { ascending: false })

            if (!active) return

            if (error) {
                setLoadError(error.message)
                setTransactions([])
                setIsLoading(false)
                return
            }

            const rows = (data ?? []) as CryptoTransactionRow[]
            const normalized = rows.map<TransactionEntry>((row) => ({
                id: row.id,
                type: row.transaction_type,
                amount: toNumber(row.amount),
                totalValueGbp: toNumber(row.total_value_gbp),
                transactionDate: row.transaction_date,
                notes: row.notes,
                createdAt: row.created_at,
            }))

            setTransactions(normalized)
            setIsLoading(false)
        }

        void fetchTransactions()

        return () => {
            active = false
        }
    }, [asset.id])

    if (!isOpen) return null

    const pnl = asset.marketValueGbp - asset.investedGbp
    const pnlPct = asset.investedGbp > 0 ? (pnl / asset.investedGbp) * 100 : 0
    const pnlState = getPnlState(pnl)
    const PnlIcon = pnlState === 'positive' ? ArrowUpRight : pnlState === 'negative' ? ArrowDownRight : Minus
    const pnlClassName = pnlState === 'positive'
        ? 'text-emerald-300'
        : pnlState === 'negative'
            ? 'text-rose-300'
            : 'text-amber-300'

    const totalBuys = transactions
        .filter((entry) => entry.type === 'BUY')
        .reduce((sum, entry) => sum + entry.totalValueGbp, 0)

    const totalSells = transactions
        .filter((entry) => entry.type === 'SELL')
        .reduce((sum, entry) => sum + entry.totalValueGbp, 0)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-5xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white">History</h2>
                        <p className="text-xs text-white/60 mt-1">{asset.name} ({asset.ticker})</p>
                    </div>
                    <button onClick={onClose} className="text-rose-300 hover:text-rose-200 transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                            <p className="text-xs uppercase tracking-wider text-white/45">Current Value</p>
                            <p className="mt-1 text-lg font-semibold text-white">
                                {formatCurrency(convertFromGbp(asset.marketValueGbp, preferredCurrency), preferredCurrency)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                            <p className="text-xs uppercase tracking-wider text-white/45">Total Invested</p>
                            <p className="mt-1 text-lg font-semibold text-white">
                                {formatCurrency(convertFromGbp(asset.investedGbp, preferredCurrency), preferredCurrency)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                            <p className="text-xs uppercase tracking-wider text-white/45">PNL</p>
                            <p className={`mt-1 text-lg font-semibold inline-flex items-center gap-1.5 ${pnlClassName}`}>
                                <PnlIcon className="h-4 w-4" />
                                {formatSignedCurrency(convertFromGbp(pnl, preferredCurrency), preferredCurrency)}
                            </p>
                            <p className={`text-xs mt-1 ${pnlClassName}`}>{pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                            <p className="text-xs uppercase tracking-wider text-emerald-200/70">Total Buys</p>
                            <p className="mt-1 text-base font-semibold text-emerald-100">
                                {formatCurrency(convertFromGbp(totalBuys, preferredCurrency), preferredCurrency)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                            <p className="text-xs uppercase tracking-wider text-rose-200/70">Total Sells</p>
                            <p className="mt-1 text-base font-semibold text-rose-100">
                                {formatCurrency(convertFromGbp(totalSells, preferredCurrency), preferredCurrency)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="grid gap-3 md:grid-cols-2 text-sm">
                            <div>
                                <p className="text-white/45 uppercase tracking-wider text-xs">Amount Held</p>
                                <p className="text-white/85 mt-1">{asset.amount.toLocaleString('en-GB', { maximumFractionDigits: 8 })}</p>
                            </div>
                            <div>
                                <p className="text-white/45 uppercase tracking-wider text-xs">Live Price (USD)</p>
                                <p className="text-white/85 mt-1">
                                    ${asset.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {loadError ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                            {loadError}
                        </div>
                    ) : isLoading ? (
                        <div className="h-32 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-sm text-white/65 text-center">
                            No transactions recorded for this coin yet. Use the Transaction button to add one.
                        </div>
                    ) : (
                        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[820px] text-sm">
                                    <thead className="bg-white/[0.03]">
                                        <tr className="text-white/60">
                                            <th className="text-center font-medium px-4 py-3">Date</th>
                                            <th className="text-center font-medium px-4 py-3">Type</th>
                                            <th className="text-center font-medium px-4 py-3">Amount</th>
                                            <th className="text-center font-medium px-4 py-3">Total ({preferredCurrency})</th>
                                            <th className="text-center font-medium px-4 py-3">Unit Price ({preferredCurrency})</th>
                                            <th className="text-center font-medium px-4 py-3">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((entry) => {
                                            const typeTone = entry.type === 'BUY'
                                                ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                                                : 'text-rose-300 bg-rose-500/10 border-rose-500/30'
                                            const unitPriceGbp = entry.amount > 0 ? (entry.totalValueGbp / entry.amount) : 0

                                            return (
                                                <tr key={entry.id} className="border-t border-white/10">
                                                    <td className="px-4 py-3 text-center text-white/80">
                                                        {formatDate(entry.transactionDate)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${typeTone}`}>
                                                            {entry.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-white/85 font-medium">
                                                        {entry.amount.toLocaleString('en-GB', { maximumFractionDigits: 8 })}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-white/85">
                                                        {formatCurrency(convertFromGbp(entry.totalValueGbp, preferredCurrency), preferredCurrency)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-white/75">
                                                        {formatCurrency(convertFromGbp(unitPriceGbp, preferredCurrency), preferredCurrency)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-white/70">
                                                        {entry.notes?.trim() || '-'}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
