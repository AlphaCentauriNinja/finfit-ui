'use client'

import React, { forwardRef, useMemo } from 'react'
import type { DashboardDataSnapshot } from '@/lib/dashboard-data'
import { USD_TO_GBP } from '@/lib/crypto-data'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

type AssetAllocationRow = {
    name: string
    value: number
    allocation: number
}

type Props = {
    data: DashboardDataSnapshot
    dynamicAssetsWithAllocation: AssetAllocationRow[]
    totalAssets: number
    dynamicYtdPnl: number
    dynamicYtdPercentage: number
    liveUsdByTicker: Record<string, number>
    spotGoldPricePerGram: number | null
    spotSilverPricePerGram: number | null
}

const ASSET_COLORS: Record<string, string> = {
    Pension: '#0f766e',
    'Real Estate': '#b45309',
    Investments: '#1d4ed8',
    Savings: '#0369a1',
    Crypto: '#9333ea',
    Bullion: '#ca8a04',
}

function trimOrNull(value: string | null | undefined): string | null {
    const trimmed = (value ?? '').trim()
    return trimmed.length > 0 ? trimmed : null
}

function formatPercent(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || !Number.isFinite(value)) return 'N/A'
    const prefix = value >= 0 ? '+' : ''
    return `${prefix}${value.toFixed(decimals)}%`
}

