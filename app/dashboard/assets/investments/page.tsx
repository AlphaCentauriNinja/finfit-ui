'use client'

import { useEffect, useMemo, useState } from 'react'
import { 
    CandlestickChart, 
    ArrowUpRight, 
    ArrowDownRight, 
    Minus, 
    Plus, 
    Edit3, 
    History, 
    X 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts'

// --- Types & Constants ---

type InstrumentKey =
    | 'combined'
    | 'AAPL'
    | 'AMZN'
    | 'NVDA'
    | 'MSFT'
    | 'VUSA'
    | 'VWRL'
    | 'QQQ'
    | 'SMH'

type TimeframeOption =
    | 'this-month'
    | 'last-month'
    | 'last-3-months'
    | 'last-6-months'
    | 'last-12-months'
    | 'ytd'
    | 'all-time'

type OhlcPoint = {
    time: string
    open: number
    high: number
    low: number
    close: number
}

type TooltipProps = {
    active?: boolean
    payload?: Array<{ payload: OhlcPoint }>
}

type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'CHF' | 'CAD'

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
    GBP: 'en-GB',
    EUR: 'de-DE',
    USD: 'en-US',
    CHF: 'de-CH',
    CAD: 'en-CA',
}

const instrumentOptions: { label: string; value: InstrumentKey }[] = [
    { label: 'Combined Portfolio', value: 'combined' },
    { label: 'Apple (AAPL)', value: 'AAPL' },
    { label: 'Amazon (AMZN)', value: 'AMZN' },
    { label: 'NVIDIA (NVDA)', value: 'NVDA' },
    { label: 'Microsoft (MSFT)', value: 'MSFT' },
    { label: 'VUSA', value: 'VUSA' },
    { label: 'VWRL', value: 'VWRL' },
    { label: 'QQQ', value: 'QQQ' },
    { label: 'SMH', value: 'SMH' },
]

const timeframeOptions: { label: string; value: TimeframeOption }[] = [
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'Last 3 Months', value: 'last-3-months' },
    { label: 'Last 6 Months', value: 'last-6-months' },
    { label: 'Last 12 Months', value: 'last-12-months' },
    { label: 'YTD', value: 'ytd' },
    { label: 'All Time', value: 'all-time' },
]

const initialPositionRows: Array<{ ticker: Exclude<InstrumentKey, 'combined'>; invested: number; value: number }> = [
    { ticker: 'AAPL', invested: 9200, value: 10850 },
    { ticker: 'AMZN', invested: 7800, value: 8340 },
    { ticker: 'NVDA', invested: 12100, value: 17880 },
    { ticker: 'MSFT', invested: 10250, value: 11420 },
    { ticker: 'VUSA', invested: 4200, value: 4395 },
    { ticker: 'VWRL', invested: 3900, value: 3865 },
    { ticker: 'QQQ', invested: 6100, value: 6890 },
    { ticker: 'SMH', invested: 4850, value: 5420 },
]

const instrumentBasePrice: Record<InstrumentKey, number> = {
    combined: 112,
    AAPL: 190,
    AMZN: 170,
    NVDA: 730,
    MSFT: 420,
    VUSA: 86,
    VWRL: 102,
    QQQ: 462,
    SMH: 214,
}

const instrumentSeed: Record<InstrumentKey, number> = {
    combined: 3,
    AAPL: 7,
    AMZN: 11,
    NVDA: 17,
    MSFT: 23,
    VUSA: 29,
    VWRL: 31,
    QQQ: 37,
    SMH: 41,
}

// --- Helper Functions ---

const round = (value: number) => Math.round(value * 100) / 100

function parseDate(dateValue: string): Date {
    const [y, m, d] = dateValue.split('-').map(Number)
    return new Date(y, m - 1, d)
}

