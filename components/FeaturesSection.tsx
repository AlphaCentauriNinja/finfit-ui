import { ShieldCheck, BarChart3, Target, Layers3, Compass, BellRing } from 'lucide-react'

const features = [
  {
    title: 'Net Worth Tracking',
    description: 'See all your assets and liabilities in one clear view, updated in real time.',
    icon: Layers3,
    iconColor: 'text-cyan-300',
    iconBg: 'bg-cyan-500/20',
  },
  {
    title: 'Smart Budgeting',
    description: 'Use category trends and monthly pacing to stay ahead of overspending.',
    icon: Compass,
    iconColor: 'text-indigo-300',
    iconBg: 'bg-indigo-500/20',
  },
  {
    title: 'Investment Analysis',
    description: 'Track growth, performance shifts, and allocation balance across holdings.',
    icon: BarChart3,
    iconColor: 'text-indigo-300',
    iconBg: 'bg-indigo-500/20',
  },
  {
    title: 'Goal Planning',
    description: 'Set savings targets and track progress toward milestones with a single clear view.',
    icon: Target,
    iconColor: 'text-emerald-300',
    iconBg: 'bg-emerald-500/20',
  },
  {
    title: 'Action Alerts',
    description: 'Get timely notifications for unusual spending and important portfolio moves.',
    icon: BellRing,
    iconColor: 'text-violet-300',
    iconBg: 'bg-violet-500/20',
  },
  {
    title: 'Secure by Design',
    description: 'Your account and financial data stay protected with strong authentication controls.',
    icon: ShieldCheck,
    iconColor: 'text-sky-300',
    iconBg: 'bg-sky-500/20',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-28">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-start mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/85 mb-4">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Everything you need to run your personal finances with clarity
            </h2>
            <p className="text-slate-300/80 mt-5 leading-relaxed">
              FinFit brings together budgeting, investing, and planning in one connected workflow so you can move faster from insight to action.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
            <p className="text-sm text-white/90 mb-3">Why teams choose FinFit</p>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-300/85">
              <li className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">Unified finance dashboard</li>
              <li className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">Fast setup and onboarding</li>
              <li className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">Clear portfolio visibility</li>
              <li className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">Built-in risk awareness</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className={`inline-flex p-2 rounded-lg ${feature.iconBg} ${feature.iconColor} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-300/80 leading-relaxed">{feature.description}</p>
              </article>
            )
          })}
        </div>
    </section>
  )
}
