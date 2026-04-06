import React from 'react'
import { describe, expect, it } from 'vitest'

import AddBullionButton from '@/app/dashboard/assets/bullion/AddBullionButton'
import AddBullionModal from '@/app/dashboard/assets/bullion/AddBullionModal'
import CryptoAssetCard from '@/app/dashboard/assets/crypto/CryptoAssetCard'
import CryptoEditModal from '@/app/dashboard/assets/crypto/CryptoEditModal'
import CryptoHistoryModal from '@/app/dashboard/assets/crypto/CryptoHistoryModal'
import CryptoTransactionModal from '@/app/dashboard/assets/crypto/CryptoTransactionModal'
import { ImportLedgerModal } from '@/app/dashboard/assets/crypto/ImportLedgerModal'
import AccountHistoryModal from '@/app/dashboard/assets/investments/AccountHistoryModal'
import AccountTransactionModal from '@/app/dashboard/assets/investments/AccountTransactionModal'
import AddInvestmentAccountModal from '@/app/dashboard/assets/investments/AddInvestmentAccountModal'
import AddInvestmentHoldingModal from '@/app/dashboard/assets/investments/AddInvestmentHoldingModal'
import EditInvestmentAccountModal from '@/app/dashboard/assets/investments/EditAccountModal'
import InvestmentAccountCard from '@/app/dashboard/assets/investments/InvestmentAccountCard'
import InvestmentAssetCard from '@/app/dashboard/assets/investments/InvestmentAssetCard'
import InvestmentEditModal from '@/app/dashboard/assets/investments/InvestmentEditModal'
import InvestmentHistoryModal from '@/app/dashboard/assets/investments/InvestmentHistoryModal'
import InvestmentTransactionModal from '@/app/dashboard/assets/investments/InvestmentTransactionModal'
import AddPensionButton from '@/app/dashboard/assets/pension/AddPensionButton'
import PensionAccountCard from '@/app/dashboard/assets/pension/PensionAccountCard'
import PensionContributionModal from '@/app/dashboard/assets/pension/PensionContributionModal'
import PensionEditModal from '@/app/dashboard/assets/pension/PensionEditModal'
import PensionHistoryModal from '@/app/dashboard/assets/pension/PensionHistoryModal'
import PensionModal from '@/app/dashboard/assets/pension/PensionModal'
import PensionOperationModal from '@/app/dashboard/assets/pension/PensionOperationModal'
import PensionPageContent from '@/app/dashboard/assets/pension/PensionPageContent'
import PensionPerformanceChart from '@/app/dashboard/assets/pension/PensionPerformanceChart'
import PensionValueModal from '@/app/dashboard/assets/pension/PensionValueModal'
import EditPropertyModal from '@/app/dashboard/assets/real-estate/EditPropertyModal'
import PropertyHistoryModal from '@/app/dashboard/assets/real-estate/PropertyHistoryModal'
import PropertyTransactionModal from '@/app/dashboard/assets/real-estate/PropertyTransactionModal'
import RealEstatePropertyCard from '@/app/dashboard/assets/real-estate/RealEstatePropertyCard'
import AddSavingsAccountModal from '@/app/dashboard/assets/savings/AddAccountModal'
import EditSavingsAccountModal from '@/app/dashboard/assets/savings/EditAccountModal'
import PotOperationModal from '@/app/dashboard/assets/savings/PotOperationModal'
import SavingsAccountAccordion from '@/app/dashboard/assets/savings/SavingsAccountAccordion'
import SavingsAccountCard from '@/app/dashboard/assets/savings/SavingsAccountCard'
import SavingsCharts from '@/app/dashboard/assets/savings/SavingsCharts'
import SavingsHistoryModal from '@/app/dashboard/assets/savings/SavingsHistoryModal'
import SavingsPotsModal from '@/app/dashboard/assets/savings/SavingsPotsModal'
import SavingsTransactionModal from '@/app/dashboard/assets/savings/SavingsTransactionModal'

import {
  currentYear,
  formatCurrency,
  formatSignedCurrency,
  noop,
  renderWithProviders,
  sampleCryptoAsset,
  sampleInvestmentAccount,
  sampleInvestmentHolding,
  samplePension,
  sampleProperty,
  sampleSavingsAccount,
} from './render-helpers'

