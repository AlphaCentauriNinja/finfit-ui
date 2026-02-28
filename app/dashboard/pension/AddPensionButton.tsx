'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import PensionModal from './PensionModal'

export default function AddPensionButton() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium shadow-sm shadow-indigo-500/20"
            >
                <Plus className="w-4 h-4" />
                <span>Add Pension</span>
            </button>

            <PensionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
