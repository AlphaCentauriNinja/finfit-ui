'use client'

import { Home, Percent, Calendar, Plus, MapPin, TrendingUp, Building2 } from 'lucide-react'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import EmptyStateAlert from '@/app/dashboard/components/EmptyStateAlert'
import AssetOnboardingHero from '@/app/dashboard/components/AssetOnboardingHero'
import { useState } from 'react'

export default function RealEstatePage() {
    const { hideValues } = usePrivacy()
    // Simulated state for demonstration; in a real app this would come from a DB
    const [properties, setProperties] = useState([
        { id: 1, name: 'Main Residence' }
    ])

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Real Estate</h1>
                    <p className="mt-1 text-sm text-white/65">
                        Track your properties, mortgages, and home equity.
                    </p>
                </div>
                <button
                    disabled
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 opacity-50 cursor-not-allowed"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Property
                </button>
            </div>

            {properties.length === 0 ? (
                <div className="space-y-6">
                    <EmptyStateAlert
                        description="No properties tracked yet. Add your first home or investment property to monitor your equity."
                    />

                    <AssetOnboardingHero
                        title="Track Your Property Equity"
                        description="Monitor your real estate portfolio, manage mortgages, and track your growing equity as you pay down debt."
                        items={[
                            {
                                icon: Home,
                                title: "Residential & Investment",
                                description: "Track your main home or buy-to-let properties. Record valuations and location details for a complete overview.",
                                colorClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                            },
                            {
                                icon: Building2,
                                title: "Mortgage Tracking",
                                description: "Link mortgages to your properties to see your actual equity. Track interest rates, monthly payments, and term ends.",
                                colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            }
                        ]}
                        actionText="Add First Property"
                        onAction={() => {}} // Placeholder until DB integration
                    />
                </div>
            ) : (
                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-white/10 mb-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-sm font-medium text-white/60">Property Value</p>
                            <p className="text-4xl font-bold text-white mt-2">{hideValues ? '****' : '£716,000'}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <Home className="w-6 h-6 text-white/80" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                        <div>
                            <p className="text-xs font-medium text-white/60 mb-1">Mortgage</p>
                            <p className="text-lg font-bold text-white">{hideValues ? '****' : '£612,799'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white/60 mb-1">Monthly</p>
                            <p className="text-lg font-bold text-white">{hideValues ? '****' : '£2,200'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white/60 mb-1">Rate</p>
                            <p className="text-lg font-bold text-white flex items-center gap-1">
                                <Percent className="w-4 h-4 text-white/50" /> {hideValues ? '****' : '1.69'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white/60 mb-1">Term End</p>
                            <p className="text-lg font-bold text-white flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-white/50" /> Jan 2027
                            </p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            onClick={() => setProperties([])}
                            className="text-xs text-white/30 hover:text-white/60 transition-colors"
                        >
                            [Dev Mode] Clear data to see empty state
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