export const PortfolioReportPDF = forwardRef<HTMLDivElement, Props>(({
    data,
    dynamicAssetsWithAllocation,
    totalAssets,
    dynamicYtdPnl,
    dynamicYtdPercentage,
    liveUsdByTicker,
    spotGoldPricePerGram,
    spotSilverPricePerGram,
}, ref) => {
    const sortedAssets = useMemo(
        () => [...dynamicAssetsWithAllocation].filter((asset) => asset.value > 0).sort((a, b) => b.value - a.value),
        [dynamicAssetsWithAllocation]
    )

    const PageWrapper = ({ children, pageNumber, totalPages }: { children: React.ReactNode, pageNumber: number, totalPages: number }) => (
        <div className="pdf-page w-[800px] h-[1131px] p-12 flex flex-col bg-white text-black overflow-hidden shrink-0 relative box-border" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="flex-1 flex flex-col">
                {children}
            </div>
            <div className="absolute bottom-10 left-12 right-12 flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-200 pt-4 uppercase tracking-widest font-semibold">
                <span>Generated on {new Date().toLocaleDateString('en-GB')}</span>
                <span>FinFit Portfolio Report</span>
                <span>Page {pageNumber} of {totalPages}</span>
            </div>
        </div>
    )

    // Calculate total pages dynamically
    let totalPages = 2 // Exec Summary + Asset Allocation
    if (data.crypto.assets.length > 0) totalPages++
    if (data.pension.accounts.length > 0) totalPages++
    if (data.savings.accounts.length > 0) totalPages++
    if (data.bullion.holdings.length > 0) totalPages++
    if (data.investments.holdings.length > 0) totalPages++
    if (data.realEstate.properties.length > 0) totalPages++

    let currentPage = 1

    return (
        <div ref={ref} className="flex flex-col bg-white font-sans text-black">
            
            {/* PAGE 1: EXECUTIVE SUMMARY */}
            <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                <div className="border-b-2 border-gray-200 pb-8 mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black text-black tracking-tighter uppercase">Portfolio Report</h1>
                        <p className="text-gray-500 mt-2 text-xl tracking-wide uppercase font-semibold">Executive Summary</p>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="text-center bg-gray-50 p-12 rounded-xl border border-gray-200">
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Total Net Assets</p>
                        <p className="text-7xl font-black text-black">{formatCurrency(totalAssets)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm text-center">
                            <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Start of Year Value</p>
                            <p className="text-4xl font-bold text-black">{formatCurrency(data.portfolio.startOfYearValue)}</p>
                        </div>
                        <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm text-center">
                            <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">YTD Performance</p>
                            <p className={`text-4xl font-bold text-black`}>
                                {dynamicYtdPnl >= 0 ? '+' : ''}{formatCurrency(dynamicYtdPnl)}
                            </p>
                            <p className="text-lg font-bold text-gray-500 mt-2">
                                ({dynamicYtdPercentage >= 0 ? '+' : ''}{dynamicYtdPercentage.toFixed(2)}%)
                            </p>
                        </div>
                    </div>
                </div>
            </PageWrapper>

            {/* PAGE 2: ASSET ALLOCATION */}
            <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                <div className="border-b-2 border-gray-200 pb-8 mb-12">
                    <h1 className="text-4xl font-black text-black tracking-tighter uppercase">Asset Allocation</h1>
                </div>

                <div className="flex flex-col items-center mb-16">
                    <div className="w-[450px] h-[450px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sortedAssets}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={130}
                                    outerRadius={200}
                                    paddingAngle={2}
                                    dataKey="value"
                                    nameKey="name"
                                    isAnimationActive={false}
                                >
                                    {sortedAssets.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={ASSET_COLORS[entry.name] ?? '#94a3b8'} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-xs uppercase font-bold tracking-widest text-gray-400">Total</p>
                            <p className="text-2xl font-black text-black">{formatCurrency(totalAssets)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 w-full px-8">
                    {sortedAssets.map((asset) => (
                        <div key={asset.name} className="flex items-center gap-6 p-5 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: ASSET_COLORS[asset.name] ?? '#94a3b8' }} />
                            <div className="w-48 font-black text-black text-xl uppercase tracking-wider">{asset.name}</div>
                            <div className="flex-1 text-right text-gray-500 font-bold text-xl">{asset.allocation.toFixed(1)}%</div>
                            <div className="w-48 text-right font-black text-black text-2xl">{formatCurrency(asset.value)}</div>
                        </div>
                    ))}
                </div>
            </PageWrapper>

            {/* PAGE: CRYPTO */}
            {data.crypto.assets.length > 0 && (
                <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                    <div className="border-b-2 border-gray-200 pb-8 mb-8">
                        <h1 className="text-4xl font-black text-black tracking-tighter uppercase">Cryptocurrency</h1>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-black text-black uppercase tracking-widest text-xs">
                                <th className="pb-4 font-black">Asset</th>
                                <th className="pb-4 font-black text-right">Amount</th>
                                <th className="pb-4 font-black text-right">Live Price (USD)</th>
                                <th className="pb-4 font-black text-right">Market Value (GBP)</th>
                                <th className="pb-4 font-black text-right">Invested (GBP)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.crypto.assets.map(c => {
                                const liveUsd = liveUsdByTicker[c.ticker] ?? c.usd
                                const liveGbp = c.amount * liveUsd * USD_TO_GBP
                                return (
                                <tr key={c.id} className="border-b border-gray-200">
                                    <td className="py-5 font-black text-black text-lg">{c.name} <span className="text-gray-400 font-bold ml-2">{c.ticker}</span></td>
                                    <td className="py-5 text-right font-bold text-gray-600 text-lg">{c.amount}</td>
                                    <td className="py-5 text-right font-bold text-gray-600 text-lg">${liveUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="py-5 text-right font-black text-black text-xl">{formatCurrency(liveGbp)}</td>
                                    <td className="py-5 text-right font-bold text-gray-500 text-lg">{formatCurrency(c.investedGbp)}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </PageWrapper>
            )}

            {/* PAGE: PENSION */}
            {data.pension.accounts.length > 0 && (
                <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                    <div className="border-b-2 border-gray-200 pb-8 mb-8">
                        <h1 className="text-4xl font-black text-black tracking-tighter uppercase">Pension Accounts</h1>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-black text-black uppercase tracking-widest text-xs">
                                <th className="pb-4 font-black">Provider</th>
                                <th className="pb-4 font-black text-right">Total Contributions</th>
                                <th className="pb-4 font-black text-right">Current Value</th>
                                <th className="pb-4 font-black text-right">Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.pension.accounts.map(p => (
                                <tr key={p.id} className="border-b border-gray-200">
                                    <td className="py-5 font-black text-black text-lg">{p.name}</td>
                                    <td className="py-5 text-right font-bold text-gray-600 text-lg">{formatCurrency(p.contributionTotal)}</td>
                                    <td className="py-5 text-right font-black text-black text-xl">{formatCurrency(p.value)}</td>
                                    <td className={`py-5 text-right font-bold text-lg text-black`}>
                                        {p.pnl >= 0 ? '+' : ''}{formatCurrency(p.pnl)} ({p.pnlPercentage.toFixed(2)}%)
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </PageWrapper>
            )}

            {/* PAGE: INVESTMENTS */}
            {data.investments.holdings.length > 0 && (
                <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                    <div className="border-b-2 border-gray-200 pb-8 mb-8">
                        <h1 className="text-4xl font-black text-black tracking-tighter uppercase">Investments</h1>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-black text-black uppercase tracking-widest text-xs">
                                <th className="pb-4 font-black">Holding</th>
                                <th className="pb-4 font-black text-right">Invested</th>
                                <th className="pb-4 font-black text-right">Current Value</th>
                                <th className="pb-4 font-black text-right">P&L</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.investments.holdings.map(h => {
                                const pnl = h.currentValue - h.investedAmount
                                return (
                                <tr key={h.id} className="border-b border-gray-200">
                                    <td className="py-5 font-black text-black text-lg">
                                        {h.name || h.ticker || 'Investment'} 
                                        {h.name && h.ticker && <span className="text-gray-400 font-bold ml-2">{h.ticker}</span>}
                                    </td>
                                    <td className="py-5 text-right font-bold text-gray-600 text-lg">{formatCurrency(h.investedAmount)}</td>
                                    <td className="py-5 text-right font-black text-black text-xl">{formatCurrency(h.currentValue)}</td>
                                    <td className="py-5 text-right font-bold text-lg text-black">
                                        {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </PageWrapper>
            )}

            {/* PAGE: SAVINGS */}
            {data.savings.accounts.length > 0 && (
                <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                    <div className="border-b-2 border-gray-200 pb-8 mb-8">
                        <h1 className="text-4xl font-black text-black tracking-tighter uppercase">Savings & Cash</h1>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-black text-black uppercase tracking-widest text-xs">
                                <th className="pb-4 font-black">Account</th>
                                <th className="pb-4 font-black">Pot Name</th>
                                <th className="pb-4 font-black text-right">Target</th>
                                <th className="pb-4 font-black text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.savings.accounts.flatMap(acc => acc.pots.map(pot => (
                                <tr key={pot.id} className="border-b border-gray-200">
                                    <td className="py-5 font-black text-black text-lg">{acc.name}</td>
                                    <td className="py-5 font-bold text-gray-600 text-lg">{pot.name}</td>
                                    <td className="py-5 text-right font-bold text-gray-400 text-lg">{pot.targetAmount ? formatCurrency(pot.targetAmount) : '-'}</td>
                                    <td className="py-5 text-right font-black text-black text-xl">{formatCurrency(pot.balance)}</td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </PageWrapper>
            )}

            {/* PAGE: BULLION */}
            {data.bullion.holdings.length > 0 && (
                <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                    <div className="border-b-2 border-gray-200 pb-8 mb-8">
                        <h1 className="text-4xl font-black text-black tracking-tighter uppercase">Precious Metals (Bullion)</h1>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-black text-black uppercase tracking-widest text-xs">
                                <th className="pb-4 font-black">Metal</th>
                                <th className="pb-4 font-black text-right">Weight/Item</th>
                                <th className="pb-4 font-black text-right">Quantity</th>
                                <th className="pb-4 font-black text-right">Live Value (GBP)</th>
                                <th className="pb-4 font-black text-right">Invested (GBP)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.bullion.holdings.map(h => {
                                const spotPrice = h.metal === 'GOLD' ? spotGoldPricePerGram : spotSilverPricePerGram
                                const intrinsic = spotPrice ? (spotPrice * h.weightPerItemGrams * h.amount) : 0
                                const premiumMultiplier = 1 + ((h.marketPremiumPct || 0) / 100)
                                const marketValue = spotPrice ? (intrinsic * premiumMultiplier) : h.investedGbp
                                return (
                                <tr key={h.id} className="border-b border-gray-200">
                                    <td className="py-5 font-black text-black uppercase tracking-widest text-lg">{h.metal}</td>
                                    <td className="py-5 text-right font-bold text-gray-600 text-lg">{h.weightPerItemGrams}g</td>
                                    <td className="py-5 text-right font-bold text-gray-600 text-lg">{h.amount}</td>
                                    <td className="py-5 text-right font-black text-black text-xl">{formatCurrency(marketValue)}</td>
                                    <td className="py-5 text-right font-bold text-gray-500 text-lg">{formatCurrency(h.investedGbp)}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </PageWrapper>
            )}

            {/* PAGE: REAL ESTATE */}
            {data.realEstate.properties.length > 0 && (
                <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                    <div className="border-b-2 border-gray-200 pb-8 mb-8">
                        <h1 className="text-4xl font-black text-black tracking-tighter uppercase">Real Estate</h1>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-black text-black uppercase tracking-widest text-xs">
                                <th className="pb-4 font-black">Property</th>
                                <th className="pb-4 font-black">Address</th>
                                <th className="pb-4 font-black text-right">Property Value</th>
                                <th className="pb-4 font-black text-right">Mortgage</th>
                                <th className="pb-4 font-black text-right">Equity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.realEstate.properties.map(p => {
                                return (
                                <tr key={p.id} className="border-b border-gray-200">
                                    <td className="py-5 font-black text-black text-lg">{p.name}</td>
                                    <td className="py-5 font-bold text-gray-600 text-sm max-w-[200px] truncate">{p.address || '-'}</td>
                                    <td className="py-5 text-right font-bold text-gray-600 text-lg">{formatCurrency(p.value)}</td>
                                    <td className="py-5 text-right font-bold text-gray-500 text-lg">{formatCurrency(p.mortgage)}</td>
                                    <td className="py-5 text-right font-black text-black text-xl">{formatCurrency(p.equity)}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </PageWrapper>
            )}

        </div>
    )
})

PortfolioReportPDF.displayName = 'PortfolioReportPDF'
