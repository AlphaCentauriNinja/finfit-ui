'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import StatCard from '@/app/dashboard/components/StatCard'
import AssetCard from '@/app/dashboard/components/AssetCard'
import {
    Wallet,
    Briefcase,
    Home,
    TrendingUp,
    PiggyBank,
    Coins,
    Gem
} from 'lucide-react'
import {
    PortfolioGraph,
    FinFitScoreWidget,
    SpendingBreakdown,
    DebtWidget,
    GoalTracker
} from '@/app/dashboard/components/DashboardWidgets'
import { useDashboardData } from '@/app/dashboard/components/providers/DashboardDataProvider'
import { initialCryptoRows, USD_TO_GBP, binanceCombinedStreamUrl, CryptoRow } from '@/lib/crypto-data'

const getIconForAsset = (name: string) => {
    switch (name) {
        case 'Pension': return Briefcase
        case 'Real Estate': return Home
        case 'Investments': return TrendingUp
        case 'Savings': return PiggyBank
        case 'Crypto': return Coins
        case 'Bullion': return Gem
        default: return Wallet
    }
}

const getRouteForAsset = (name: string) => {
    switch (name) {
        case 'Pension': return '/dashboard/assets/pension'
        case 'Savings': return '/dashboard/assets/savings'
        case 'Investments': return '/dashboard/assets/investments'
        case 'Crypto': return '/dashboard/assets/crypto'
        case 'Bullion': return '/dashboard/assets/bullion'
        case 'Real Estate': return '/dashboard/assets/real-estate'
        default: return '/dashboard'
    }
}

export default function Overview() {
    const dashboardData = useDashboardData()
    
    // Crypto Websocket Logic
    const [cryptoAssets] = useState<CryptoRow[]>(initialCryptoRows)
    const [liveUsdByTicker, setLiveUsdByTicker] = useState<Record<string, number>>({})

    useEffect(() => {
        let isActive = true
        let socket: WebSocket | null = null
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null

        const connect = () => {
            if (!isActive) return
            socket = new WebSocket(binanceCombinedStreamUrl)

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

    // Real-time Crypto Value
    const liveCryptoValue = useMemo(() => {
        return cryptoAssets.reduce((sum, row) => {
            const liveUsd = liveUsdByTicker[row.ticker] ?? row.usd
            return sum + (row.amount * liveUsd * USD_TO_GBP)
        }, 0)
    }, [cryptoAssets, liveUsdByTicker])

    // Replace Crypto value with real-time value and recalculate total
    const dynamicAssetsWithAllocation = useMemo(() => {
        const updatedAssets = dashboardData.portfolio.assetsWithAllocation.map(asset => {
            if (asset.name === 'Crypto') {
                return { ...asset, value: liveCryptoValue }
            }
            return asset
        })
        const finalTotal = updatedAssets.reduce((sum, asset) => sum + asset.value, 0)
        
        return updatedAssets.map(asset => ({
            ...asset,
            allocation: finalTotal > 0 ? (asset.value / finalTotal) * 100 : 0
        }))
    }, [dashboardData.portfolio.assetsWithAllocation, liveCryptoValue])

    const totalAssets = dynamicAssetsWithAllocation.reduce((sum, asset) => sum + asset.value, 0)

    return (
        <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Column */}
            <div className="flex-1 space-y-8 xl:max-w-[calc(100%-26rem)]">
                {/* Header KPI */}
                <section>
                    <h1 className="text-2xl font-bold mb-6 text-white">Portfolio Overview</h1>
                    <StatCard
                        title="Total Net Assets"
                        value={`£${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        change="+12.5% YTD"
                        icon={Wallet}
                    />
                </section>

                {/* Portfolio Graph */}
                <section>
                    <PortfolioGraph />
                </section>

                {/* Asset Grid */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Asset Allocation</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dynamicAssetsWithAllocation.map((asset) => {
                            const href = getRouteForAsset(asset.name)

                            return (
                                <Link
                                    key={asset.name}
                                    href={href}
                                    className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                                >
                                    <AssetCard
                                        name={asset.name}
                                        value={asset.value}
                                        allocation={asset.allocation}
                                        icon={getIconForAsset(asset.name)}
                                    />
                                </Link>
                            )
                        })}
                    </div>
                </section>

            </div>

            {/* Right Side Summary Panel */}
            <aside className="w-full xl:w-96 space-y-8 flex-shrink-0">
                {/* FinFit Score */}
                <FinFitScoreWidget />

                {/* Debt */}
                <DebtWidget />


                {/* Goals */}
                <GoalTracker />

                {/* Spending */}
                <SpendingBreakdown />
            </aside>
        </div>
    )
}
