import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { Wallet } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import CtaSection from '@/app/components/CtaSection'
import FaqSection from '@/app/components/FaqSection'
import FeaturesSection from '@/app/components/FeaturesSection'
import HeroSection from '@/app/components/HeroSection'
import LoginModal from '@/app/components/LoginModal'
import PricingSection from '@/app/components/PricingSection'
import SocialProofSection from '@/app/components/SocialProofSection'
import AssetCard from '@/app/dashboard/components/AssetCard'
import AssetOnboardingHero from '@/app/dashboard/components/AssetOnboardingHero'
import AutoLogoutHandler from '@/app/dashboard/components/Auth/AutoLogoutHandler'
import {
  DebtWidget,
  FinFitScoreWidget,
  GoalTracker,
  PortfolioGraph,
  SpendingBreakdown,
} from '@/app/dashboard/components/DashboardWidgets'
import DatePickerField from '@/app/dashboard/components/DatePickerField'
import DeleteActionModal from '@/app/dashboard/components/DeleteActionModal'
import EmptyStateAlert from '@/app/dashboard/components/EmptyStateAlert'
import MobileNav from '@/app/dashboard/components/mobile/MobileNav'
import { MobileSidebarProvider } from '@/app/dashboard/components/mobile/MobileSidebarProvider'
import Navbar from '@/app/dashboard/components/Navbar'
import Sidebar from '@/app/dashboard/components/Sidebar'
import StatCard from '@/app/dashboard/components/StatCard'
import {
  DashboardDataProvider as AppDashboardDataProvider,
  useDashboardData as useAppDashboardData,
  useDashboardDataActions,
} from '@/app/dashboard/components/providers/DashboardDataProvider'
import {
  PrivacyProvider,
  usePrivacy,
} from '@/app/dashboard/components/providers/PrivacyProvider'
import LogoutButton from '@/app/dashboard/logout-button'
import SettingsClient from '@/app/dashboard/user/settings/SettingsClient'
import {
  DashboardDataProvider as SharedDashboardDataProvider,
  useDashboardData as useSharedDashboardData,
} from '@/components/providers/DashboardDataProvider'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import {
  currentYear,
  noop,
  providerSnapshot,
  renderWithProviders,
  sampleSettingsProps,
} from './render-helpers'

