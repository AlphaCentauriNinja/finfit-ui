'use client'

import { useMemo, useState } from 'react'
import { CandlestickChart, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts'

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

const positionRows: Array<{ ticker: Exclude<InstrumentKey, 'combined'>; invested: number; value: number }> = [
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

// Mocked OHLC data for all stocks, ETFs, and the combined portfolio. >= 1 year per series.
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

export default function InvestmentsPage() {
    const [selectedInstrument, setSelectedInstrument] = useState<InstrumentKey>('combined')
    const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('this-month')

    const allData = mockedOhlcByInstrument[selectedInstrument]
    const chartData = useMemo(() => filterByTimeframe(allData, selectedTimeframe), [allData, selectedTimeframe])

    const instrumentLabel = instrumentOptions.find((option) => option.value === selectedInstrument)?.label ?? selectedInstrument

    return (
        <div className="w-full space-y-16">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Investments</h1>
                    <p className="text-sm text-white/65 mt-1">
                        Mocked OHLC data per ticker/ETF with a guaranteed line chart render.
                    </p>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 pb-10 rounded-2xl shadow-sm border border-white/10 mt-2">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-14">
                    <div className="flex items-center gap-2">
                        <CandlestickChart className="w-4 h-4 text-indigo-300" />
                        <h2 className="text-sm font-semibold text-white">{instrumentLabel}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-white/60">Instrument</label>
                            <select
                                value={selectedInstrument}
                                onChange={(event) => setSelectedInstrument(event.target.value as InstrumentKey)}
                                className="bg-slate-900 border border-white/15 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
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
                                className="bg-slate-900 border border-white/15 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
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

            <div className="pt-4 w-full self-stretch">
                <div className="w-full max-w-none bg-white/5 backdrop-blur-sm rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10">
                        <h3 className="text-sm font-semibold text-white">Portfolio Holdings</h3>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-full table-fixed text-sm">
                            <thead className="bg-white/[0.03]">
                                <tr className="text-white/60">
                                    <th className="text-center font-medium px-6 py-3">Ticker</th>
                                    <th className="text-center font-medium px-6 py-3">Invested</th>
                                    <th className="text-center font-medium px-6 py-3">Value</th>
                                    <th className="text-center font-medium px-6 py-3">PNL</th>
                                    <th className="text-center font-medium px-6 py-3">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {positionRows.map((row) => {
                                    const pnl = row.value - row.invested
                                    const pnlPct = (pnl / row.invested) * 100
                                    const isUp = pnl > 0
                                    const isDown = pnl < 0

                                    return (
                                        <tr key={row.ticker} className="border-t border-white/10">
                                            <td className="px-6 py-4 text-center text-white font-semibold">{row.ticker}</td>
                                            <td className="px-6 py-4 text-center text-white/80">
                                                £{row.invested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-center text-white/80">
                                                £{row.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </td>
                                            <td className={`px-6 py-4 text-center font-semibold ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-white/70'}`}>
                                                {pnl >= 0 ? '+' : ''}£{pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({pnlPct.toFixed(2)}%)
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center">
                                                    {isUp ? (
                                                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                                    ) : isDown ? (
                                                        <ArrowDownRight className="w-4 h-4 text-rose-400" />
                                                    ) : (
                                                        <Minus className="w-4 h-4 text-white/60" />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
