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
    EyeOff,
    FileDown,
    Loader2
} from 'lucide-react'
import {
    PortfolioGraph,
    FinFitScoreWidget,
    DebtWidget,
    GoalTracker,
    SpendingBreakdown
} from '@/app/dashboard/components/DashboardWidgets'
import { PortfolioReportPDF } from '@/app/dashboard/components/PortfolioReportPDF'
import { useDashboardData } from '@/app/dashboard/components/providers/DashboardDataProvider'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import { USD_TO_GBP, binanceCombinedStreamUrl } from '@/lib/crypto-data'
import { formatCurrency } from '@/lib/utils'
import { useSpotPrices } from '@/app/dashboard/assets/bullion/useSpotPrices'
import jsPDF from 'jspdf'
import * as htmlToImage from 'html-to-image'
import { useRef } from 'react'

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
    const [isExporting, setIsExporting] = useState(false)
    const pdfRef = useRef<HTMLDivElement>(null)

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

    // Real-time Bullion Value
    const spotPrices = useSpotPrices('GBP')
    const liveBullionValue = useMemo(() => {
        if (!spotPrices.goldPricePerGram || !spotPrices.silverPricePerGram) {
            return dashboardData.bullion.totalInvested
        }
        return dashboardData.bullion.holdings.reduce((sum, row) => {
            const price = row.metal === 'GOLD' ? spotPrices.goldPricePerGram! : spotPrices.silverPricePerGram!
            const intrinsicTotal = price * row.weightPerItemGrams * row.amount
            const premiumMultiplier = 1 + ((row.marketPremiumPct || 0) / 100)
            return sum + (intrinsicTotal * premiumMultiplier)
        }, 0)
    }, [dashboardData.bullion, spotPrices.goldPricePerGram, spotPrices.silverPricePerGram])

    // Replace Crypto & Bullion values with real-time values and recalculate total
    const dynamicAssetsWithAllocation = useMemo(() => {
        const updatedAssets = dashboardData.portfolio.assetsWithAllocation.map(asset => {
            if (asset.name === 'Crypto') {
                return { ...asset, value: liveCryptoValue }
            }
            if (asset.name === 'Bullion') {
                return { ...asset, value: liveBullionValue }
            }
            return asset
        })
        const finalTotal = updatedAssets.reduce((sum, asset) => sum + asset.value, 0)

        return updatedAssets.map(asset => ({
            ...asset,
            allocation: finalTotal > 0 ? (asset.value / finalTotal) * 100 : 0
        }))
    }, [dashboardData.portfolio.assetsWithAllocation, liveCryptoValue, liveBullionValue])

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

    const handleExportPDF = async () => {
        if (isExporting) return
        setIsExporting(true)

        try {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
            await new Promise((resolve) => setTimeout(resolve, 350))

            const reportNode = pdfRef.current
            if (!reportNode) throw new Error('PDF export node is not available')

            // Wait an extra moment to ensure Recharts SVG is fully drawn
            await new Promise(resolve => setTimeout(resolve, 800))

            const dataUrl = await htmlToImage.toPng(reportNode, {
                pixelRatio: 1.5,
                backgroundColor: '#ffffff',
                cacheBust: true,
                style: { opacity: '1', transform: 'none' },
            })

            if (!dataUrl || dataUrl === 'data:,') {
                throw new Error('Browser engine failed to generate the image. Please try again.')
            }

            // A4 page dimensions in mm
            const imgWidth = 210
            const pageHeight = 297

            // Calculate exact height of the full image scaled to A4 width
            const fullImgHeight = (reportNode.offsetHeight * imgWidth) / reportNode.offsetWidth

            const pdf = new jsPDF('p', 'mm', 'a4')
            let heightLeft = fullImgHeight
            let position = 0

            pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, fullImgHeight)
            heightLeft -= pageHeight

            while (heightLeft > 1) { // > 1 to account for rounding errors
                position = heightLeft - fullImgHeight
                pdf.addPage()
                pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, fullImgHeight)
                heightLeft -= pageHeight
            }

            const dateStr = new Date().toISOString().split('T')[0]
            pdf.save(`portfolio-breakdown-${dateStr}.pdf`)
        } catch (error) {
            console.error('PDF export failed', error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <>
            {isExporting && (
                <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <h2 className="text-2xl font-bold text-white">Generating Portfolio Report</h2>
                    <p className="text-slate-400 mt-2">Processing high-resolution pages, please wait...</p>
                </div>
            )}
            {isExporting && (
                <div className="absolute top-0 left-0 z-[9998] pointer-events-none bg-white">
                    <PortfolioReportPDF 
                        ref={pdfRef} 
                        data={dashboardData} 
                        dynamicAssetsWithAllocation={dynamicAssetsWithAllocation}
                        totalAssets={totalAssets}
                        dynamicYtdPnl={dynamicYtdPnl}
                        dynamicYtdPercentage={dynamicYtdPercentage}
                        liveUsdByTicker={liveUsdByTicker}
                        spotGoldPricePerGram={spotPrices.goldPricePerGram}
                        spotSilverPricePerGram={spotPrices.silverPricePerGram}
                    />
                </div>
            )}
            <div className="flex flex-col xl:flex-row gap-8 p-4 bg-[#0f172a]">
            {/* Main Column */}
            <div className="flex-1 space-y-8 xl:max-w-[calc(100%-26rem)]">
                {/* Header KPI */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-white">Portfolio Overview</h1>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Export to PDF"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                <span className="text-sm font-medium">
                                    {isExporting ? "Exporting..." : "Export PDF"}
                                </span>
                            </button>
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

                {/* Spending */}
                <SpendingBreakdown hideValuesOverride={optimisticHideValues} />

                {/* Debt */}
                <DebtWidget hideValuesOverride={optimisticHideValues} />


                {/* Goals */}
                <GoalTracker hideValuesOverride={optimisticHideValues} />
            </aside>
        </div>
        </>
    )
}
