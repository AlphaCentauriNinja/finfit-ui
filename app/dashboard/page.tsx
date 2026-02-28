import Link from 'next/link'
import StatCard from '@/components/StatCard'
import AssetCard from '@/components/AssetCard'
import { assetsWithAllocation, totalAssets } from '@/lib/assets'
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
    SavingsGauge,
    SpendingBreakdown,
    GoalTracker,
    TransactionHistory
} from '@/components/DashboardWidgets'

const getIconForAsset = (name: string) => {
    switch (name) {
        case 'Pension': return Briefcase
        case 'Real Estate': return Home
        case 'ISA': return TrendingUp
        case 'Savings': return PiggyBank
        case 'Crypto': return Coins
        case 'Bullion': return Gem
        default: return Wallet
    }
}

const getRouteForAsset = (name: string) => {
    switch (name) {
        case 'Pension': return '/dashboard/pension'
        case 'Savings': return '/dashboard/savings'
        case 'ISA': return '/dashboard/isa'
        case 'Crypto': return '/dashboard/crypto'
        case 'Bullion': return '/dashboard/bullion'
        case 'Real Estate': return '/dashboard/real-estate'
        default: return '/dashboard'
    }
}

export default function Overview() {
    return (
        <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Column */}
            <div className="flex-1 space-y-8 xl:max-w-[calc(100%-26rem)]">
                {/* Header KPI */}
                <section>
                    <h1 className="text-2xl font-bold mb-6 text-white">FinFit Portfolio Overview</h1>
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
                        {assetsWithAllocation.map((asset) => {
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

                {/* Transaction History */}
                <section>
                    <TransactionHistory />
                </section>
            </div>

            {/* Right Side Summary Panel */}
            <aside className="w-full xl:w-96 space-y-8 flex-shrink-0">
                {/* Gauge */}
                <div className="xl:mt-14">
                    <SavingsGauge />
                </div>

                {/* Goals */}
                <GoalTracker />

                {/* Spending */}
                <SpendingBreakdown />
            </aside>
        </div>
    )
}
