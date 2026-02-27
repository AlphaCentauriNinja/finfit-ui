import { ElementType } from 'react'

type Props = {
    title: string
    value: string
    change?: string
    icon?: ElementType
}

export default function StatCard({ title, value, change, icon: Icon }: Props) {
    const isPositive = change?.startsWith('+')
    const isNegative = change?.startsWith('-')

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:shadow-md hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-white/60">{title}</p>
                    <h2 className="text-3xl font-bold mt-2 text-white">{value}</h2>
                </div>
                {Icon && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <Icon className="w-5 h-5 text-purple-400" />
                    </div>
                )}
            </div>
            {change && (
                <p className={`text-xs font-medium mt-3 flex items-center gap-1 ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-white/60'
                    }`}>
                    <span className={`px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-500/10' : isNegative ? 'bg-rose-500/10' : 'bg-white/5'
                        }`}>
                        {change}
                    </span>
                </p>
            )}
        </div>
    )
}
