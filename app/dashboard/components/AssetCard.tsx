import { ElementType } from 'react'

type Props = {
    name: string
    value: number
    allocation: number
    icon?: ElementType
}

export default function AssetCard({
    name,
    value,
    allocation,
    icon: Icon,
}: Props) {
    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:shadow-md hover:bg-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-indigo-400">
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <span className="text-sm font-medium text-white/60">{name}</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-white/5 border border-white/10 text-white/80 rounded-lg group-hover:bg-white/10 transition-colors">
                    {allocation.toFixed(1)}%
                </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-6">
                £{value.toLocaleString()}
            </h3>

            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                    className="bg-indigo-400 h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${allocation}%` }}
                />
            </div>
        </div>
    )
}
