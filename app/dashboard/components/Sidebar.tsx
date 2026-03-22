'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import LogoutButton from '@/app/dashboard/logout-button'
import {
    LayoutDashboard,
    Wallet,
    PiggyBank,
    TrendingUp,
    Coins,
    Gem,
    Home,
    Briefcase,
    CreditCard,
    Layers,
    ChevronDown,
    ChevronRight
} from 'lucide-react'

const topLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pension', href: '/dashboard/assets/pension', icon: Briefcase },
    { name: 'Budget', href: '/dashboard/budget', icon: Wallet },
    { name: 'Debt', href: '/dashboard/debt', icon: CreditCard },
]

const assetLinks = [
    { name: 'Savings', href: '/dashboard/assets/savings', icon: PiggyBank },
    { name: 'Investments', href: '/dashboard/assets/investments', icon: TrendingUp },
    { name: 'Crypto', href: '/dashboard/assets/crypto', icon: Coins },
    { name: 'Bullion', href: '/dashboard/assets/bullion', icon: Gem },
    { name: 'Real Estate', href: '/dashboard/assets/real-estate', icon: Home },
]

export default function Sidebar() {
    const pathname = usePathname()
    const isAssetsRouteActive =
        pathname === '/dashboard/assets' || assetLinks.some((link) => pathname === link.href)
    const [isAssetsExpanded, setIsAssetsExpanded] = useState(isAssetsRouteActive)

    return (
        <aside className="w-64 h-full bg-transparent p-6 flex flex-col">
            <div className="flex-1 space-y-8">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        FinFit
                    </h2>
                    <p className="text-xs text-white/50 mt-1">Personal Finance Hub</p>
                </div>

                <nav className="space-y-1 text-sm font-medium">
                    {topLinks.slice(0, 1).map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 shadow-md'
                                    : 'text-white/70 hover:bg-white/5 hover:text-emerald-400'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-white/50 group-hover:text-emerald-400'}`} />
                                {link.name}
                            </Link>
                        )
                    })}

                    <div className={`rounded-xl transition-all ${isAssetsRouteActive ? 'bg-emerald-500/10 text-emerald-400 shadow-md' : 'text-white/70 hover:bg-white/5 hover:text-emerald-400'}`}>
                        <div className="flex items-center">
                            <Link
                                href="/dashboard/assets"
                                onClick={() => setIsAssetsExpanded(true)}
                                className="group flex flex-1 items-center gap-3 px-3 py-2.5"
                            >
                                <Layers className={`w-4 h-4 transition-colors ${isAssetsRouteActive ? 'text-emerald-400' : 'text-white/50 group-hover:text-emerald-400'}`} />
                                Assets
                            </Link>
                            <button
                                type="button"
                                onClick={() => setIsAssetsExpanded((value) => !value)}
                                aria-label={isAssetsExpanded ? 'Collapse assets links' : 'Expand assets links'}
                                className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-emerald-400"
                            >
                                {isAssetsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                        </div>

                        {isAssetsExpanded ? (
                            <div className="mb-2 mt-0.5 space-y-1 px-2">
                                {assetLinks.map((link) => {
                                    const AssetIcon = link.icon
                                    const isChildActive = pathname === link.href

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`group ml-4 flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all ${isChildActive
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'text-white/70 hover:bg-white/5 hover:text-emerald-400'
                                                }`}
                                        >
                                            <AssetIcon className={`h-3.5 w-3.5 transition-colors ${isChildActive ? 'text-emerald-400' : 'text-white/50 group-hover:text-emerald-400'}`} />
                                            {link.name}
                                        </Link>
                                    )
                                })}
                            </div>
                        ) : null}
                    </div>

                    {topLinks.slice(1).map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 shadow-md'
                                    : 'text-white/70 hover:bg-white/5 hover:text-emerald-400'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-white/50 group-hover:text-emerald-400'}`} />
                                {link.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="pt-6 border-t border-white/10">
                <LogoutButton />
            </div>
        </aside>
    )
}
