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

const BRAND_CORAL = '#ef8a8f'
const BRAND_TEAL = '#4a8b94'
const BRAND_LIGHT_TEAL = '#8ab6bb'
const BRAND_GRAY_TEAL = '#b0c4c7'
const BRAND_DARK_BLUE = '#2b4d59'
const BRAND_MUSTARD = '#e3b134'

const ASSET_COLORS: Record<string, string> = {
    Pension: BRAND_TEAL,
    'Real Estate': BRAND_DARK_BLUE,
    Investments: BRAND_CORAL,
    Savings: BRAND_LIGHT_TEAL,
    Crypto: BRAND_MUSTARD,
    Bullion: BRAND_GRAY_TEAL,
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
        <div className="pdf-page w-[800px] h-[1131px] p-10 flex flex-col overflow-hidden shrink-0 relative box-border" style={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ background: `linear-gradient(90deg, ${BRAND_TEAL} 0%, ${BRAND_CORAL} 100%)` }} />
            
            <div className="flex-1 flex flex-col mt-4">
                {children}
            </div>
            <div className="absolute bottom-8 left-10 right-10 flex justify-between items-center text-[10px] text-black border-t pt-3 uppercase tracking-wider font-semibold" style={{ borderColor: '#e5e7eb' }}>
                <span>FinFit Portfolio Report</span>
                <span>Page {pageNumber} of {totalPages}</span>
                <span>Generated: {new Date().toLocaleDateString('en-GB')}</span>
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

    const Header = ({ title, subtitle }: { title: string, subtitle: string }) => (
        <div className="mb-10" style={{ backgroundColor: '#ffffff' }}>
            <h1 className="text-3xl font-normal text-black tracking-tight">{title}</h1>
            <p className="text-sm text-black font-semibold mt-1 opacity-70">{subtitle}</p>
        </div>
    )

    return (
        <div ref={ref} className="flex flex-col font-sans" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            
            {/* PAGE 1: EXECUTIVE SUMMARY */}
            <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                <Header 
                    title="Dashboard showcasing portfolio fund investment analysis" 
                    subtitle="This report represents metric dashboard for investment analysis for portfolio management. It covers portfolio value, cost ratio, performance, allocation etc." 
                />

                <h2 className="text-center font-bold text-black mb-4 tracking-wide">Portfolio activity overview</h2>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* KPI Card */}
                    <div className="border flex flex-col items-center justify-center py-10 relative" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                        <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: BRAND_CORAL }} />
                        <p className="text-sm font-bold text-black mb-4 uppercase tracking-widest opacity-80">Portfolio Value</p>
                        <p className="text-5xl font-black text-black">{formatCurrency(totalAssets)}</p>
                    </div>
                    
                    <div className="border flex flex-col items-center justify-center py-10 relative" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                        <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: BRAND_CORAL }} />
                        <p className="text-sm font-bold text-black mb-4 uppercase tracking-widest opacity-80">Start of Year Value</p>
                        <p className="text-5xl font-black text-black">{formatCurrency(data.portfolio.startOfYearValue)}</p>
                    </div>

                    <div className="border flex flex-col items-center justify-center py-10 relative" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                        <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: BRAND_CORAL }} />
                        <p className="text-sm font-bold text-black mb-4 uppercase tracking-widest opacity-80">Unrealized Gains (YTD)</p>
                        <p className="text-4xl font-black text-black">
                            {dynamicYtdPnl >= 0 ? '+' : ''}{formatCurrency(dynamicYtdPnl)}
                        </p>
                    </div>

                    <div className="border flex flex-col items-center justify-center py-10 relative" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                        <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: BRAND_CORAL }} />
                        <p className="text-sm font-bold text-black mb-4 uppercase tracking-widest opacity-80">YTD Performance Ratio</p>
                        <p className="text-4xl font-black text-black">
                            {dynamicYtdPercentage >= 0 ? '+' : ''}{dynamicYtdPercentage.toFixed(2)}%
                        </p>
                    </div>
                </div>
            </PageWrapper>

            {/* PAGE 2: ASSET ALLOCATION */}
            <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                <Header 
                    title="Asset class allocation and distribution" 
                    subtitle="Visual representation of wealth distribution across major tracked asset categories." 
                />

                <div className="flex flex-col items-center mt-8 mb-12">
                    <h2 className="font-bold text-black mb-8 tracking-wide text-lg">Fund allocation – sectors</h2>
                    <div className="w-[400px] h-[400px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sortedAssets}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={110}
                                    outerRadius={180}
                                    paddingAngle={3}
                                    dataKey="value"
                                    nameKey="name"
                                    isAnimationActive={false}
                                    stroke="none"
                                >
                                    {sortedAssets.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={ASSET_COLORS[entry.name] ?? BRAND_GRAY_TEAL} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-xs uppercase font-bold tracking-widest text-black opacity-60">Total</p>
                            <p className="text-2xl font-black text-black">{formatCurrency(totalAssets)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                    {sortedAssets.map((asset) => (
                        <div key={asset.name} className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4" style={{ backgroundColor: ASSET_COLORS[asset.name] ?? BRAND_GRAY_TEAL }} />
                                <span className="font-bold text-black">{asset.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-black">{asset.allocation.toFixed(2)}%</p>
                                <p className="text-xs text-black font-semibold opacity-70">{formatCurrency(asset.value)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </PageWrapper>

            {/* PAGE: CRYPTO */}
            {data.crypto.assets.length > 0 && (
                <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                    <Header title="Cryptocurrency holding overview" subtitle="Detailed breakdown of digital asset quantities, live pricing, and total valuation." />
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Asset</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Amount</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Live Price (USD)</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Market Value (GBP)</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Invested (GBP)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.crypto.assets.map((c, i) => {
                                const liveUsd = liveUsdByTicker[c.ticker] ?? c.usd
                                const liveGbp = c.amount * liveUsd * USD_TO_GBP
                                return (
                                <tr key={c.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td className="py-3 px-4 border text-sm text-left text-black" style={{ borderColor: '#e5e7eb' }}><span className="font-bold">{c.name}</span> <span className="opacity-70 ml-1">({c.ticker})</span></td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>{c.amount}</td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>${liveUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="py-3 px-4 border text-sm font-bold text-black" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(liveGbp)}</td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(c.investedGbp)}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </PageWrapper>
            )}

            {/* PAGE: PENSION */}
            {data.pension.accounts.length > 0 && (
                <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                    <Header title="Pension portfolio overview" subtitle="Summary of retirement accounts, total contributions, and current valuations." />
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Provider</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Total Contributions</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Current Value</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.pension.accounts.map((p, i) => (
                                <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td className="py-3 px-4 border text-sm font-bold text-black text-left" style={{ borderColor: '#e5e7eb' }}>{p.name}</td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(p.contributionTotal)}</td>
                                    <td className="py-3 px-4 border text-sm font-bold text-black" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(p.value)}</td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>
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
                    <Header title="Investment fund overview" subtitle="Inventory of stocks, shares, and external investment funds." />
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Holding</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Invested</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Current Value</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Yield / P&L</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.investments.holdings.map((h, i) => {
                                const pnl = h.currentValue - h.investedAmount
                                return (
                                <tr key={h.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td className="py-3 px-4 border text-sm text-left text-black" style={{ borderColor: '#e5e7eb' }}>
                                        <span className="font-bold">{h.name || h.ticker || 'Investment'}</span>
                                        {h.name && h.ticker && <span className="opacity-70 ml-1">({h.ticker})</span>}
                                    </td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(h.investedAmount)}</td>
                                    <td className="py-3 px-4 border text-sm font-bold text-black" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(h.currentValue)}</td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>
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
                    <Header title="Cash & liquidity overview" subtitle="Breakdown of savings accounts and individual cash pots." />
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Account</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Pot Name</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Target</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.savings.accounts.flatMap(acc => acc.pots.map((pot, i) => (
                                <tr key={pot.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td className="py-3 px-4 border text-sm font-bold text-black text-left" style={{ borderColor: '#e5e7eb' }}>{acc.name}</td>
                                    <td className="py-3 px-4 border text-sm text-black text-left font-medium" style={{ borderColor: '#e5e7eb' }}>{pot.name}</td>
                                    <td className="py-3 px-4 border text-sm text-black opacity-70 font-medium" style={{ borderColor: '#e5e7eb' }}>{pot.targetAmount ? formatCurrency(pot.targetAmount) : '-'}</td>
                                    <td className="py-3 px-4 border text-sm font-bold text-black" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(pot.balance)}</td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </PageWrapper>
            )}

            {/* PAGE: BULLION */}
            {data.bullion.holdings.length > 0 && (
                <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                    <Header title="Precious metals overview" subtitle="Inventory of physical gold and silver, factoring live spot prices." />
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Metal</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Weight/Item</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Quantity</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Live Value (GBP)</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Invested (GBP)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.bullion.holdings.map((h, i) => {
                                const spotPrice = h.metal === 'GOLD' ? spotGoldPricePerGram : spotSilverPricePerGram
                                const intrinsic = spotPrice ? (spotPrice * h.weightPerItemGrams * h.amount) : 0
                                const premiumMultiplier = 1 + ((h.marketPremiumPct || 0) / 100)
                                const marketValue = spotPrice ? (intrinsic * premiumMultiplier) : h.investedGbp
                                return (
                                <tr key={h.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td className="py-3 px-4 border text-sm font-bold text-black text-left" style={{ borderColor: '#e5e7eb' }}>{h.metal}</td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>{h.weightPerItemGrams}g</td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>{h.amount}</td>
                                    <td className="py-3 px-4 border text-sm font-bold text-black" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(marketValue)}</td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(h.investedGbp)}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </PageWrapper>
            )}

            {/* PAGE: REAL ESTATE */}
            {data.realEstate.properties.length > 0 && (
                <PageWrapper pageNumber={currentPage++} totalPages={totalPages}>
                    <Header title="Real estate portfolio overview" subtitle="Breakdown of property valuations, outstanding mortgages, and total equity." />
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Property</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Address</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Property Value</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Mortgage</th>
                                <th className="py-3 px-4 font-bold text-white text-sm" style={{ backgroundColor: BRAND_CORAL }}>Equity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.realEstate.properties.map((p, i) => {
                                return (
                                <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td className="py-3 px-4 border text-sm font-bold text-black text-left" style={{ borderColor: '#e5e7eb' }}>{p.name}</td>
                                    <td className="py-3 px-4 border text-sm text-black text-left max-w-[150px] truncate font-medium" style={{ borderColor: '#e5e7eb' }}>{p.address || '-'}</td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(p.value)}</td>
                                    <td className="py-3 px-4 border text-sm text-black font-medium" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(p.mortgage)}</td>
                                    <td className="py-3 px-4 border text-sm font-bold text-black" style={{ borderColor: '#e5e7eb' }}>{formatCurrency(p.equity)}</td>
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