const smokeCases: Array<{ name: string; renderCase: () => void }> = [
  { name: 'AddBullionButton', renderCase: () => { renderWithProviders(<AddBullionButton onCreated={noop} />) } },
  {
    name: 'AddBullionModal (closed)',
    renderCase: () => {
      renderWithProviders(
        <AddBullionModal isOpen={false} onClose={noop} onCreated={noop} onUpdated={noop} onDeleted={noop} editHolding={null} />
      )
    },
  },
  { name: 'CryptoAssetCard', renderCase: () => { renderWithProviders(<CryptoAssetCard asset={sampleCryptoAsset} totalCurrentValue={50000} preferredCurrency="GBP" hideValues={false} />) } },
  { name: 'CryptoEditModal (closed)', renderCase: () => { renderWithProviders(<CryptoEditModal isOpen={false} onClose={noop} asset={sampleCryptoAsset} />) } },
  {
    name: 'CryptoHistoryModal (closed)',
    renderCase: () => {
      renderWithProviders(
        <CryptoHistoryModal isOpen={false} onClose={noop} asset={sampleCryptoAsset} preferredCurrency="GBP" hideValues={false} />
      )
    },
  },
  { name: 'CryptoTransactionModal (closed)', renderCase: () => { renderWithProviders(<CryptoTransactionModal isOpen={false} onClose={noop} asset={sampleCryptoAsset} />) } },
  { name: 'ImportLedgerModal (closed)', renderCase: () => { renderWithProviders(<ImportLedgerModal isOpen={false} onClose={noop} />) } },
  {
    name: 'AccountHistoryModal (closed)',
    renderCase: () => {
      renderWithProviders(
        <AccountHistoryModal
          isOpen={false}
          onClose={noop}
          account={sampleInvestmentAccount}
          preferredCurrency="GBP"
          formatCurrency={formatCurrency}
          onChanged={noop}
        />
      )
    },
  },
  { name: 'AccountTransactionModal (closed)', renderCase: () => { renderWithProviders(<AccountTransactionModal isOpen={false} onClose={noop} account={sampleInvestmentAccount} onSaved={noop} />) } },
  { name: 'AddInvestmentAccountModal (closed)', renderCase: () => { renderWithProviders(<AddInvestmentAccountModal isOpen={false} onClose={noop} onCreated={noop} />) } },
  {
    name: 'AddInvestmentHoldingModal (closed)',
    renderCase: () => {
      renderWithProviders(
        <AddInvestmentHoldingModal
          isOpen={false}
          onClose={noop}
          accounts={[sampleInvestmentAccount]}
          selectedAccountId={sampleInvestmentAccount.id}
          onCreated={noop}
        />
      )
    },
  },
  { name: 'EditInvestmentAccountModal (closed)', renderCase: () => { renderWithProviders(<EditInvestmentAccountModal isOpen={false} onClose={noop} account={sampleInvestmentAccount} onUpdated={noop} onDeleted={noop} />) } },
  {
    name: 'InvestmentAccountCard',
    renderCase: () => {
      renderWithProviders(
        <InvestmentAccountCard
          account={sampleInvestmentAccount}
          totalPortfolioValue={2000}
          preferredCurrency="GBP"
          formatCurrency={formatCurrency}
          onEdit={noop}
          onTransaction={noop}
          onHistory={noop}
          onAddHolding={noop}
          onEditHolding={noop}
        />
      )
    },
  },
  {
    name: 'InvestmentAssetCard',
    renderCase: () => {
      renderWithProviders(
        <InvestmentAssetCard
          holding={sampleInvestmentHolding}
          accountName="Main ISA"
          totalPortfolioValue={2000}
          preferredCurrency="GBP"
          hideValues={false}
          formatCurrency={formatCurrency}
          formatSignedCurrency={formatSignedCurrency}
          onEdit={noop}
          onTransaction={noop}
          onHistory={noop}
        />
      )
    },
  },
  { name: 'InvestmentEditModal (closed)', renderCase: () => { renderWithProviders(<InvestmentEditModal isOpen={false} onClose={noop} holding={sampleInvestmentHolding} onUpdated={noop} onDeleted={noop} />) } },
  {
    name: 'InvestmentHistoryModal (closed)',
    renderCase: () => {
      renderWithProviders(
        <InvestmentHistoryModal
          isOpen={false}
          onClose={noop}
          holding={sampleInvestmentHolding}
          preferredCurrency="GBP"
          formatCurrency={formatCurrency}
        />
      )
    },
  },
  { name: 'InvestmentTransactionModal (closed)', renderCase: () => { renderWithProviders(<InvestmentTransactionModal isOpen={false} onClose={noop} holding={sampleInvestmentHolding} onSaved={noop} />) } },
  { name: 'AddPensionButton', renderCase: () => { renderWithProviders(<AddPensionButton />) } },
  { name: 'PensionAccountCard', renderCase: () => { renderWithProviders(<PensionAccountCard pension={samplePension} total={10000} />) } },
  { name: 'PensionContributionModal (closed)', renderCase: () => { renderWithProviders(<PensionContributionModal isOpen={false} onClose={noop} pensionId="pn1" pensionName="PensionBee" />) } },
  { name: 'PensionEditModal (closed)', renderCase: () => { renderWithProviders(<PensionEditModal isOpen={false} onClose={noop} pensionId="pn1" initialName="PensionBee" />) } },
  { name: 'PensionHistoryModal (closed)', renderCase: () => { renderWithProviders(<PensionHistoryModal isOpen={false} onClose={noop} pensionId="pn1" pensionName="PensionBee" />) } },
  { name: 'PensionModal (closed)', renderCase: () => { renderWithProviders(<PensionModal isOpen={false} onClose={noop} />) } },
  { name: 'PensionOperationModal (closed)', renderCase: () => { renderWithProviders(<PensionOperationModal isOpen={false} title="loading" message="msg" />) } },
  { name: 'PensionPageContent', renderCase: () => { renderWithProviders(<PensionPageContent />) } },
  {
    name: 'PensionPerformanceChart',
    renderCase: () => {
      renderWithProviders(
        <PensionPerformanceChart
          data={[
            { month: `${currentYear}-01`, label: 'Jan', current: 1000, comparison: 900, contributions: 900 },
            { month: `${currentYear}-02`, label: 'Feb', current: 1200, comparison: 1000, contributions: 1000 },
          ]}
        />
      )
    },
  },
  { name: 'PensionValueModal (closed)', renderCase: () => { renderWithProviders(<PensionValueModal isOpen={false} onClose={noop} pensionId="pn1" pensionName="PensionBee" />) } },
  { name: 'EditPropertyModal (closed)', renderCase: () => { renderWithProviders(<EditPropertyModal isOpen={false} onClose={noop} property={sampleProperty} onUpdated={noop} onDeleted={noop} />) } },
  { name: 'PropertyHistoryModal (closed)', renderCase: () => { renderWithProviders(<PropertyHistoryModal isOpen={false} onClose={noop} property={{ id: sampleProperty.id, name: sampleProperty.name }} onDeleted={noop} />) } },
  { name: 'PropertyTransactionModal (closed)', renderCase: () => { renderWithProviders(<PropertyTransactionModal isOpen={false} onClose={noop} property={{ id: sampleProperty.id, name: sampleProperty.name, current_value: sampleProperty.current_value, mortgage_balance: sampleProperty.mortgage_balance }} onSaved={noop} />) } },
  { name: 'RealEstatePropertyCard', renderCase: () => { renderWithProviders(<RealEstatePropertyCard property={sampleProperty} totalPortfolioValue={500000} onRefresh={noop} />) } },
  { name: 'AddSavingsAccountModal (closed)', renderCase: () => { renderWithProviders(<AddSavingsAccountModal isOpen={false} onClose={noop} />) } },
  { name: 'EditSavingsAccountModal (closed)', renderCase: () => { renderWithProviders(<EditSavingsAccountModal isOpen={false} onClose={noop} accountId="sa1" initialName="Savings" />) } },
  { name: 'PotOperationModal (closed)', renderCase: () => { renderWithProviders(<PotOperationModal isOpen={false} onClose={noop} accountId="sa1" />) } },
  { name: 'SavingsAccountAccordion', renderCase: () => { renderWithProviders(<SavingsAccountAccordion accounts={[sampleSavingsAccount]} />) } },
  { name: 'SavingsAccountCard', renderCase: () => { renderWithProviders(<SavingsAccountCard account={sampleSavingsAccount} totalSavingsValue={5000} />) } },
  {
    name: 'SavingsCharts',
    renderCase: () => {
      renderWithProviders(
        <SavingsCharts
          pots={[
            { name: 'Emergency', value: 1200 },
            { name: 'Holiday', value: 400 },
          ]}
          chartData={[
            { month: `${currentYear}-01-01`, label: 'Jan', current: 1000 },
            { month: `${currentYear}-02-01`, label: 'Feb', current: 1600 },
          ]}
        />
      )
    },
  },
  { name: 'SavingsHistoryModal (closed)', renderCase: () => { renderWithProviders(<SavingsHistoryModal isOpen={false} onClose={noop} account={sampleSavingsAccount} />) } },
  { name: 'SavingsPotsModal (closed)', renderCase: () => { renderWithProviders(<SavingsPotsModal isOpen={false} onClose={noop} account={sampleSavingsAccount} />) } },
  { name: 'SavingsTransactionModal (closed)', renderCase: () => { renderWithProviders(<SavingsTransactionModal isOpen={false} onClose={noop} account={sampleSavingsAccount} />) } },
]

describe('Asset component smoke coverage', () => {
  for (const testCase of smokeCases) {
    it(`renders ${testCase.name}`, () => {
      expect(() => testCase.renderCase()).not.toThrow()
    })
  }
})
