export type BullionMetal = 'GOLD' | 'SILVER'

export type BullionType = 'COIN' | 'BAR'

export type BullionCurrencyCode = 'GBP' | 'EUR' | 'USD' | 'CHF' | 'CAD'

export type BullionRow = {
    id: string
    metal: BullionMetal
    description: string
    amount: number
    weightPerItemGrams: number
    totalWeightGrams: number
    intrinsicPriceGbp: number
    marketPriceGbp: number
    marketTotalGbp: number
    intrinsicTotalGbp: number
    type: BullionType
    manufacturer: string
    country: string
    year: string
    linkLabel: string | null
    catalogProductId?: string | null
    catalogVariantId?: string | null
    purchaseDate?: string | null
    purchaseValue?: number | null
    purchaseCurrency?: BullionCurrencyCode | null
}

export type BullionHoldingDbRow = {
    id: string
    metal: BullionMetal | string
    description: string | null
    amount: number | string | null
    weight_per_item_grams: number | string | null
    type: BullionType | string
    manufacturer: string | null
    country: string | null
    mint_year: string | null
    link_label: string | null
    catalog_product_id: string | null
    catalog_variant_id: string | null
    purchase_date: string | null
    purchase_value: number | string | null
    purchase_currency: BullionCurrencyCode | string | null
}

export type BullionCatalogProduct = {
    id: string
    metal: BullionMetal
    type: BullionType
    name: string
    country: string | null
    purity: number | null
    fineMetalOz: number | null
    fineMetalG: number | null
    grossWeightG: number | null
    liquidityTier: number | null
    sortOrder: number
}

export type BullionCatalogVariant = {
    id: string
    productId: string
    name: string
    fineMetalOz: number | null
    fineMetalG: number | null
    grossWeightG: number | null
    sortOrder: number
}

export type BullionCatalogProductRow = {
    id: string
    metal: BullionMetal | string
    type: BullionType | string
    name: string | null
    country: string | null
    purity: number | string | null
    fine_metal_oz: number | string | null
    fine_metal_g: number | string | null
    gross_weight_g: number | string | null
    liquidity_tier: number | string | null
    sort_order: number | string | null
}

export type BullionCatalogVariantRow = {
    id: string
    product_id: string
    name: string | null
    fine_metal_oz: number | string | null
    fine_metal_g: number | string | null
    gross_weight_g: number | string | null
    sort_order: number | string | null
}