function formatDate(date: Date): string {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

function formatShortDate(dateValue: string): string {
    const date = parseDate(dateValue)
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
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

// --- Mock Data Generation ---

function createMockOhlcSeries(basePrice: number, seed: number, startDate: string, points = 420): OhlcPoint[] {
    const data: OhlcPoint[] = []
    let previousClose = basePrice

    for (let i = 0; i < points; i += 1) {
        const day = parseDate(startDate)
        day.setDate(day.getDate() + i)

        const trend = i * (basePrice * 0.00028)
        const wave = Math.sin((i + seed) / 5.5) * (basePrice * 0.01)
        const noise = Math.cos((i + seed) / 3.8) * (basePrice * 0.0025)

        const open = round(previousClose + noise)
        const close = round(Math.max(5, open + wave * 0.33 + trend * 0.05))
        const high = round(Math.max(open, close) + Math.abs(Math.sin((i + seed) / 2.4)) * (basePrice * 0.006))
        const low = round(Math.min(open, close) - Math.abs(Math.cos((i + seed) / 2.1)) * (basePrice * 0.0055))

        data.push({
            time: formatDate(day),
            open,
            high,
            low,
            close,
        })

        previousClose = close
    }

    return data
}

const mockedOhlcByInstrument: Record<InstrumentKey, OhlcPoint[]> = {
    combined: createMockOhlcSeries(instrumentBasePrice.combined, instrumentSeed.combined, '2025-01-01'),
    AAPL: createMockOhlcSeries(instrumentBasePrice.AAPL, instrumentSeed.AAPL, '2025-01-01'),
    AMZN: createMockOhlcSeries(instrumentBasePrice.AMZN, instrumentSeed.AMZN, '2025-01-01'),
    NVDA: createMockOhlcSeries(instrumentBasePrice.NVDA, instrumentSeed.NVDA, '2025-01-01'),
    MSFT: createMockOhlcSeries(instrumentBasePrice.MSFT, instrumentSeed.MSFT, '2025-01-01'),
    VUSA: createMockOhlcSeries(instrumentBasePrice.VUSA, instrumentSeed.VUSA, '2025-01-01'),
    VWRL: createMockOhlcSeries(instrumentBasePrice.VWRL, instrumentSeed.VWRL, '2025-01-01'),
    QQQ: createMockOhlcSeries(instrumentBasePrice.QQQ, instrumentSeed.QQQ, '2025-01-01'),
    SMH: createMockOhlcSeries(instrumentBasePrice.SMH, instrumentSeed.SMH, '2025-01-01'),
}

function filterByTimeframe(data: OhlcPoint[], timeframe: TimeframeOption): OhlcPoint[] {
    if (timeframe === 'all-time' || data.length === 0) return data

    const latest = parseDate(data[data.length - 1].time)
    const thisMonthStart = new Date(latest.getFullYear(), latest.getMonth(), 1)
    const yearStart = new Date(latest.getFullYear(), 0, 1)

    let fromDate = thisMonthStart
    let toDateExclusive: Date | null = null

    switch (timeframe) {
        case 'this-month':
            fromDate = thisMonthStart
            break
        case 'last-month':
            fromDate = new Date(latest.getFullYear(), latest.getMonth() - 1, 1)
            toDateExclusive = thisMonthStart
            break
        case 'last-3-months':
            fromDate = new Date(latest.getFullYear(), latest.getMonth() - 2, 1)
            break
        case 'last-6-months':
            fromDate = new Date(latest.getFullYear(), latest.getMonth() - 5, 1)
            break
        case 'last-12-months':
            fromDate = new Date(latest.getFullYear(), latest.getMonth() - 11, 1)
            break
        case 'ytd':
            fromDate = yearStart
            break
        default:
            fromDate = thisMonthStart
    }

    const filtered = data.filter((point) => {
        const current = parseDate(point.time)
        if (current < fromDate) return false
        if (toDateExclusive && current >= toDateExclusive) return false
        return true
    })

    return filtered.length > 0 ? filtered : data
}

// --- Components ---

type AddInvestmentModalProps = {
    isOpen: boolean
    onClose: () => void
    onAdd: (payload: {
        ticker: string
        name: string
        invested: number
        currentValue: number
    }) => void
}

function AddInvestmentModal({ isOpen, onClose, onAdd }: AddInvestmentModalProps) {
    const [ticker, setTicker] = useState('')
    const [name, setName] = useState('')
    const [invested, setInvested] = useState('')
    const [currentValue, setCurrentValue] = useState('')
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanTicker = ticker.trim().toUpperCase()
        const cleanName = name.trim()
        const parsedInvested = Number(invested)
        const parsedCurrentValue = Number(currentValue)

        if (!cleanTicker || !cleanName) {
            setError('Ticker and name are required.')
            return
        }

        if (!Number.isFinite(parsedInvested) || parsedInvested < 0) {
            setError('Invested amount must be 0 or greater.')
            return
        }

        if (!Number.isFinite(parsedCurrentValue) || parsedCurrentValue < 0) {
            setError('Current value must be 0 or greater.')
            return
        }

        onAdd({
            ticker: cleanTicker,
            name: cleanName,
            invested: parsedInvested,
            currentValue: parsedCurrentValue,
        })

        setTicker('')
        setName('')
        setInvested('')
        setCurrentValue('')
        setError(null)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white">Add Investment</h3>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close add investment modal">
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
                                placeholder="e.g. AAPL"
                                maxLength={10}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="e.g. Apple Inc."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Current Value (GBP)</label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={currentValue}
                                onChange={(event) => setCurrentValue(event.target.value)}
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
                            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            <Plus className="h-4 w-4" />
                            Add Investment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function OhlcTooltip({ active, payload }: TooltipProps) {
    if (!active || !payload?.length) return null
    const point = payload[0].payload

    return (
        <div className="bg-slate-900 border border-white/15 rounded-lg px-3 py-2 shadow-lg">
            <p className="text-xs text-white/70 mb-2">{point.time}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-white/60">Open</span>
                <span className="text-white text-right">{point.open.toFixed(2)}</span>
                <span className="text-white/60">High</span>
                <span className="text-white text-right">{point.high.toFixed(2)}</span>
                <span className="text-white/60">Low</span>
                <span className="text-white text-right">{point.low.toFixed(2)}</span>
                <span className="text-white/60">Close</span>
                <span className="text-white text-right">{point.close.toFixed(2)}</span>
            </div>
        </div>
    )
}

function InvestmentLineChart({ data }: { data: OhlcPoint[] }) {
    const reducedData = useMemo(() => {
        if (data.length <= 220) return data
        const step = Math.ceil(data.length / 220)
        return data.filter((_, idx) => idx % step === 0 || idx === data.length - 1)
    }, [data])

    const yMin = Math.min(...reducedData.map((d) => d.low))
    const yMax = Math.max(...reducedData.map((d) => d.high))
    const pad = (yMax - yMin) * 0.05

    return (
        <div className="w-full h-[440px] rounded-xl border border-white/10 bg-[#0b1220] p-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reducedData} margin={{ top: 10, right: 16, left: 6, bottom: 18 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                    <XAxis
                        dataKey="time"
                        tickFormatter={formatShortDate}
                        interval={Math.max(0, Math.floor(reducedData.length / 8))}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(148,163,184,0.24)' }}
                    />
                    <YAxis
                        orientation="right"
                        domain={[yMin - pad, yMax + pad]}
                        tickFormatter={(v) => Number(v).toFixed(2)}
                        tick={{ fill: '#cbd5e1', fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(148,163,184,0.24)' }}
                        width={74}
                    />
                    <Tooltip content={<OhlcTooltip />} />
                    <Line type="monotone" dataKey="close" stroke="#818cf8" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="high" stroke="rgba(34,197,94,0.35)" strokeWidth={1} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="low" stroke="rgba(244,63,94,0.35)" strokeWidth={1} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

// --- Main Page Component ---

export default function InvestmentsPage() {
    const [selectedInstrument, setSelectedInstrument] = useState<InstrumentKey>('combined')
    const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('this-month')
    const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('GBP')
    const [isAddInvestmentOpen, setIsAddInvestmentOpen] = useState(false)
    const [positionRows, setPositionRows] = useState(initialPositionRows)

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
        return () => { isMounted = false }
    }, [])

    const allData = mockedOhlcByInstrument[selectedInstrument]
    const chartData = useMemo(() => filterByTimeframe(allData, selectedTimeframe), [allData, selectedTimeframe])
    
    const totalInvested = useMemo(
        () => positionRows.reduce((sum, row) => sum + row.invested, 0),
        [positionRows]
    )
    const totalCurrent = useMemo(
        () => positionRows.reduce((sum, row) => sum + row.value, 0),
        [positionRows]
    )
    const pnl = totalCurrent - totalInvested
    const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0
    const isUp = pnl > 0
    const isDown = pnl < 0

    const instrumentLabel = instrumentOptions.find((option) => option.value === selectedInstrument)?.label ?? selectedInstrument

    const handleAddInvestment = (payload: {
        ticker: string
        name: string
        invested: number
        currentValue: number
    }) => {
        setPositionRows((prev) => [
            ...prev,
            {
                ticker: payload.ticker as Exclude<InstrumentKey, 'combined'>,
                invested: payload.invested,
                value: payload.currentValue,
            },
        ])
    }

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Investments Portfolio</h1>
                    <p className="text-sm text-white/65 mt-1">
                        Mocked OHLC data per ticker/ETF with a guaranteed line chart render.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsAddInvestmentOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Investment
                    </button>
                    <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-2 text-xs">
                        <CandlestickChart className="w-3.5 h-3.5" />
                        Live Data (Mock)
                    </div>
                </div>
            </div>

            <div className="mb-8 grid gap-6 md:grid-cols-3">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
                    <p className="text-sm font-medium text-white/60">Current Value</p>
                    <p className="text-3xl font-bold text-white mt-2">{formatCurrency(totalCurrent, preferredCurrency)}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
                    <p className="text-sm font-medium text-white/60">Total Invested</p>
                    <p className="text-3xl font-bold text-white mt-2">{formatCurrency(totalInvested, preferredCurrency)}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
                    <p className="text-sm font-medium text-white/60">PNL</p>
                    <div className="flex items-center gap-2 mt-2">
                        <p className={`text-3xl font-bold ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-white'}`}>
                            {formatSignedCurrency(pnl, preferredCurrency)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-md ${isUp ? 'text-emerald-300 bg-emerald-500/10' : isDown ? 'text-rose-300 bg-rose-500/10' : 'text-white/70 bg-white/10'}`}>
                            {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 pb-10 rounded-2xl shadow-sm border border-white/10 mb-8 mt-2">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-14">
                    <div className="flex items-center gap-2">
                        <CandlestickChart className="w-4 h-4 text-indigo-300" />
                        <h2 className="text-sm font-semibold text-white">Performance: {instrumentLabel}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-white/60">Instrument</label>
                            <select
                                value={selectedInstrument}
                                onChange={(event) => setSelectedInstrument(event.target.value as InstrumentKey)}
                                className="h-12 bg-slate-900 border border-white/15 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                                aria-label="Select instrument"
                            >
                                {instrumentOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-xs text-white/60">Timeframe</label>
                            <select
                                value={selectedTimeframe}
                                onChange={(event) => setSelectedTimeframe(event.target.value as TimeframeOption)}
                                className="h-12 bg-slate-900 border border-white/15 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                                aria-label="Select timeframe"
                            >
                                {timeframeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <InvestmentLineChart data={chartData} />
            </div>

            <div className="w-full max-w-none bg-white/5 backdrop-blur-sm rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Portfolio Holdings</h3>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[1000px] table-fixed text-sm">
                        <thead className="bg-white/[0.03]">
                            <tr className="text-white/60">
                                <th className="text-center font-medium px-4 py-3">Ticker</th>
                                <th className="text-center font-medium px-4 py-3">Invested</th>
                                <th className="text-center font-medium px-4 py-3">Value</th>
                                <th className="text-center font-medium px-4 py-3">PNL %</th>
                                <th className="text-center font-medium px-4 py-3">PNL</th>
                                <th className="text-center font-medium px-4 py-3">Trend</th>
                                <th className="text-center font-medium px-4 py-3">Edit</th>
                                <th className="text-center font-medium px-4 py-3">History</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positionRows.map((row) => {
                                const rowPnl = row.value - row.invested
                                const rowPnlPct = row.invested > 0 ? (rowPnl / row.invested) * 100 : 0
                                const rowPnlClassName = rowPnl > 0
                                    ? 'text-emerald-400'
                                    : rowPnl < 0
                                        ? 'text-rose-400'
                                        : 'text-amber-400'

                                return (
                                    <tr key={row.ticker} className="border-t border-white/10">
                                        <td className="px-4 py-4 text-center text-white font-semibold">{row.ticker}</td>
                                        <td className="px-4 py-4 text-center text-white/80">
                                            {formatCurrency(row.invested, preferredCurrency)}
                                        </td>
                                        <td className="px-4 py-4 text-center text-white/80">
                                            {formatCurrency(row.value, preferredCurrency)}
                                        </td>
                                        <td className={`px-4 py-4 text-center font-semibold ${rowPnlClassName}`}>
                                            {rowPnlPct >= 0 ? '+' : ''}{rowPnlPct.toFixed(2)}%
                                        </td>
                                        <td className={`px-4 py-4 text-center font-semibold ${rowPnlClassName}`}>
                                            {formatSignedCurrency(rowPnl, preferredCurrency)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                {rowPnl > 0 ? (
                                                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                                ) : rowPnl < 0 ? (
                                                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                                                ) : (
                                                    <Minus className="w-4 h-4 text-white/60" />
                                                )}
                                            </div>
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

            <AddInvestmentModal
                isOpen={isAddInvestmentOpen}
                onClose={() => setIsAddInvestmentOpen(false)}
                onAdd={handleAddInvestment}
            />
        </div>
    )
}
