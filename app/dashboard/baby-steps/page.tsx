import { babySteps } from '@/lib/baby-steps'

export default function BabyStepsPage() {
    return (
        <div className="w-full space-y-6">
            <header className="space-y-3">
                <h1 className="text-2xl font-bold text-white">FinFit 7 Baby Steps</h1>
                <p className="text-sm text-white/70 max-w-3xl">
                    The FinFit Score runs from 1 to 7 and reflects the highest step you are currently focused on.
                    Progress through each step in order to build stability, reduce risk, and grow long-term wealth.
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {babySteps.map((step) => (
                    <article
                        key={step.step}
                        className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-white/10"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold text-sm flex items-center justify-center">
                                {step.step}
                            </div>
                            <h2 className="text-base font-semibold text-white">{step.title}</h2>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
                    </article>
                ))}
            </div>
        </div>
    )
}
