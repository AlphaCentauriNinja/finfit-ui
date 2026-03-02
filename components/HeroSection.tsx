import { ArrowRight, TrendingUp, ShieldCheck, Wallet, ArrowUpRight } from 'lucide-react'

type HeroSectionProps = {
  onOpenLogin: () => void
}

export default function HeroSection({ onOpenLogin }: HeroSectionProps) {
  return (
    <section id="hero" className="scroll-mt-20 pt-20 lg:pt-28">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

        {/* Left: Copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-blue-500/30 bg-blue-500/8 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 block" />
            <span className="text-[11px] font-semibold text-blue-300 tracking-widest uppercase">Built for Modern Personal Finance</span>
          </div>

          <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Manage money{' '}
            <br className="hidden sm:block" />
            with confidence{' '}
            <br className="hidden sm:block" />
            <span className="text-blue-400">in FinFit</span>
          </h1>

          <p className="text-base text-slate-400 max-w-lg mb-10 leading-7">
            The personal finance operating system for cash flow, investments,
            and long-term planning. One clear dashboard, built for real decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start mb-14">
            <button
              onClick={onOpenLogin}
              className="group inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-blue-500 transition-colors"
            >
              Start Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 px-6 py-3 rounded-md border border-white/10 hover:border-white/20 hover:text-white transition-all"
            >
              Compare Plans
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/[0.07] pt-10">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">98%</p>
              <p className="text-xs text-slate-500 mt-1">Goal retention</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-xs text-slate-500 mt-1">Live access</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">£1.2m</p>
              <p className="text-xs text-slate-500 mt-1">Tracked monthly</p>
            </div>
          </div>
        </div>

        {/* Right: Dashboard mockup */}
        <div className="relative">
          {/* Ambient glow behind card */}
          <div className="absolute -inset-12 bg-[radial-gradient(ellipse_at_center,rgba(30,64,175,0.12),transparent_70%)] pointer-events-none" />

          <div className="relative rounded-xl border border-white/[0.08] bg-[#0e1629] overflow-hidden shadow-2xl">
            {/* Card header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <span className="text-[11px] text-slate-500 tracking-wide">Portfolio Overview</span>
              <span className="text-[11px] text-slate-500">Live</span>
            </div>

            <div className="p-6">
              {/* Top row */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">Total Net Worth</p>
                  <h3 className="text-4xl font-bold text-white tabular-nums">£261,248</h3>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +11.2%
                </div>
              </div>

              {/* Allocation bars */}
              <div className="space-y-4 mb-8">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                    <span>Equities</span><span>84%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full w-[84%] bg-blue-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                    <span>Fixed Income</span><span>62%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full w-[62%] bg-cyan-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                    <span>Alternatives</span><span>46%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full w-[46%] bg-violet-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Asset cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-3.5">
                  <TrendingUp className="w-4 h-4 text-blue-400 mb-3" />
                  <p className="text-[11px] text-slate-500 mb-1">Investments</p>
                  <p className="text-sm font-semibold text-white tabular-nums">£119,400</p>
                </div>
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-3.5">
                  <Wallet className="w-4 h-4 text-emerald-400 mb-3" />
                  <p className="text-[11px] text-slate-500 mb-1">Cash Reserve</p>
                  <p className="text-sm font-semibold text-white tabular-nums">£36,200</p>
                </div>
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-3.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 mb-3" />
                  <p className="text-[11px] text-slate-500 mb-1">Risk Health</p>
                  <p className="text-sm font-semibold text-white">A+ Stable</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
