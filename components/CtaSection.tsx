import { ArrowRight } from 'lucide-react'

type CtaSectionProps = {
  onOpenLogin: () => void
}

export default function CtaSection({ onOpenLogin }: CtaSectionProps) {
  return (
    <section>
      <div className="relative rounded-xl border border-white/[0.07] bg-[#0e1629] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-64 bg-[radial-gradient(ellipse_at_bottom_right,rgba(30,64,175,0.15),transparent_70%)] pointer-events-none" />

        <div className="relative px-8 sm:px-14 py-14 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-widest text-blue-400 mb-5">Get Started Today</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-4">
              Build your complete financial{' '}
              <br className="hidden sm:block" />
              command center with FinFit
            </h2>
            <p className="text-slate-400 leading-7 mb-10">
              Start with Free and upgrade when you want deeper analytics, advanced planning, and premium support.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onOpenLogin}
                className="group inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-blue-500 transition-colors"
              >
                Create Your FinFit Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center text-sm font-medium text-slate-400 px-6 py-3 rounded-md border border-white/[0.08] hover:border-white/20 hover:text-white transition-all"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
