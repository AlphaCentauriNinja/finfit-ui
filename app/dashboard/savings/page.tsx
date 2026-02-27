export default function SavingsPage() {
    const savings = [
        { name: 'HSBC Emergency', value: 20323.29 },
        { name: 'Lloyds', value: 0 },
        { name: 'Monzo', value: 850 },
    ]

    const total = savings.reduce((sum, s) => sum + s.value, 0)

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6 text-white">
                Savings Accounts
            </h1>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 mb-8">
                <p className="text-sm font-medium text-white/60">Total Value</p>
                <p className="text-3xl font-bold text-white mt-2">£{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="space-y-4">
                {savings.map((s) => (
                    <div
                        key={s.name}
                        className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-indigo-400 font-bold border border-white/10">
                                {s.name.charAt(0)}
                            </div>
                            <span className="font-medium text-white/90">{s.name}</span>
                        </div>
                        <span className="font-bold text-lg text-white">
                            £{s.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
