import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans text-gray-100">
            {/* Dynamic Background Gradients */}
            <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-purple-700/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 flex w-full min-h-screen p-4">
                <div className="flex w-full min-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/45 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
                    {/* The sidebar and navbar remain separate components but share one visual shell */}
                    <div className="hidden lg:block">
                        <Sidebar />
                    </div>
                    <div className="flex-1 flex flex-col min-h-[calc(100vh-2rem)] overflow-hidden">
                        <Navbar userEmail={user?.email} userFullName={user?.user_metadata?.full_name} />
                        <main className="flex-1 p-8 pb-10 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    )
}
