import Link from 'next/link'
import { BriefcaseBusiness, Coins, Gem, Home, PiggyBank, TrendingUp } from 'lucide-react'

const assetRoutes = [
    {
        name: 'Pension',
        href: '/dashboard/assets/pension',
        description: 'Retirement savings, employer contributions, and performance.',
        icon: BriefcaseBusiness,
        tone: 'border-purple-500/20 bg-purple-500/10 text-purple-300',
    },
    {
        name: 'Savings',
        href: '/dashboard/assets/savings',
        description: 'Cash accounts, emergency funds, and savings goals.',
        icon: PiggyBank,
        tone: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
    },
    {
        name: 'Investments',
        href: '/dashboard/assets/investments',
        description: 'Stocks, ETFs, and portfolio performance.',
        icon: TrendingUp,
        tone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300',
    },
    {
        name: 'Crypto',
        href: '/dashboard/assets/crypto',
        description: 'Digital asset holdings and live prices.',
        icon: Coins,
        tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    },
    {
        name: 'Bullion',
        href: '/dashboard/assets/bullion',
        description: 'Gold and silver holdings with intrinsic value.',
        icon: Gem,
        tone: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    },
    {
        name: 'Real Estate',
        href: '/dashboard/assets/real-estate',
        description: 'Property holdings and estimated market value.',
        icon: Home,
        tone: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    },
]

export default function AssetsPage() {
    return (
        <div className="w-full">
            <h1 className="mb-2 text-2xl font-bold text-white">Assets</h1>
            <p className="mb-6 text-sm text-white/65">Select an asset class to open its detailed view.</p>

            <div className="grid gap-6 md:grid-cols-2">
                {assetRoutes.map((route) => {
                    const Icon = route.icon

                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className="group relative overflow-hidden block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 transition-transform active:scale-95 hover:-translate-y-1"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${route.tone} opacity-10 group-hover:opacity-20 transition-opacity`} />
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative border border-white/10 p-6 rounded-2xl h-full shadow-sm group-hover:border-white/20 transition-colors bg-slate-900/40 backdrop-blur-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${route.tone} shadow-inner`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <svg className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">{route.name}</h2>
                                <p className="text-sm text-white/60 line-clamp-2">
                                    {route.description}
                                </p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
