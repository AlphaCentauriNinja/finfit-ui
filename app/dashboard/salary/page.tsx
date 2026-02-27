import { Wallet, CreditCard, Users, Home } from 'lucide-react'

export default function SalaryPage() {
    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6 text-white">
                Income & Outgoings
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-emerald-300 font-medium text-sm">Monthly Net Salary</h3>
                        <Wallet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-4xl font-bold text-emerald-400">£5,700</p>
                    <p className="text-sm font-medium text-emerald-300/80 mt-2">£68,400 annually</p>
                </div>

                <div className="bg-rose-500/10 backdrop-blur-sm border border-rose-500/20 p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-rose-300 font-medium text-sm">Monthly Commited Outgoings</h3>
                        <CreditCard className="w-5 h-5 text-rose-400" />
                    </div>
                    <p className="text-4xl font-bold text-rose-400">£2,700</p>
                    <p className="text-sm font-medium text-rose-300/80 mt-2">47% of net income</p>
                </div>
            </div>

            <h2 className="text-lg font-bold mb-4 text-white/90">Core Expenses breakdown</h2>
            <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                            <Home className="w-5 h-5 text-white/80" />
                        </div>
                        <div>
                            <p className="font-bold text-white">Mortgage</p>
                            <p className="text-sm text-white/60">Fixed rate until 2027</p>
                        </div>
                    </div>
                    <p className="font-bold text-lg text-white">£1,100</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                            <Users className="w-5 h-5 text-white/80" />
                        </div>
                        <div>
                            <p className="font-bold text-white">Nanny</p>
                            <p className="text-sm text-white/60">Childcare</p>
                        </div>
                    </div>
                    <p className="font-bold text-lg text-white">£1,600</p>
                </div>
            </div>
        </div>
    )
}
