import { Home, Percent, Calendar } from 'lucide-react'

export default function RealEstatePage() {
    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6 text-white">
                Real Estate
            </h1>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-white/10 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-sm font-medium text-white/60">Property Value</p>
                        <p className="text-4xl font-bold text-white mt-2">£716,000</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <Home className="w-6 h-6 text-white/80" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                    <div>
                        <p className="text-xs font-medium text-white/60 mb-1">Mortgage</p>
                        <p className="text-lg font-bold text-white">£612,799</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-white/60 mb-1">Monthly</p>
                        <p className="text-lg font-bold text-white">£2,200</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-white/60 mb-1">Rate</p>
                        <p className="text-lg font-bold text-white flex items-center gap-1">
                            <Percent className="w-4 h-4 text-white/50" /> 1.69
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-white/60 mb-1">Term End</p>
                        <p className="text-lg font-bold text-white flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-white/50" /> Jan 2027
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
