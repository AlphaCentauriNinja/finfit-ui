'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/app/dashboard/logout-button'
import {
    LayoutDashboard,
    Wallet,
    PiggyBank,
    TrendingUp,
    Coins,
    Gem,
    Home,
    Briefcase
} from 'lucide-react'

const links = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pension', href: '/dashboard/pension', icon: Briefcase },
    { name: 'Savings', href: '/dashboard/savings', icon: PiggyBank },
    { name: 'ISA', href: '/dashboard/isa', icon: TrendingUp },
    { name: 'Crypto', href: '/dashboard/crypto', icon: Coins },
    { name: 'Bullion', href: '/dashboard/bullion', icon: Gem },
    { name: 'Real Estate', href: '/dashboard/real-estate', icon: Home },
    { name: 'Salary', href: '/dashboard/salary', icon: Wallet },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-white/5 border-r border-y-0 border-l-0 border-white/10 backdrop-blur-md rounded-r-2xl p-6 flex flex-col min-h-screen">
            <div className="flex-1 space-y-8">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        FinFit
                    </h2>
                    <p className="text-xs text-white/50 mt-1">Personal Finance Hub</p>
                </div>

                <nav className="space-y-1 text-sm font-medium">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                    ? 'bg-white/10 text-white shadow-md'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/50'}`} />
                                {link.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="pt-6 border-t border-white/10">
                <LogoutButton />
            </div>
        </aside>
    )
}
