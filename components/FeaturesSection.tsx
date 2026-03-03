import { ShieldCheck, BarChart3, Target, Layers3, Compass, BellRing } from 'lucide-react'

const features = [
  { title: 'Net Worth Tracking', description: 'See all your assets and liabilities in one clear view, updated in real time.', icon: Layers3, accent: 'text-cyan-400', bar: 'bg-cyan-500' },
  { title: 'Smart Budgeting', description: 'Use category trends and monthly pacing to stay ahead of overspending.', icon: Compass, accent: 'text-blue-400', bar: 'bg-blue-500' },
  { title: 'Investment Analysis', description: 'Track growth, performance shifts, and allocation balance across holdings.', icon: BarChart3, accent: 'text-indigo-400', bar: 'bg-indigo-500' },
  { title: 'Goal Planning', description: 'Set savings targets and track progress toward milestones with a single clear view.', icon: Target, accent: 'text-emerald-400', bar: 'bg-emerald-500' },
  { title: 'Action Alerts', description: 'Get timely notifications for unusual spending and important portfolio moves.', icon: BellRing, accent: 'text-violet-400', bar: 'bg-violet-500' },
  { title: 'Secure by Design', description: 'Your account and financial data stay protected with strong authentication controls.', icon: ShieldCheck, accent: 'text-sky-400', bar: 'bg-sky-500' },
]

const reasons = [
  'Unified finance dashboard',
  'Fast setup and onboarding',
  'Clear portfolio visibility',
  'Built-in risk awareness',
]

export default function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20">

      <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-blue-400 mb-4">Platform Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
            Everything you need to run{' '}
            <br className="hidden lg:block" />
            your personal finances with clarity
          </h2>
          <p className="text-slate-400 mt-5 leading-7 max-w-md">
            FinFit brings together budgeting, investing, and planning in one connected workflow
            so you can move faster from insight to action.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#0e1629] p-7">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-5">
            Why people choose FinFit
          </p>
          <ul className="space-y-3">
            {reasons.map((r) => (
              <li key={r} className="flex items-center gap-3 text-sm text-slate-400">
                <span className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-white/[0.05] rounded-xl overflow-hidden border border-white/[0.06]">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <article
              key={feature.title}
              className="group relative bg-[#080d1a] hover:bg-[#0e1629] transition-colors p-7"
            >
              <div className={`absolute top-0 left-0 right-0 h-px ${feature.bar} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className={`inline-flex p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.07] ${feature.accent} mb-5`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-white text-base font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </article>
          )
        })}
      </div>

    </section>
  )
}
