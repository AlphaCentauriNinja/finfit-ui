'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, History, Wifi, WifiOff, Plus, X, Loader2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useDashboardData } from '@/app/dashboard/components/providers/DashboardDataProvider'
import { ImportLedgerModal } from './ImportLedgerModal'
import DeleteActionModal from '@/app/dashboard/components/DeleteActionModal'

import {
    CryptoRow,
    CurrencyCode,
    USD_TO_GBP,
    GBP_TO_CURRENCY_RATE,
    CURRENCY_LOCALE,
    DEFAULT_COIN_NAME_BY_TICKER,
    initialCryptoRows,
    binanceCombinedStreamUrl
} from '@/lib/crypto-data'

function normalizeCurrency(value: string | null | undefined): CurrencyCode {
    if (value === 'GBP' || value === 'EUR' || value === 'USD' || value === 'CHF' || value === 'CAD') {
        return value
    }
    return 'GBP'
}

function convertFromGbp(valueGbp: number, currency: CurrencyCode): number {
    return valueGbp * GBP_TO_CURRENCY_RATE[currency]
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

function formatUsd(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type AddCoinModalProps = {
    isOpen: boolean
    onClose: () => void
}

function AddCoinModal({ isOpen, onClose }: AddCoinModalProps) {
    const [ticker, setTicker] = useState('')
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [usd, setUsd] = useState('')
    const [invested, setInvested] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    if (!isOpen) return null

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanTicker = ticker.trim().toUpperCase()
        const cleanName = name.trim()
        const parsedAmount = Number(amount)
        const parsedUsd = Number(usd)
        const parsedInvested = Number(invested)

        if (!cleanTicker || !cleanName) {
            setError('Ticker and name are required.')
            return
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setError('Amount must be greater than 0.')
            return
        }

        if (!Number.isFinite(parsedUsd) || parsedUsd < 0) {
            setError('USD price must be 0 or greater.')
            return
        }

        if (!Number.isFinite(parsedInvested) || parsedInvested < 0) {
            setError('Invested amount must be 0 or greater.')
            return
        }

        setIsSaving(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setError('You must be logged in to add a coin.')
            setIsSaving(false)
            return
        }

        const { error: insertError } = await supabase.from('crypto_assets').insert({
            user_id: user.id,
            ticker: cleanTicker,
            name: cleanName,
            amount: parsedAmount,
            usd: parsedUsd,
            invested_gbp: parsedInvested,
        })

        if (insertError) {
            setError(insertError.message || 'Failed to add crypto asset.')
            setIsSaving(false)
            return
        }

        setTicker('')
        setName('')
        setAmount('')
        setUsd('')
        setInvested('')
        setError(null)
        setIsSaving(false)
        router.refresh()
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Add Crypto Coin</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close add coin modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Ticker</label>
                            <input
                                type="text"
                                value={ticker}
                                onChange={(event) => setTicker(event.target.value)}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="e.g. BTC"
                                maxLength={10}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Amount</label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="e.g. Bitcoin"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">USD Price</label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={usd}
                                onChange={(event) => setUsd(event.target.value)}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Invested (GBP)</label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={invested}
                                onChange={(event) => setInvested(event.target.value)}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {error ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {error}
                        </div>
                    ) : null}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {isSaving ? 'Saving...' : 'Add Coin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function CryptoPage() {
    const { crypto } = useDashboardData()
    const [liveUsdByTicker, setLiveUsdByTicker] = useState<Record<string, number>>({})
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('GBP')
    const [isAddCoinOpen, setIsAddCoinOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [coinToDelete, setCoinToDelete] = useState<{ id: string; name: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDeleteCoin = async () => {
        if (!coinToDelete) return

        setIsDeleting(true)
        const supabase = createClient()
        const { error } = await supabase
            .from('crypto_assets')
            .delete()
            .eq('id', coinToDelete.id)

        setIsDeleting(false)

        if (!error) {
            setCoinToDelete(null)
            router.refresh()
        } else {
            console.error('Error deleting coin:', error)
        }
    }

    useEffect(() => {
        let isMounted = true

        const loadPreferredCurrency = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('user_settings')
                .select('preferred_currency')
                .maybeSingle()

            if (!isMounted) return

            setPreferredCurrency(normalizeCurrency(data?.preferred_currency))
        }

        void loadPreferredCurrency()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isActive = true
        let socket: WebSocket | null = null
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null

        const connect = () => {
            if (!isActive) return
            socket = new WebSocket(binanceCombinedStreamUrl)

            socket.onopen = () => {
                if (!isActive) return
                setIsSocketConnected(true)
            }

            socket.onmessage = (event: MessageEvent) => {
                if (!isActive) return
                try {
                    const parsed = JSON.parse(event.data) as { data?: { s?: string; c?: string } }
                    const symbol = parsed.data?.s
                    const close = parsed.data?.c
                    if (!symbol || !close) return

                    const ticker = symbol.replace('USDT', '')
                    const nextUsd = Number(close)
                    if (!Number.isFinite(nextUsd)) return

                    setLiveUsdByTicker((previous) => ({ ...previous, [ticker]: nextUsd }))
                } catch {
                    // Ignore malformed messages.
                }
            }

            socket.onclose = () => {
                if (!isActive) return
                setIsSocketConnected(false)
                reconnectTimer = setTimeout(connect, 3000)
            }

            socket.onerror = () => {
                socket?.close()
            }
        }

        connect()

        return () => {
            isActive = false
            if (reconnectTimer) clearTimeout(reconnectTimer)
            socket?.close()
        }
    }, [])

    const calculatedRows = useMemo(() => {
        return crypto.assets.map((row) => {
            const liveUsd = liveUsdByTicker[row.ticker] ?? row.usd
            const marketValueGbp = row.amount * liveUsd * USD_TO_GBP
            const normalizedName =
                row.name?.trim() ||
                DEFAULT_COIN_NAME_BY_TICKER[row.ticker.toUpperCase()] ||
                row.ticker

            return {
                ...row,
                name: normalizedName,
                usd: liveUsd,
                marketValueGbp,
            }
        })
    }, [crypto.assets, liveUsdByTicker])

    const totalInvested = useMemo(
        () => calculatedRows.reduce((sum, row) => sum + row.investedGbp, 0),
        [calculatedRows]
    )
    const totalCurrent = useMemo(
        () => calculatedRows.reduce((sum, row) => sum + row.marketValueGbp, 0),
        [calculatedRows]
    )
    const pnl = totalCurrent - totalInvested
    const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0
    const isUp = pnl > 0
    const isDown = pnl < 0

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Crypto Portfolio</h1>
                    <p className="text-sm text-white/65 mt-1">
                        Live updates powered by Binance
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsAddCoinOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Coin
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsImportOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        Import
                    </button>
                    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${isSocketConnected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                        {isSocketConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                        {isSocketConnected ? 'Connected' : 'Reconnecting'}
                    </div>
                </div>
            </div>

            {crypto.assets.length > 0 ? (
                <div className="mb-8 grid gap-6 md:grid-cols-3">
                    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
                        <p className="text-sm font-medium text-white/60">Current Value</p>
                        <p className="text-3xl font-bold text-white mt-2">{formatCurrency(convertFromGbp(totalCurrent, preferredCurrency), preferredCurrency)}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
                        <p className="text-sm font-medium text-white/60">Total Invested</p>
                        <p className="text-3xl font-bold text-white mt-2">{formatCurrency(convertFromGbp(totalInvested, preferredCurrency), preferredCurrency)}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
                        <p className="text-sm font-medium text-white/60">PNL</p>
                        <div className="flex items-center gap-2 mt-2">
                            <p className={`text-3xl font-bold ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-white'}`}>
                                {formatSignedCurrency(convertFromGbp(pnl, preferredCurrency), preferredCurrency)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-md ${isUp ? 'text-emerald-300 bg-emerald-500/10' : isDown ? 'text-rose-300 bg-rose-500/10' : 'text-white/70 bg-white/10'}`}>
                                {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}

            {crypto.assets.length === 0 ? (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-6 py-8 text-center backdrop-blur-sm">
                    <p className="text-indigo-200/90 font-medium mb-4">No crypto assets tracked yet.</p>
                    <p className="text-sm text-indigo-200/60">Use the Add Coin button above to monitor your portfolio.</p>
                </div>
            ) : (
                <div className="w-full max-w-none bg-white/5 backdrop-blur-sm rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10">
                        <h3 className="text-sm font-semibold text-white">Crypto Holdings</h3>
                    </div>
                    <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[1300px] table-fixed text-sm">
                        <thead className="bg-white/[0.03]">
                            <tr className="text-white/60">
                                <th className="text-center font-medium px-4 py-3">Ticker</th>
                                <th className="text-center font-medium px-4 py-3">Name</th>
                                <th className="text-center font-medium px-4 py-3">Amount</th>
                                <th className="text-center font-medium px-4 py-3">Price (USD)</th>
                                <th className="text-center font-medium px-4 py-3">Value ({preferredCurrency})</th>
                                <th className="text-center font-medium px-4 py-3">Invested</th>
                                <th className="text-center font-medium px-4 py-3">PNL %</th>
                                <th className="text-center font-medium px-4 py-3">PNL</th>
                                <th className="text-center font-medium px-4 py-3">Delete</th>
                                <th className="text-center font-medium px-4 py-3">History</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calculatedRows.map((row) => {
                                const rowPnl = row.marketValueGbp - row.investedGbp
                                const rowPnlPct = row.investedGbp > 0 ? (rowPnl / row.investedGbp) * 100 : 0
                                const rowPnlClassName = rowPnl > 0
                                    ? 'text-emerald-400'
                                    : rowPnl < 0
                                        ? 'text-rose-400'
                                        : 'text-amber-400'

                                return (
                                    <tr key={row.id} className="border-t border-white/10">
                                        <td className="px-4 py-4 text-center text-white font-semibold">{row.ticker}</td>
                                        <td className="px-4 py-4 text-center text-white/80">{row.name}</td>
                                        <td className="px-4 py-4 text-center text-white/80">{row.amount.toLocaleString('en-GB', { maximumFractionDigits: 8 })}</td>
                                        <td className="px-4 py-4 text-center text-white/80">${formatUsd(row.usd)}</td>
                                        <td className="px-4 py-4 text-center text-white/90">
                                            {formatCurrency(convertFromGbp(row.marketValueGbp, preferredCurrency), preferredCurrency)}
                                        </td>
                                        <td className="px-4 py-4 text-center text-white/80">
                                            {formatCurrency(convertFromGbp(row.investedGbp, preferredCurrency), preferredCurrency)}
                                        </td>
                                        <td className={`px-4 py-4 text-center font-semibold ${rowPnlClassName}`}>
                                            {rowPnlPct >= 0 ? '+' : ''}{rowPnlPct.toFixed(2)}%
                                        </td>
                                        <td className={`px-4 py-4 text-center font-semibold ${rowPnlClassName}`}>
                                            {formatSignedCurrency(convertFromGbp(rowPnl, preferredCurrency), preferredCurrency)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setCoinToDelete({ id: row.id, name: row.name })}
                                                className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                                aria-label={`Delete ${row.ticker}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 justify-center h-9 px-3 rounded-lg bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25 transition-colors"
                                                aria-label={`History for ${row.ticker}`}
                                            >
                                                <History className="w-4 h-4" />
                                                History
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            <AddCoinModal
                isOpen={isAddCoinOpen}
                onClose={() => setIsAddCoinOpen(false)}
            />

            <ImportLedgerModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
            />

            <DeleteActionModal
                isOpen={!!coinToDelete}
                onClose={() => !isDeleting && setCoinToDelete(null)}
                onConfirm={handleDeleteCoin}
                title="Delete Asset"
                message={`Are you sure you want to delete ${coinToDelete?.name}? This action cannot be undone.`}
                isProcessing={isDeleting}
            />
        </div>
    )
}
