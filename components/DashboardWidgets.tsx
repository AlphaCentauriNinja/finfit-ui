'use client'

import Link from 'next/link'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import { ArrowDownRight, Target, ShoppingBag, Home, Zap, ArrowRight, ExternalLink } from 'lucide-react'
import { babySteps } from '@/lib/baby-steps'

const portfolioData = [
    { name: 'Jan', value: 180000 },
    { name: 'Feb', value: 195000 },
    { name: 'Mar', value: 210000 },
    { name: 'Apr', value: 205000 },
    { name: 'May', value: 220000 },
    { name: 'Jun', value: 240000 },
    { name: 'Jul', value: 260000 },
]

export function PortfolioGraph() {
    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Portfolio Performance</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    +12.5% YTD
                </span>
            </div>
            <div className="h-[300px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `£${value / 1000}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#818cf8' }}
                            formatter={(value: number) => [`£${value.toLocaleString()}`, 'Portfolio Value']}
                        />
                        <Area
                            type="natural"
                            dataKey="value"
                            stroke="#818cf8"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0, fill: '#a5b4fc' }}
                            isAnimationActive
                            animationDuration={900}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export function FinFitScoreWidget() {
    const score = 3
    const currentStep = babySteps[score - 1]

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white">FinFit Score</h3>
                    <p className="text-xs text-white/50 mt-1">AI-determined from the FinFit 7 Baby Steps</p>
                </div>
                <p className="text-indigo-300 font-bold text-xl leading-none">
                    {score}
                    <span className="text-sm text-white/50 ml-0.5">/7</span>
                </p>
            </div>

            <div className="mb-4">
                <div className="grid grid-cols-7 gap-2">
                    {babySteps.map((stepData, index) => {
                        const value = index + 1
                        const isActive = value <= score

                        return (
                            <div
                                key={stepData.step}
                                className={`h-11 rounded-lg border flex items-center justify-center text-2xl leading-none font-bold ${isActive
                                    ? 'bg-purple-500/25 text-purple-400 border-purple-400/60'
                                    : 'bg-white/5 text-slate-400 border-white/10'
                                    }`}
                            >
                                {value}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-white/45">Current Step</p>
                <p className="text-sm font-semibold text-white mt-1">Baby Step {score}</p>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">{currentStep.title}</p>
            </div>

            <Link
                href="/dashboard/baby-steps"
                className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 mt-4 transition-colors"
            >
                Learn the 7 baby steps
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    )
}

const gaugeData = [
    { name: 'Saved', value: 21000 },
    { name: 'Remaining', value: 36000 - 21000 },
]

export function SavingsGauge() {
    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-white w-full text-left mb-2">Emergency Fund</h3>
            <div className="relative h-[160px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={gaugeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={70}
                            startAngle={180}
                            endAngle={0}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell fill="#a78bfa" />
                            <Cell fill="#ffffff15" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center mt-6">
                    <span className="text-2xl font-bold text-white">£21k</span>
                    <span className="text-xs text-white/50">of £36k goal</span>
                </div>
            </div>
        </div>
    )
}

const spendingData = [
    { name: 'Housing', amount: 1200 },
    { name: 'Food', amount: 600 },
    { name: 'Transport', amount: 300 },
    { name: 'Utilities', amount: 250 },
    { name: 'Ent.', amount: 400 },
]

export function SpendingBreakdown() {
    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Monthly Spending</h3>
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendingData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: '#ffffff10' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px' }}
                        />
                        <Bar dataKey="amount" fill="#c084fc" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export function GoalTracker() {
    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Goals</h3>
                <Target className="w-4 h-4 text-white/50" />
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-white/80 font-medium">Emergency Fund</span>
                        <span className="text-white">£4k / £10k</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-white/80 font-medium">New Car</span>
                        <span className="text-white">£15k / £25k</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-indigo-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-white/80 font-medium">Holiday</span>
                        <span className="text-white">£2.5k / £3k</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-fuchsia-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const transactions = [
    { id: 1, title: 'Waitrose & Partners', category: 'Groceries', amount: -65.20, date: 'Today, 2:45 PM', icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 2, title: 'Salary', category: 'Income', amount: 4200.00, date: 'Yesterday', icon: ArrowDownRight, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 3, title: 'British Gas', category: 'Utilities', amount: -120.50, date: 'Oct 24', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 4, title: 'Mortgage', category: 'Housing', amount: -1100.00, date: 'Oct 22', icon: Home, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 5, title: 'Apple Store', category: 'Electronics', amount: -999.00, date: 'Oct 15', icon: ExternalLink, color: 'text-rose-400', bg: 'bg-rose-400/10' },
]

export function TransactionHistory() {
    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6">Recent Transactions</h3>
            <div className="space-y-4">
                {transactions.map((t) => {
                    const Icon = t.icon
                    const isPositive = t.amount > 0
                    return (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl ${t.bg}`}>
                                    <Icon className={`w-5 h-5 ${t.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{t.title}</p>
                                    <p className="text-xs text-white/50">{t.category} • {t.date}</p>
                                </div>
                            </div>
                            <div className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-white'}`}>
                                {isPositive ? '+' : ''}£{Math.abs(t.amount).toFixed(2)}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
