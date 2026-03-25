'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AddBullionModal from './AddBullionModal'
import type { BullionRow } from './types'

type Props = {
    onCreated: (row: BullionRow) => void
}

export default function AddBullionButton({ onCreated }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 transition-colors hover:bg-indigo-600"
            >
                <Plus className="h-4 w-4" />
                <span>Add Bullion</span>
            </button>

            {isModalOpen ? (
                <AddBullionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCreated={onCreated}
                />
            ) : null}
        </>
    )
}
