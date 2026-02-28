type CtaSectionProps = {
  onOpenLogin: () => void
}

export default function CtaSection({ onOpenLogin }: CtaSectionProps) {
  return (
    <section>
        <div className="rounded-3xl border border-indigo-300/25 bg-gradient-to-br from-indigo-500/25 via-slate-900/70 to-cyan-500/10 p-8 sm:p-12">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/80 mb-4">Get Started Today</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Build your complete financial command center with FinFit
            </h2>
            <p className="text-slate-200/80 mt-4">
              Start with Free and upgrade when you want deeper analytics, advanced planning, and premium support.
            </p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onOpenLogin}
              className="px-6 py-3 rounded-xl bg-white text-slate-950 font-semibold hover:bg-slate-100 transition-colors"
            >
              Create Your FinFit Account
            </button>
            <a
              href="#pricing"
              className="px-6 py-3 rounded-xl border border-white/25 text-white/90 hover:bg-white/10 transition-colors font-semibold text-center"
            >
              View Pricing
            </a>
          </div>
        </div>
    </section>
  )
}
