'use client'

import type { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'

type HeroItem = {
    icon: LucideIcon
    title: string
    description: string
    colorClass: string
}

type Props = {
    title: string
    description: string
    items: HeroItem[]
    actionText: string
    onAction: () => void
}

export default function AssetOnboardingHero({ 
    title, 
    description, 
    items, 
    actionText, 
    onAction 
}: Props) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-sm backdrop-blur-sm">
            <div className="w-full">
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                <p className="text-sm text-white/60 mb-8 leading-relaxed max-w-3xl">
                    {description}
                </p>

                <div className={`grid gap-6 ${items.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                    {items.map((item, index) => (
                        <div key={index} className="rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 border ${item.colorClass}`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-xs text-white/50 leading-relaxed font-normal">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onAction}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    {actionText}
                </button>
            </div>
        </div>
    )
}
