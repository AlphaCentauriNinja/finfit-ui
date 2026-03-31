'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Plus } from 'lucide-react'

type Props = {
    title?: string
    description: string
    icon?: LucideIcon
    actionText?: string
    onAction?: () => void
    variant?: 'simple' | 'card'
}

export default function EmptyStateAlert({ 
    title, 
    description, 
    icon: Icon = AlertTriangle, 
    actionText, 
    onAction, 
    variant = 'simple' 
}: Props) {
    if (variant === 'simple') {
        return (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-amber-300" />
                    </div>
                    <div className="flex-1">
                        {title && <p className="font-semibold text-white mb-0.5">{title}</p>}
                        <p className={title ? 'text-amber-200/80' : ''}>{description}</p>
                    </div>
                    {onAction && actionText && (
                        <button
                            onClick={onAction}
                            className="ml-auto text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4"
                        >
                            {actionText}
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 p-12 text-center text-amber-200 shadow-sm backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 mb-6">
                <Icon className="h-8 w-8 text-amber-400" />
            </div>
            {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
            <p className="mx-auto mt-3 max-w-md text-sm text-amber-200/70">
                {description}
            </p>
            {onAction && actionText && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    {actionText}
                </button>
            )}
        </div>
    )
}
