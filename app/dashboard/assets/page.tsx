'use client'

import Link from 'next/link'
import { BriefcaseBusiness, ChevronRight, Coins, Gem, Home, PiggyBank, TrendingUp } from 'lucide-react'
import { useDashboardData } from '@/app/dashboard/components/providers/DashboardDataProvider'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import { formatCurrency } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type AssetRoute = {
    name: string
    href: string
    description: string
    icon: LucideIcon
    iconBg: string
    iconColor: string
    iconBorder: string
    barHex: string
    hoverBorder: string
}

const assetRoutes: AssetRoute[] = [
    {
        name: 'Pension',
        href: '/dashboard/assets/pension',
        description: 'Retirement savings & employer contributions',
        icon: BriefcaseBusiness,
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-400',
        iconBorder: 'border-purple-500/20',
        barHex: '#c084fc',
        hoverBorder: 'hover:border-purple-500/30',
    },
    {
        name: 'Savings',
        href: '/dashboard/assets/savings',
        description: 'Cash accounts & emergency funds',
        icon: PiggyBank,
        iconBg: 'bg-indigo-500/10',
        iconColor: 'text-indigo-400',
        iconBorder: 'border-indigo-500/20',
        barHex: '#818cf8',
        hoverBorder: 'hover:border-indigo-500/30',
    },
    {
        name: 'Investments',
        href: '/dashboard/assets/investments',
        description: 'Stocks, ETFs & portfolio performance',
        icon: TrendingUp,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-400',
        iconBorder: 'border-blue-500/20',
        barHex: '#60a5fa',
        hoverBorder: 'hover:border-blue-500/30',
    },
    {
        name: 'Crypto',
        href: '/dashboard/assets/crypto',
        description: 'Digital asset holdings & live prices',
        icon: Coins,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-400',
        iconBorder: 'border-emerald-500/20',
        barHex: '#34d399',
        hoverBorder: 'hover:border-emerald-500/30',
    },
    {
        name: 'Bullion',
        href: '/dashboard/assets/bullion',
        description: 'Gold & silver with intrinsic value',
        icon: Gem,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-400',
        iconBorder: 'border-amber-500/20',
        barHex: '#fbbf24',
        hoverBorder: 'hover:border-amber-500/30',
    },
    {
        name: 'Real Estate',
        href: '/dashboard/assets/real-estate',
        description: 'Property holdings & market value',
        icon: Home,
        iconBg: 'bg-rose-500/10',
        iconColor: 'text-rose-400',
        iconBorder: 'border-rose-500/20',
        barHex: '#fb7185',
        hoverBorder: 'hover:border-rose-500/30',
    },
]

export default function AssetsPage() {
    const dashboardData = useDashboardData()
    const { hideValues } = usePrivacy()

    const totalAssetsValue = dashboardData.portfolio.totalAssets

    // Build a lookup map from portfolio.assetsWithAllocation by name
    const assetValueMap = new Map(
        dashboardData.portfolio.assetsWithAllocation.map((a) => [a.name, a.value])
    )

    return (
        <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Assets</h1>
                    <p className="text-sm text-white/65 mt-1">Your wealth across all asset classes</p>
                </div>
            </div>

            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                <p className="text-sm font-medium text-white/60">Total Assets Value</p>
                <p className="mt-2 text-3xl font-bold text-white">
                    {formatCurrency(totalAssetsValue, hideValues)}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {assetRoutes.map((route) => {
                    const Icon = route.icon
                    const value = assetValueMap.get(route.name) ?? 0
                    const proportion = totalAssetsValue > 0 ? (value / totalAssetsValue) * 100 : 0

                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className="group/card block"
                        >
                            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-white/60">{route.name}</h3>
                                        <p className="text-2xl font-bold text-white mt-1">
                                            {formatCurrency(value, hideValues)}
                                        </p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full ${route.iconBg} flex items-center justify-center ${route.iconColor} font-bold border ${route.iconBorder} group-hover/card:scale-110 transition-transform`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4 mb-6">
                                    <div className="flex-1 bg-white/5 rounded-full h-1.5">
                                        <div
                                            className="h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${proportion}%`, backgroundColor: route.barHex }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-white/50 tabular-nums w-12 text-right">
                                        {proportion.toFixed(1)}%
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <div className={`p-4 rounded-xl border border-white/10 bg-white/5 group-hover/card:bg-white/10 ${route.hoverBorder} transition-all duration-300`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${route.iconBg} ${route.iconColor} border ${route.iconBorder} group-hover/card:scale-110 transition-transform`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{route.name}</p>
                                                    <p className="text-sm font-medium text-white/70 mt-0.5">
                                                        {route.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-white/20 group-hover/card:text-white/60 group-hover/card:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
