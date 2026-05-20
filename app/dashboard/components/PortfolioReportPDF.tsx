'use client'

import React, { forwardRef, useMemo } from 'react'
import type { DashboardDataSnapshot } from '@/lib/dashboard-data'
import { USD_TO_GBP } from '@/lib/crypto-data'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Building, TrendingUp, Coins, Bitcoin, PiggyBank, Briefcase } from 'lucide-react'

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

const ASSET_THEMES: Record<string, { color: string, bg: string, icon: any }> = {
    'Real Estate': { color: '#185FA5', bg: '#E6F1FB', icon: Building },
    Investments: { color: '#3B6D11', bg: '#EAF3DE', icon: TrendingUp },
    Bullion: { color: '#854F0B', bg: '#FAEEDA', icon: Coins },
    Crypto: { color: '#534AB7', bg: '#EEEDFE', icon: Bitcoin },
    Savings: { color: '#993C1D', bg: '#FAECE7', icon: PiggyBank },
    Pension: { color: '#0F6E56', bg: '#E1F5EE', icon: Briefcase },
}

const CHART_COLORS = ['#378ADD', '#1D9E75', '#EF9F27', '#7F77DD', '#D85A30', '#4A5568']

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
        () => [...dynamicAssetsWithAllocation].filter((a) => a.value > 0).sort((a, b) => b.value - a.value),
        [dynamicAssetsWithAllocation]
    )

    // Calculate Liquid vs Illiquid
    const liquidAssets = sortedAssets.filter(a => ['Crypto', 'Savings', 'Investments'].includes(a.name)).reduce((sum, a) => sum + a.value, 0)
    const illiquidAssets = sortedAssets.filter(a => ['Real Estate', 'Pension', 'Bullion'].includes(a.name)).reduce((sum, a) => sum + a.value, 0)
    const liquidPct = totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0
    const illiquidPct = totalAssets > 0 ? (illiquidAssets / totalAssets) * 100 : 0

    // Mock Historical Data for the chart
    const historicalData = [
        { month: 'Jan', value: totalAssets * 0.8 },
        { month: 'Feb', value: totalAssets * 0.85 },
        { month: 'Mar', value: totalAssets * 0.88 },
        { month: 'Apr', value: totalAssets * 0.95 },
        { month: 'May', value: totalAssets },
    ]

    const cssTemplate = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .pdf-wrapper { font-family: 'Inter', system-ui, sans-serif; background: #ffffff; color: #111827; padding: 40px; width: 800px; height: 1131px; overflow: hidden; position: relative; }
      .report { max-width: 100%; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 0.5px solid #E5E7EB; }
      .header-left h1 { font-size: 20px; font-weight: 500; color: #111827; }
      .header-left p { font-size: 13px; color: #4B5563; margin-top: 4px; }
      .header-right { text-align: right; }
      .header-right .period { font-size: 12px; color: #9CA3AF; }
      .header-right .total { font-size: 22px; font-weight: 500; color: #111827; margin-top: 2px; }
      .header-right .change { font-size: 13px; color: #1D9E75; }
      .header-right .change.neg { color: #D85A30; }
      .section-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; margin-bottom: 10px; }
      .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 2rem; }
      .metric { background: #F3F4F6; border-radius: 6px; padding: 12px 14px; }
      .metric-label { font-size: 11px; color: #4B5563; margin-bottom: 6px; }
      .metric-value { font-size: 18px; font-weight: 500; color: #111827; }
      .metric-sub { font-size: 11px; color: #9CA3AF; margin-top: 3px; }
      .metric-sub.pos { color: #1D9E75; }
      .metric-sub.neg { color: #D85A30; }
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 2rem; }
      .card { background: #ffffff; border: 0.5px solid #E5E7EB; border-radius: 12px; padding: 1rem 1.25rem; }
      .donut-wrap { position: relative; width: 140px; height: 140px; margin: 1rem auto; }
      .donut-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; }
      .donut-label span { display: block; font-size: 11px; color: #4B5563; }
      .donut-label strong { font-size: 15px; font-weight: 500; color: #111827; }
      .legend { display: flex; flex-direction: column; gap: 7px; margin-top: 10px; }
      .legend-row { display: flex; align-items: center; justify-content: space-between; font-size: 12px; }
      .legend-left { display: flex; align-items: center; gap: 7px; color: #4B5563; }
      .dot { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
      .legend-right { font-weight: 500; color: #111827; font-size: 12px; }
      .asset-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .asset-table th { font-size: 11px; color: #9CA3AF; font-weight: 400; text-align: left; padding: 0 0 8px 0; border-bottom: 0.5px solid #E5E7EB; }
      .asset-table th:not(:first-child) { text-align: right; }
      .asset-table td { padding: 9px 0; border-bottom: 0.5px solid #E5E7EB; color: #111827; vertical-align: middle; }
      .asset-table td:not(:first-child) { text-align: right; }
      .asset-table tr:last-child td { border-bottom: none; }
      .asset-name { display: flex; align-items: center; gap: 8px; }
      .asset-icon { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .badge { display: inline-block; font-size: 10px; padding: 2px 7px; border-radius: 4px; }
      .badge-pos { background: #E1F5EE; color: #0F6E56; }
      .badge-neg { background: #FAECE7; color: #993C1D; }
      .badge-neu { background: #F3F4F6; color: #4B5563; }
      .perf-bar-wrap { margin-bottom: 2rem; }
      .perf-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 12px; }
      .perf-name { width: 100px; color: #4B5563; flex-shrink: 0; }
      .perf-track { flex: 1; height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
      .perf-fill { height: 100%; border-radius: 3px; }
      .perf-pct { width: 50px; text-align: right; font-weight: 500; color: #111827; }
      .risk-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 2rem; }
      .risk-item { background: #F3F4F6; border-radius: 6px; padding: 10px 14px; }
      .risk-label { font-size: 11px; color: #9CA3AF; margin-bottom: 4px; }
      .risk-val { font-size: 15px; font-weight: 500; color: #111827; }
      .risk-sub { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
      .timeline-wrap { position: relative; width: 100%; height: 140px; margin-bottom: 1.5rem; }
      .footer { padding-top: 1rem; border-top: 0.5px solid #E5E7EB; display: flex; justify-content: space-between; font-size: 11px; color: #9CA3AF; position: absolute; bottom: 40px; left: 40px; right: 40px;}
      .note-box { background: #F3F4F6; border-radius: 6px; padding: 10px 14px; margin-bottom: 2rem; font-size: 12px; color: #4B5563; line-height: 1.6; }
    `

    const getStatusBadge = (alloc: number) => {
        if (alloc > 30) return <span className="badge badge-pos">Hold</span>
        if (alloc < 10) return <span className="badge badge-neu">Review</span>
        return <span className="badge badge-pos">Accumulate</span>
    }

    return (
        <div ref={ref} className="pdf-wrapper">
            <style dangerouslySetInnerHTML={{ __html: cssTemplate }} />
            <div className="report">
                
                <div className="header">
                    <div className="header-left">
                        <h1>Portfolio overview</h1>
                        <p>Multi-asset wealth report &nbsp;·&nbsp; {new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="header-right">
                        <div className="period">Total portfolio value</div>
                        <div className="total">{formatCurrency(totalAssets)}</div>
                        <div className={`change ${dynamicYtdPercentage < 0 ? 'neg' : ''}`}>
                            {dynamicYtdPercentage >= 0 ? '↑ +' : '↓ '}{dynamicYtdPercentage.toFixed(2)}% YTD
                        </div>
                    </div>
                </div>

                <div className="section-label">Key metrics</div>
                <div className="metrics-grid">
                    <div className="metric">
                        <div className="metric-label">Liquid assets</div>
                        <div className="metric-value">{formatCurrency(liquidAssets)}</div>
                        <div className="metric-sub">{liquidPct.toFixed(1)}% of portfolio</div>
                    </div>
                    <div className="metric">
                        <div className="metric-label">Illiquid assets</div>
                        <div className="metric-value">{formatCurrency(illiquidAssets)}</div>
                        <div className="metric-sub">{illiquidPct.toFixed(1)}% of portfolio</div>
                    </div>
                    <div className="metric">
                        <div className="metric-label">Unrealised gain</div>
                        <div className="metric-value">{formatCurrency(dynamicYtdPnl)}</div>
                        <div className={`metric-sub ${dynamicYtdPnl >= 0 ? 'pos' : 'neg'}`}>
                            {dynamicYtdPnl >= 0 ? '↑ +' : '↓ '}{dynamicYtdPercentage.toFixed(2)}% YTD
                        </div>
                    </div>
                    <div className="metric">
                        <div className="metric-label">Income yield</div>
                        <div className="metric-value">4.2%</div>
                        <div className="metric-sub">Blended annualised</div>
                    </div>
                </div>

                <div className="two-col">
                    <div className="card">
                        <div className="section-label">Allocation</div>
                        <div className="donut-wrap">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sortedAssets}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                        isAnimationActive={false}
                                    >
                                        {sortedAssets.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-label">
                                <span>{sortedAssets.length} assets</span>
                                <strong>{formatCurrency(totalAssets).split('.')[0]}</strong>
                            </div>
                        </div>
                        <div className="legend">
                            {sortedAssets.map((asset, index) => (
                                <div className="legend-row" key={asset.name}>
                                    <span className="legend-left">
                                        <span className="dot" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                                        {asset.name}
                                    </span>
                                    <span className="legend-right">{asset.allocation.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="section-label">Relative Sizes</div>
                        <div style={{ marginTop: '1rem' }}>
                            {sortedAssets.map((asset, index) => (
                                <div className="perf-row" key={asset.name}>
                                    <span className="perf-name">{asset.name}</span>
                                    <div className="perf-track">
                                        <div className="perf-fill" style={{ width: `${asset.allocation}%`, background: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                                    </div>
                                    <span className="perf-pct">{asset.allocation.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '1.5rem', borderTop: '0.5px solid #E5E7EB', paddingTop: '1rem' }}>
                            <div className="section-label">Portfolio vs benchmark</div>
                            <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '6px', lineHeight: '1.6' }}>
                                Portfolio YTD <strong style={{ color: '#111827' }}>+{dynamicYtdPercentage.toFixed(1)}%</strong> &nbsp;·&nbsp; MSCI World <strong style={{ color: '#4B5563' }}>+8.1%</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="section-label" style={{ marginBottom: '12px' }}>Holdings breakdown</div>
                    <table className="asset-table">
                        <thead>
                            <tr>
                                <th style={{ width: '38%' }}>Asset</th>
                                <th>Value</th>
                                <th>Alloc.</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAssets.map((asset) => {
                                const theme = ASSET_THEMES[asset.name] || ASSET_THEMES['Investments']
                                const Icon = theme.icon
                                return (
                                    <tr key={asset.name}>
                                        <td>
                                            <div className="asset-name">
                                                <div className="asset-icon" style={{ background: theme.bg }}>
                                                    <Icon style={{ color: theme.color }} size={14} />
                                                </div>
                                                {asset.name}
                                            </div>
                                        </td>
                                        <td>{formatCurrency(asset.value)}</td>
                                        <td>{asset.allocation.toFixed(1)}%</td>
                                        <td>{getStatusBadge(asset.allocation)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="section-label">Risk & liquidity snapshot</div>
                <div className="risk-row">
                    <div className="risk-item">
                        <div className="risk-label">Volatility (30d)</div>
                        <div className="risk-val">Moderate</div>
                        <div className="risk-sub">Based on allocation</div>
                    </div>
                    <div className="risk-item">
                        <div className="risk-label">Liquidity ratio</div>
                        <div className="risk-val">{liquidPct.toFixed(1)}%</div>
                        <div className="risk-sub">Liquid vs Illiquid</div>
                    </div>
                    <div className="risk-item">
                        <div className="risk-label">Concentration</div>
                        <div className="risk-val">{sortedAssets[0]?.allocation.toFixed(1)}%</div>
                        <div className="risk-sub">Top asset exposure</div>
                    </div>
                </div>

                <div className="section-label">Portfolio value over time</div>
                <div className="timeline-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                            <YAxis 
                                domain={['dataMin', 'dataMax']} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                tickFormatter={(val) => `£${(val / 1000).toFixed(0)}k`}
                            />
                            <Line type="monotone" dataKey="value" stroke="#378ADD" strokeWidth={2} dot={{ r: 4, fill: '#378ADD' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="section-label">Adviser notes</div>
                <div className="note-box">
                    Asset valuations are performing strongly across key sectors. Consider reviewing digital asset concentration and rebalancing according to personal risk tolerance thresholds. The current portfolio mix provides solid diversification against inflationary pressures.
                </div>

                <div className="footer">
                    <span>Prepared by: Wealth Management Desk</span>
                    <span>As at {new Date().toLocaleDateString('en-GB')} &nbsp;·&nbsp; Figures in GBP</span>
                    <span>Confidential</span>
                </div>
            </div>
        </div>
    )
})

PortfolioReportPDF.displayName = 'PortfolioReportPDF'
