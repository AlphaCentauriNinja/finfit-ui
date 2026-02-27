export default function BullionPage() {
    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6 text-white">
                Bullion Holdings
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-white/60">Gold Market Value</p>
                    <p className="text-3xl font-bold text-white mt-2">£5,817.95</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-white/60">Silver Market Value</p>
                    <p className="text-3xl font-bold text-white mt-2">£9,414.96</p>
                </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-amber-500/20 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-amber-200">Total Market Value</h3>
                </div>
                <p className="text-4xl font-bold text-amber-400 mt-4">£15,232.91</p>
            </div>
        </div>
    )
}
