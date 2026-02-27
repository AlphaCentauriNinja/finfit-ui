import { TrendingUp, Github } from 'lucide-react'

export default function CryptoPage() {
    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6 text-white">
                Crypto Portfolio
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-white/60">Current Value</p>
                    <p className="text-3xl font-bold text-white mt-2">£16,340.57</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-white/60">Total Invested</p>
                    <p className="text-3xl font-bold text-white mt-2">£16,000.00</p>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white/90">Performance (PNL)</h3>
                    <span className="flex items-center gap-1 text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                        <TrendingUp className="w-4 h-4" />
                        +2.12%
                    </span>
                </div>
                <p className="text-4xl font-bold text-emerald-400 mt-4">+£340.56</p>
            </div>
        </div>
    )
}
