const stats = [
  { label: 'Monthly Active Users', value: '45K+' },
  { label: 'Assets Tracked', value: '£920M' },
  { label: 'Countries Supported', value: '32' },
  { label: 'Avg. Time Saved', value: '8h/mo' },
]

const partners = ['Nova Capital', 'Aurora Wealth', 'Summit Trust', 'Bluepeak', 'Northbank']

export default function SocialProofSection() {
  return (
    <section>
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-300/70 mb-5">Trusted by finance-focused teams</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {partners.map((partner) => (
              <div
                key={partner}
                className="rounded-xl border border-white/10 bg-white/5 text-center px-3 py-2 text-sm text-slate-200/85"
              >
                {partner}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
    </section>
  )
}
