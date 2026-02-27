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

export default function Overview() {
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
                        {assetsWithAllocation.map((asset) => (
                            <AssetCard
                                key={asset.name}
                                name={asset.name}
                                value={asset.value}
                                allocation={asset.allocation}
                                icon={getIconForAsset(asset.name)}
                            />
                        ))}
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
