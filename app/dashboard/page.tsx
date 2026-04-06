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
    Gem,
    Eye,
    EyeOff
} from 'lucide-react'
import {
    PortfolioGraph,
    FinFitScoreWidget,
    DebtWidget,
    GoalTracker
} from '@/app/dashboard/components/DashboardWidgets'
import { useDashboardData } from '@/app/dashboard/components/providers/DashboardDataProvider'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import { USD_TO_GBP, binanceCombinedStreamUrl } from '@/lib/crypto-data'
import { formatCurrency } from '@/lib/utils'

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
        case 'Pension': return '/dashboard/pension'
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
    const { hideValues, toggleHideValues } = usePrivacy()
    const [optimisticHideValues, setOptimisticHideValues] = useState(hideValues)

    // Crypto Websocket Logic
    const [liveUsdByTicker, setLiveUsdByTicker] = useState<Record<string, number>>({})

    useEffect(() => {
        setOptimisticHideValues(hideValues)
    }, [hideValues])

    const handleToggleHideValues = () => {
        setOptimisticHideValues((previous) => !previous)
        toggleHideValues()
    }

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
        return dashboardData.crypto.assets.reduce((sum, row) => {
            const liveUsd = liveUsdByTicker[row.ticker] ?? row.usd
            return sum + (row.amount * liveUsd * USD_TO_GBP)
        }, 0)
    }, [dashboardData.crypto.assets, liveUsdByTicker])

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
    const dynamicYtdPnl = useMemo(() => {
        const totalDeltaFromSnapshot = totalAssets - dashboardData.portfolio.totalAssets
        return dashboardData.portfolio.ytdPnl + totalDeltaFromSnapshot
    }, [totalAssets, dashboardData.portfolio.totalAssets, dashboardData.portfolio.ytdPnl])
    const dynamicYtdPercentage = useMemo(() => {
        return dashboardData.portfolio.startOfYearValue > 0
            ? (dynamicYtdPnl / dashboardData.portfolio.startOfYearValue) * 100
            : 0
    }, [dynamicYtdPnl, dashboardData.portfolio.startOfYearValue])
    const ytdChangeLabel = `${dynamicYtdPercentage >= 0 ? '+' : ''}${dynamicYtdPercentage.toFixed(2)}% YTD`

    return (
        <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Column */}
            <div className="flex-1 space-y-8 xl:max-w-[calc(100%-26rem)]">
                {/* Header KPI */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-white">Portfolio Overview</h1>
                        <button
                            onClick={handleToggleHideValues}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 transition-colors"
                            title={optimisticHideValues ? "Show values" : "Hide values"}
                        >
                            {optimisticHideValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            <span className="text-sm font-medium">
                                {optimisticHideValues ? "Show Values" : "Hide Values"}
                            </span>
                        </button>
                    </div>
                    <StatCard
                        title="Total Net Assets"
                        value={formatCurrency(totalAssets, optimisticHideValues)}
                        change={ytdChangeLabel}
                        icon={Wallet}
                    />
                </section>

                {/* Portfolio Graph */}
                {!optimisticHideValues ? (
                    <section>
                        <PortfolioGraph
                            totalAssets={totalAssets}
                            ytdPnl={dynamicYtdPnl}
                            ytdPercentage={dynamicYtdPercentage}
                        />
                    </section>
                ) : null}

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
                                        hideValues={optimisticHideValues}
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
                <DebtWidget hideValuesOverride={optimisticHideValues} />


                {/* Goals */}
                <GoalTracker hideValuesOverride={optimisticHideValues} />
            </aside>
        </div>
    )
}
