import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
    return (
        <div
            className={`bg-surface rounded-2xl border border-border-subtle shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}
