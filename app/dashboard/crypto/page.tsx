'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit3, Trash2, History, Wifi, WifiOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type CryptoRow = {
    id: string
    ticker: 'BTC' | 'XRP' | 'ADA' | 'SOL' | 'ALGO' | 'ETH'
    description: string
    amount: number
    usd: number
    marketValueGbp: number
    investedGbp: number
}

type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'CHF' | 'CAD'

const USD_TO_GBP = 0.746
const GBP_TO_CURRENCY_RATE: Record<CurrencyCode, number> = {
    GBP: 1,
    EUR: 1.17,
    USD: 1.28,
    CHF: 1.13,
    CAD: 1.74,
}

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
    GBP: 'en-GB',
    EUR: 'de-DE',
    USD: 'en-US',
    CHF: 'de-CH',
    CAD: 'en-CA',
}

const cryptoRows: CryptoRow[] = [
    {
        id: 'C.1',
        ticker: 'BTC',
        description: 'Bitcoin',
        amount: 0.238478,
        usd: 67207.08,
        marketValueGbp: 11954.51,
        investedGbp: 11929.00,
    },
    {
        id: 'C.2',
        ticker: 'XRP',
        description: 'Ripple XRP',
        amount: 2689.15,
        usd: 1.34,
        marketValueGbp: 2687.75,
        investedGbp: 2667.75,
    },
    {
        id: 'C.3',
        ticker: 'ADA',
        description: 'Cardano',
        amount: 5332.275228,
        usd: 0.2493,
        marketValueGbp: 991.52,
        investedGbp: 984.70,
    },
    {
        id: 'C.4',
        ticker: 'SOL',
        description: 'Solana',
        amount: 7.59431,
        usd: 81.99,
        marketValueGbp: 464.43,
        investedGbp: 461.46,
    },
    {
        id: 'C.5',
        ticker: 'ALGO',
        description: 'Algorand',
        amount: 1055.66,
        usd: 0.08209,
        marketValueGbp: 64.64,
        investedGbp: 63.81,
    },
    {
        id: 'C.6',
        ticker: 'ETH',
        description: 'Ethereum',
        amount: 0.023609,
        usd: 1941.89,
        marketValueGbp: 34.20,
        investedGbp: 33.86,
    },
]

const streamSymbols = cryptoRows.map((row) => `${row.ticker.toLowerCase()}usdt`)
const binanceCombinedStreamUrl = `wss://stream.binance.com:9443/stream?streams=${streamSymbols
    .map((symbol) => `${symbol}@ticker`)
    .join('/')}`

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

export default function CryptoPage() {
    const [liveUsdByTicker, setLiveUsdByTicker] = useState<Partial<Record<CryptoRow['ticker'], number>>>({})
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('GBP')

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

                    const ticker = symbol.replace('USDT', '') as CryptoRow['ticker']
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
        return cryptoRows.map((row) => {
            const liveUsd = liveUsdByTicker[row.ticker] ?? row.usd
            const marketValueGbp = row.amount * liveUsd * USD_TO_GBP
            return {
                ...row,
                usd: liveUsd,
                marketValueGbp,
            }
        })
    }, [liveUsdByTicker])

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
                <div className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${isSocketConnected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                    {isSocketConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                    {isSocketConnected ? 'Connected' : 'Reconnecting'}
                </div>
            </div>

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

            <div className="w-full max-w-none bg-white/5 backdrop-blur-sm rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Crypto Holdings</h3>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[1300px] table-fixed text-sm">
                        <thead className="bg-white/[0.03]">
                            <tr className="text-white/60">
                                <th className="text-center font-medium px-4 py-3">Ticker</th>
                                <th className="text-center font-medium px-4 py-3">Description</th>
                                <th className="text-center font-medium px-4 py-3">Amount</th>
                                <th className="text-center font-medium px-4 py-3">USD</th>
                                <th className="text-center font-medium px-4 py-3">{preferredCurrency}</th>
                                <th className="text-center font-medium px-4 py-3">Invested</th>
                                <th className="text-center font-medium px-4 py-3">PNL %</th>
                                <th className="text-center font-medium px-4 py-3">PNL</th>
                                <th className="text-center font-medium px-4 py-3">Edit</th>
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
                                        <td className="px-4 py-4 text-center text-white/80">{row.description}</td>
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
                                                className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-white/10 text-white/80 hover:bg-white/15 transition-colors"
                                                aria-label={`Edit ${row.ticker}`}
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 transition-colors"
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
        </div>
    )
}
