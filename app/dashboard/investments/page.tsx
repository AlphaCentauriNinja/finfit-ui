'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { CandlestickChart, Layers } from 'lucide-react'

type CandleDataPoint = {
    time: string
    open: number
    high: number
    low: number
    close: number
}

const holdings = ['AAPL', 'AMZN', 'NVDA', 'MSFT']
const etfs = ['VUSA', 'VWRL', 'QQQ', 'SMH']

// Synthetic combined portfolio OHLC series for the holdings universe.
const combinedPortfolioCandles: CandleDataPoint[] = [
    { time: '2025-01-02', open: 100.4, high: 102.1, low: 99.8, close: 101.5 },
    { time: '2025-01-06', open: 101.5, high: 103.3, low: 100.9, close: 102.8 },
    { time: '2025-01-10', open: 102.8, high: 104.2, low: 101.7, close: 103.1 },
    { time: '2025-01-14', open: 103.1, high: 105.4, low: 102.5, close: 104.9 },
    { time: '2025-01-18', open: 104.9, high: 106.0, low: 103.6, close: 104.1 },
    { time: '2025-01-22', open: 104.1, high: 106.2, low: 103.8, close: 105.6 },
    { time: '2025-01-27', open: 105.6, high: 107.8, low: 105.1, close: 107.2 },
    { time: '2025-01-31', open: 107.2, high: 108.0, low: 106.0, close: 106.5 },
    { time: '2025-02-04', open: 106.5, high: 108.7, low: 105.9, close: 108.3 },
    { time: '2025-02-08', open: 108.3, high: 109.9, low: 107.4, close: 109.2 },
    { time: '2025-02-12', open: 109.2, high: 110.4, low: 108.0, close: 108.6 },
    { time: '2025-02-16', open: 108.6, high: 111.2, low: 108.2, close: 110.7 },
    { time: '2025-02-20', open: 110.7, high: 112.9, low: 110.1, close: 112.4 },
    { time: '2025-02-24', open: 112.4, high: 113.8, low: 111.0, close: 112.1 },
    { time: '2025-02-28', open: 112.1, high: 114.5, low: 111.8, close: 113.9 },
]

declare global {
    interface Window {
        LightweightCharts?: {
            createChart: (container: HTMLElement, options: Record<string, unknown>) => {
                addCandlestickSeries: (options: Record<string, unknown>) => {
                    setData: (data: CandleDataPoint[]) => void
                }
                timeScale: () => { fitContent: () => void }
                applyOptions: (options: Record<string, unknown>) => void
                remove: () => void
            }
        }
    }
}

function TradingViewCombinedChart() {
    const chartContainerRef = useRef<HTMLDivElement | null>(null)
    const [isLibraryLoaded, setIsLibraryLoaded] = useState(false)

    useEffect(() => {
        const container = chartContainerRef.current
        const lightweightCharts = window.LightweightCharts

        if (!isLibraryLoaded || !container || !lightweightCharts) return

        const chart = lightweightCharts.createChart(container, {
            width: container.clientWidth,
            height: 420,
            layout: {
                background: { color: 'transparent' },
                textColor: '#cbd5e1',
            },
            grid: {
                vertLines: { color: 'rgba(255,255,255,0.06)' },
                horzLines: { color: 'rgba(255,255,255,0.06)' },
            },
            rightPriceScale: {
                borderColor: 'rgba(255,255,255,0.15)',
            },
            timeScale: {
                borderColor: 'rgba(255,255,255,0.15)',
            },
        })

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#f43f5e',
            borderUpColor: '#10b981',
            borderDownColor: '#f43f5e',
            wickUpColor: '#10b981',
            wickDownColor: '#f43f5e',
        })

        candleSeries.setData(combinedPortfolioCandles)
        chart.timeScale().fitContent()

        const resizeObserver = new ResizeObserver(() => {
            chart.applyOptions({ width: container.clientWidth })
        })
        resizeObserver.observe(container)

        return () => {
            resizeObserver.disconnect()
            chart.remove()
        }
    }, [isLibraryLoaded])

    return (
        <>
            <Script
                src="https://unpkg.com/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.js"
                strategy="afterInteractive"
                onLoad={() => setIsLibraryLoaded(true)}
            />
            <div ref={chartContainerRef} className="w-full h-[420px]" />
        </>
    )
}

export default function InvestmentsPage() {
    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Investments</h1>
                    <p className="text-sm text-white/65 mt-1">
                        Combined OHLC view for your stock and ETF holdings.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white/5 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10">
                        <p className="text-xs text-white/50">Holdings</p>
                        <p className="text-sm font-semibold text-white mt-1">{holdings.length + etfs.length} instruments</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10">
                        <p className="text-xs text-white/50">Chart Type</p>
                        <p className="text-sm font-semibold text-white mt-1">TradingView OHLC Candles</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <CandlestickChart className="w-4 h-4 text-indigo-300" />
                        <h2 className="text-sm font-semibold text-white">Combined Portfolio Candles</h2>
                    </div>
                    <span className="text-xs text-white/45">AAPL, AMZN, NVDA, MSFT, VUSA, VWRL, QQQ, SMH</span>
                </div>
                <TradingViewCombinedChart />
            </div>

            <div className="grid xl:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-4 h-4 text-cyan-300" />
                        <h3 className="text-sm font-semibold text-white">Stocks</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {holdings.map((ticker) => (
                            <span key={ticker} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-200 border border-indigo-400/35">
                                {ticker}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-4 h-4 text-emerald-300" />
                        <h3 className="text-sm font-semibold text-white">ETFs</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {etfs.map((ticker) => (
                            <span key={ticker} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-400/35">
                                {ticker}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
