import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Wallet } from 'lucide-react'

type HeroSectionProps = {
  onOpenLogin: () => void
}

export default function HeroSection({ onOpenLogin }: HeroSectionProps) {
  return (
    <section id="hero" className="scroll-mt-28 pt-12">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-300/25 backdrop-blur-sm mb-7">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span className="text-xs font-semibold text-indigo-100 tracking-wide uppercase">Built for Modern Personal Finance</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.05]">
            Manage money <br className="hidden sm:block" />
            with confidence in <span className="text-indigo-300">FinFit</span>
          </h1>

          <p className="text-lg text-slate-300/85 max-w-xl mb-10 leading-relaxed">
            The personal finance operating system for cash flow, investments, and long-term planning. One clear dashboard, built for real decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center mb-10">
            <button
              onClick={onOpenLogin}
              className="group flex items-center justify-center gap-2 bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-indigo-400 transition-all w-full sm:w-auto"
            >
              Start Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 text-white/90 hover:bg-white/5 transition-colors font-semibold text-center"
            >
              Compare Plans
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-xs text-slate-400 mt-1">Goal retention</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-xs text-slate-400 mt-1">Live access</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold text-white">£1.2m</p>
              <p className="text-xs text-slate-400 mt-1">Tracked monthly</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-10 -right-6 w-36 h-36 bg-indigo-400/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-12 -left-10 w-40 h-40 bg-cyan-400/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-xl p-6 shadow-[0_20px_70px_rgba(15,23,42,0.5)]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Monthly Net Worth</p>
                <h3 className="text-3xl font-bold text-white mt-2">£261,248</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-400/15 text-emerald-300">+11.2%</span>
            </div>

            <div className="space-y-3 mb-7">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[84%] bg-gradient-to-r from-indigo-400 to-cyan-300 rounded-full" />
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[62%] bg-gradient-to-r from-cyan-300 to-emerald-300 rounded-full" />
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[46%] bg-gradient-to-r from-violet-300 to-indigo-300 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <TrendingUp className="w-4 h-4 text-indigo-300 mb-2" />
                <p className="text-xs text-slate-400">Investments</p>
                <p className="text-sm font-semibold text-white mt-1">£119,400</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <Wallet className="w-4 h-4 text-emerald-300 mb-2" />
                <p className="text-xs text-slate-400">Cash Reserve</p>
                <p className="text-sm font-semibold text-white mt-1">£36,200</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <ShieldCheck className="w-4 h-4 text-cyan-300 mb-2" />
                <p className="text-xs text-slate-400">Risk Health</p>
                <p className="text-sm font-semibold text-white mt-1">A+ Stable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