const smokeCases: Array<{ name: string; renderCase: () => void }> = [
  { name: 'HeroSection', renderCase: () => { renderWithProviders(<HeroSection onOpenLogin={noop} />) } },
  { name: 'PricingSection', renderCase: () => { renderWithProviders(<PricingSection onOpenLogin={noop} />) } },
  { name: 'CtaSection', renderCase: () => { renderWithProviders(<CtaSection onOpenLogin={noop} />) } },
  { name: 'FeaturesSection', renderCase: () => { renderWithProviders(<FeaturesSection />) } },
  { name: 'FaqSection', renderCase: () => { renderWithProviders(<FaqSection />) } },
  { name: 'SocialProofSection', renderCase: () => { renderWithProviders(<SocialProofSection />) } },
  { name: 'LoginModal (closed)', renderCase: () => { renderWithProviders(<LoginModal isOpen={false} onClose={noop} />) } },
  { name: 'AssetCard', renderCase: () => { renderWithProviders(<AssetCard name="Savings" value={5000} allocation={20} icon={Wallet} hideValues={false} />) } },
  {
    name: 'AssetOnboardingHero',
    renderCase: () => {
      renderWithProviders(
        <AssetOnboardingHero
          title="Add Assets"
          description="Describe asset onboarding"
          items={[{ icon: Wallet, title: 'Savings', description: 'Track savings', colorClass: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' }]}
          actionText="Add"
          onAction={noop}
        />
      )
    },
  },
  { name: 'AutoLogoutHandler', renderCase: () => { renderWithProviders(<AutoLogoutHandler />) } },
  { name: 'PortfolioGraph', renderCase: () => { renderWithProviders(<PortfolioGraph totalAssets={10000} ytdPnl={500} ytdPercentage={5} />) } },
  { name: 'FinFitScoreWidget', renderCase: () => { renderWithProviders(<FinFitScoreWidget />) } },
  { name: 'SpendingBreakdown', renderCase: () => { renderWithProviders(<SpendingBreakdown />) } },
  { name: 'DebtWidget', renderCase: () => { renderWithProviders(<DebtWidget />) } },
  { name: 'GoalTracker', renderCase: () => { renderWithProviders(<GoalTracker />) } },
  { name: 'DatePickerField', renderCase: () => { renderWithProviders(<DatePickerField label="Date" value={`${currentYear}-01-01`} onChange={noop} />) } },
  { name: 'DeleteActionModal (closed)', renderCase: () => { renderWithProviders(<DeleteActionModal isOpen={false} onClose={noop} onConfirm={noop} />) } },
  { name: 'EmptyStateAlert', renderCase: () => { renderWithProviders(<EmptyStateAlert description="No data" />) } },
  { name: 'Navbar', renderCase: () => { renderWithProviders(<Navbar userEmail="test@example.com" userFullName="Test User" />) } },
  { name: 'Sidebar', renderCase: () => { renderWithProviders(<Sidebar />) } },
  { name: 'StatCard', renderCase: () => { renderWithProviders(<StatCard title="Total" value="£1,000" change="+2%" icon={Wallet} />) } },
  { name: 'MobileNav', renderCase: () => { renderWithProviders(<MobileNav />) } },
  { name: 'MobileSidebarProvider', renderCase: () => { renderWithProviders(<MobileSidebarProvider><div>Mobile sidebar child</div></MobileSidebarProvider>) } },
  { name: 'LogoutButton', renderCase: () => { renderWithProviders(<LogoutButton />) } },
  { name: 'SettingsClient', renderCase: () => { renderWithProviders(<SettingsClient {...sampleSettingsProps} />) } },
  { name: 'UI Button', renderCase: () => { render(<Button>Click</Button>) } },
  { name: 'UI Calendar', renderCase: () => { render(<Calendar mode="single" selected={new Date(`${currentYear}-01-01`)} onSelect={noop} />) } },
  {
    name: 'UI Popover',
    renderCase: () => {
      render(
        <Popover open>
          <PopoverTrigger asChild>
            <button type="button">Open</button>
          </PopoverTrigger>
          <PopoverContent>Popover Content</PopoverContent>
        </Popover>
      )
    },
  },
]

describe('Main component smoke coverage', () => {
  for (const testCase of smokeCases) {
    it(`renders ${testCase.name}`, () => {
      expect(() => testCase.renderCase()).not.toThrow()
    })
  }

  it('app dashboard data provider exposes and updates data', () => {
    function Probe() {
      const data = useAppDashboardData()
      const { updateInvestmentsValue } = useDashboardDataActions()

      return (
        <button type="button" onClick={() => updateInvestmentsValue(9999)} data-testid="app-provider-total">
          {data.portfolio.totalAssets.toFixed(2)}
        </button>
      )
    }

    render(
      <AppDashboardDataProvider initialData={providerSnapshot}>
        <Probe />
      </AppDashboardDataProvider>
    )

    const trigger = screen.getByTestId('app-provider-total')
    const before = trigger.textContent
    fireEvent.click(trigger)
    expect(trigger.textContent).not.toEqual(before)
  })

  it('shared dashboard provider re-export works', () => {
    function SharedProbe() {
      const data = useSharedDashboardData()
      return <div data-testid="shared-provider-total">{data.portfolio.totalAssets.toFixed(2)}</div>
    }

    render(
      <SharedDashboardDataProvider initialData={providerSnapshot}>
        <SharedProbe />
      </SharedDashboardDataProvider>
    )

    expect(screen.getByTestId('shared-provider-total')).toBeInTheDocument()
  })

  it('privacy provider toggles hide-values state', () => {
    function PrivacyProbe() {
      const { hideValues, toggleHideValues } = usePrivacy()
      return (
        <button type="button" onClick={toggleHideValues} data-testid="privacy-toggle">
          {hideValues ? 'hidden' : 'visible'}
        </button>
      )
    }

    render(
      <PrivacyProvider>
        <PrivacyProbe />
      </PrivacyProvider>
    )

    const button = screen.getByTestId('privacy-toggle')
    expect(button).toHaveTextContent('visible')
    fireEvent.click(button)
    expect(button).toHaveTextContent('hidden')
  })
})
