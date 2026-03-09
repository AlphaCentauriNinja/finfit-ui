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
                            className={`block rounded-2xl border p-6 shadow-sm backdrop-blur-sm transition-all hover:translate-y-[-1px] hover:brightness-110 ${route.tone}`}
                        >
                            <div className="mb-3 inline-flex rounded-lg border border-white/15 bg-white/10 p-2">
                                <Icon className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-bold text-white">{route.name}</h2>
                            <p className="mt-1 text-sm text-white/80">{route.description}</p>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
