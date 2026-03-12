'use client'

import { useState } from 'react'
import Navbar from '../Navbar'
import MobileSidebarWrapper from './MobileSidebarWrapper'

export default function DashboardHeader({ userEmail, userFullName }: { userEmail?: string, userFullName?: string }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <>
            <Navbar 
                userEmail={userEmail} 
                userFullName={userFullName} 
                onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
            />
            <MobileSidebarWrapper 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
            />
        </>
    )
}
