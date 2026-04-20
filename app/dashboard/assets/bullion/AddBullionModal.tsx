'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DatePickerField from '@/app/dashboard/components/DatePickerField'
import DeleteActionModal from '@/app/dashboard/components/DeleteActionModal'
import type {
    BullionCatalogProduct,
    BullionCatalogProductRow,
    BullionCurrencyCode,
    BullionCatalogVariant,
    BullionCatalogVariantRow,
    BullionMetal,
    BullionRow,
    BullionType,
} from './types'

type Props = {
    isOpen: boolean
    onClose: () => void
    onCreated?: (row: BullionRow) => void
    onUpdated?: (row: BullionRow) => void
    onDeleted?: (id: string) => void
    editHolding?: BullionRow | null
}

const DEFAULT_CURRENCY: BullionCurrencyCode = 'GBP'
const BULLION_IMAGES_BUCKET = 'bullion_images'
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])

const getTodayIsoDate = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const normalizeCurrency = (value: string | null | undefined): BullionCurrencyCode => {
    if (value === 'GBP' || value === 'EUR' || value === 'USD' || value === 'CHF' || value === 'CAD') {
        return value
    }

    return DEFAULT_CURRENCY
}

const buildBullionImagePublicUrl = (imagePath: string | null | undefined): string | null => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const normalizedPath = imagePath?.trim() ?? ''

    if (!supabaseUrl || !normalizedPath) return null

    const encodedPath = normalizedPath
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')

    return `${supabaseUrl}/storage/v1/object/public/${BULLION_IMAGES_BUCKET}/${encodedPath}`
}

const resolveImageExtension = (file: File): string => {
    const fromName = file.name.split('.').pop()?.trim().toLowerCase()
    if (fromName) return fromName

    if (file.type === 'image/png') return 'png'
    if (file.type === 'image/webp') return 'webp'
    if (file.type === 'image/heic') return 'heic'
    if (file.type === 'image/heif') return 'heif'
    return 'jpg'
}

const toNumber = (value: number | string | null | undefined): number | null => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null
    if (typeof value === 'string') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

const normalizeProduct = (row: BullionCatalogProductRow): BullionCatalogProduct | null => {
    const metal = row.metal === 'GOLD' || row.metal === 'SILVER' ? row.metal : null
    const type = row.type === 'COIN' || row.type === 'BAR' ? row.type : null
    const name = row.name?.trim() ?? ''

    if (!row.id || !metal || !type || !name) return null

    return {
        id: row.id,
        metal,
        type,
        name,
        country: row.country?.trim() || null,
        purity: toNumber(row.purity),
        fineMetalOz: toNumber(row.fine_metal_oz),
        fineMetalG: toNumber(row.fine_metal_g),
        grossWeightG: toNumber(row.gross_weight_g),
        liquidityTier: toNumber(row.liquidity_tier),
        sortOrder: toNumber(row.sort_order) ?? 0,
    }
}

const normalizeVariant = (row: BullionCatalogVariantRow): BullionCatalogVariant | null => {
    const name = row.name?.trim() ?? ''
    if (!row.id || !row.product_id || !name) return null

    return {
        id: row.id,
        productId: row.product_id,
        name,
        fineMetalOz: toNumber(row.fine_metal_oz),
        fineMetalG: toNumber(row.fine_metal_g),
        grossWeightG: toNumber(row.gross_weight_g),
        sortOrder: toNumber(row.sort_order) ?? 0,
    }
}

const buildDescription = (product: BullionCatalogProduct, variant: BullionCatalogVariant): string => {
    if (!variant.name) return product.name
    if (product.name.toLowerCase().includes(variant.name.toLowerCase())) return product.name
    return `${product.name} - ${variant.name}`
}

const formatPurity = (purity: number | null): string => {
    if (purity === null) return 'Not set'
    return purity.toFixed(4)
}

const formatWeightSummary = (product: BullionCatalogProduct | null, variant: BullionCatalogVariant | null): string => {
    const grams = variant?.fineMetalG ?? product?.fineMetalG ?? null
    const ounces = variant?.fineMetalOz ?? product?.fineMetalOz ?? null

    if (grams === null && ounces === null) return 'Not set'
    if (grams !== null && ounces !== null) return `${grams.toLocaleString('en-GB', { maximumFractionDigits: 4 })} g / ${ounces.toLocaleString('en-GB', { maximumFractionDigits: 4 })} oz`
    if (grams !== null) return `${grams.toLocaleString('en-GB', { maximumFractionDigits: 4 })} g`
    return `${ounces?.toLocaleString('en-GB', { maximumFractionDigits: 4 })} oz`
}

export default function AddBullionModal({ isOpen, onClose, onCreated, onUpdated, onDeleted, editHolding }: Props) {
    const [metal, setMetal] = useState<BullionMetal>('GOLD')
    const [type, setType] = useState<BullionType>('COIN')
    const [selectedProductId, setSelectedProductId] = useState('')
    const [selectedVariantId, setSelectedVariantId] = useState('')
    const [holdingTitle, setHoldingTitle] = useState('')
    const [amount, setAmount] = useState('')
    const [mintYear, setMintYear] = useState('')
    const [purchaseDate, setPurchaseDate] = useState(getTodayIsoDate())
    const [purchasePrice, setPurchasePrice] = useState('')
    const [marketPremiumPct, setMarketPremiumPct] = useState('0')
    const [notes, setNotes] = useState('')
    const [storedImagePath, setStoredImagePath] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
    const [isImageMarkedForRemoval, setIsImageMarkedForRemoval] = useState(false)
    const [taxRate, setTaxRate] = useState<number | null>(null)
    const [preferredCurrency, setPreferredCurrency] = useState<BullionCurrencyCode>(DEFAULT_CURRENCY)
    const [catalogProducts, setCatalogProducts] = useState<BullionCatalogProduct[]>([])
    const [catalogVariants, setCatalogVariants] = useState<BullionCatalogVariant[]>([])
    const [isCatalogLoading, setIsCatalogLoading] = useState(true)
    const [catalogError, setCatalogError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const router = useRouter()

    const parsedAmount = Number(amount)
    const parsedPurchasePrice = Number(purchasePrice)
    const parsedMarketPremiumPct = Number(marketPremiumPct)
    const priceInclTax = Number.isFinite(parsedPurchasePrice) && parsedPurchasePrice > 0 && taxRate !== null
        ? parsedPurchasePrice * (1 + taxRate / 100)
        : null
    const isSilver = metal === 'SILVER'
    const persistedImagePreviewUrl = useMemo(
        () => isImageMarkedForRemoval ? null : buildBullionImagePublicUrl(storedImagePath),
        [isImageMarkedForRemoval, storedImagePath]
    )
    const activeImagePreviewUrl = imagePreviewUrl ?? persistedImagePreviewUrl

    // Reset selection when metal or type changes (but respect edit initialization)
    useEffect(() => {
        if (editHolding && editHolding.metal === metal && editHolding.type === type && editHolding.catalogProductId) {
            return
        }
        setSelectedProductId('')
        setSelectedVariantId('')
    }, [metal, type, editHolding])

    // Reset tax rate when switching metals — only silver has tax
    useEffect(() => {
        if (metal === 'SILVER') {
            if (editHolding && editHolding.taxRatePct !== null && editHolding.taxRatePct !== undefined && editHolding.metal === 'SILVER') {
                setTaxRate(editHolding.taxRatePct)
            } else {
                setTaxRate(20) // Default to standard 20% VAT for new silver
            }
        } else {
            setTaxRate(null)
        }
    }, [metal, editHolding])

    // Initialize from editHolding if present
    useEffect(() => {
        if (isOpen && editHolding) {
            setMetal(editHolding.metal)
            setType(editHolding.type)
            setSelectedProductId(editHolding.catalogProductId || '')
            setSelectedVariantId(editHolding.catalogVariantId || '')
            setHoldingTitle(editHolding.title ?? '')
            setAmount(editHolding.amount.toString())
            setMintYear(editHolding.year || '')
            setPurchaseDate(editHolding.purchaseDate || getTodayIsoDate())
            setPurchasePrice(editHolding.purchaseValue?.toString() || '')
            setMarketPremiumPct(editHolding.marketPremiumPct.toString())
            setNotes(editHolding.notes ?? '')
            setStoredImagePath(editHolding.imagePath ?? null)
            setImageFile(null)
            setImagePreviewUrl(null)
            setIsImageMarkedForRemoval(false)
            if (editHolding.metal === 'SILVER' && editHolding.taxRatePct !== null && editHolding.taxRatePct !== undefined) {
                setTaxRate(editHolding.taxRatePct)
            }
            if (editHolding.purchaseCurrency) {
                 setPreferredCurrency(editHolding.purchaseCurrency)
            }
        }
    }, [isOpen, editHolding])

    useEffect(() => {
        if (!imageFile) {
            setImagePreviewUrl(null)
            return
        }

        const previewObjectUrl = URL.createObjectURL(imageFile)
        setImagePreviewUrl(previewObjectUrl)

        return () => {
            URL.revokeObjectURL(previewObjectUrl)
        }
    }, [imageFile])

    useEffect(() => {
        if (!isOpen) return

        let active = true

        const loadCatalog = async () => {
            setIsCatalogLoading(true)
            setCatalogError(null)

            const supabase = createClient()
            const [productsResult, variantsResult, userSettingsResult] = await Promise.all([
                supabase
                    .from('bullion_catalog_products')
                    .select('id, metal, type, name, country, purity, fine_metal_oz, fine_metal_g, gross_weight_g, liquidity_tier, sort_order')
                    .order('sort_order', { ascending: true })
                    .order('name', { ascending: true }),
                supabase
                    .from('bullion_catalog_variants')
                    .select('id, product_id, name, fine_metal_oz, fine_metal_g, gross_weight_g, sort_order')
                    .order('fine_metal_g', { ascending: true })
                    .order('name', { ascending: true }),
                supabase
                    .from('user_settings')
                    .select('preferred_currency')
                    .maybeSingle(),
            ])

            if (!active) return

            if (!active) return

            if (!editHolding?.purchaseCurrency) {
                setPreferredCurrency(normalizeCurrency(userSettingsResult.data?.preferred_currency))
            }

            if (productsResult.error || variantsResult.error) {
                setCatalogError(productsResult.error?.message || variantsResult.error?.message || 'Unable to load bullion catalog.')
                setCatalogProducts([])
                setCatalogVariants([])
                setIsCatalogLoading(false)
                return
            }

            const normalizedProducts = ((productsResult.data ?? []) as BullionCatalogProductRow[])
                .map(normalizeProduct)
                .filter((entry): entry is BullionCatalogProduct => Boolean(entry))
            const normalizedVariants = ((variantsResult.data ?? []) as BullionCatalogVariantRow[])
                .map(normalizeVariant)
                .filter((entry): entry is BullionCatalogVariant => Boolean(entry))

            setCatalogProducts(normalizedProducts)
            setCatalogVariants(normalizedVariants)
            setIsCatalogLoading(false)
        }

        void loadCatalog()

        return () => {
            active = false
        }
    }, [isOpen])

    const filteredProducts = useMemo(() => {
        return catalogProducts.filter((product) => product.metal === metal && product.type === type)
    }, [catalogProducts, metal, type])

    const filteredVariants = useMemo(() => {
        const effectiveProductId = filteredProducts.some((product) => product.id === selectedProductId)
            ? selectedProductId
            : filteredProducts[0]?.id ?? ''
        return catalogVariants.filter((variant) => variant.productId === effectiveProductId)
    }, [catalogVariants, filteredProducts, selectedProductId])

    const effectiveSelectedProductId = useMemo(() => {
        if (filteredProducts.some((product) => product.id === selectedProductId)) {
            return selectedProductId
        }

        return filteredProducts[0]?.id ?? ''
    }, [filteredProducts, selectedProductId])

    const effectiveSelectedVariantId = useMemo(() => {
        if (filteredVariants.some((variant) => variant.id === selectedVariantId)) {
            return selectedVariantId
        }

        if (editHolding?.catalogVariantId && filteredVariants.some((v) => v.id === editHolding.catalogVariantId)) {
             return editHolding.catalogVariantId
        }

        return filteredVariants[0]?.id ?? ''
    }, [filteredVariants, selectedVariantId, editHolding])

    const selectedProduct = useMemo(
        () => filteredProducts.find((product) => product.id === effectiveSelectedProductId) ?? null,
        [effectiveSelectedProductId, filteredProducts]
    )

    const selectedVariant = useMemo(
        () => filteredVariants.find((variant) => variant.id === effectiveSelectedVariantId) ?? null,
        [effectiveSelectedVariantId, filteredVariants]
    )

    const resetForm = () => {
        setMetal('GOLD')
        setType('COIN')
        setSelectedProductId('')
        setSelectedVariantId('')
        setHoldingTitle('')
        setAmount('')
        setMintYear('')
        setPurchaseDate(getTodayIsoDate())
        setPurchasePrice('')
        setMarketPremiumPct('0')
        setNotes('')
        setStoredImagePath(null)
        setImageFile(null)
        setImagePreviewUrl(null)
        setIsImageMarkedForRemoval(false)
        setTaxRate(null)
        setShowDeleteConfirm(false)
        setFormError(null)
    }

    const handleClose = () => {
        if (isSaving || isDeleting) return
        onClose()
    }

    const handleDeleteHolding = async () => {
        if (!editHolding?.id) return

        setFormError(null)
        setIsDeleting(true)
        const supabase = createClient()
        const { error } = await supabase.from('bullion_holdings').delete().match({ id: editHolding.id })

        if (error) {
            setFormError(error.message)
            setIsDeleting(false)
            return
        }

        if (editHolding.imagePath) {
            await supabase.storage.from(BULLION_IMAGES_BUCKET).remove([editHolding.imagePath])
        }

        setIsDeleting(false)
        setShowDeleteConfirm(false)
        if (onDeleted) onDeleted(editHolding.id)
        onClose()
        router.refresh()
    }

    const handleImageSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] ?? null
        event.target.value = ''

        if (!selectedFile) return

        if (!selectedFile.type.startsWith('image/')) {
            setFormError('Please select a valid image file.')
            return
        }

        if (selectedFile.type && !ALLOWED_IMAGE_MIME_TYPES.has(selectedFile.type)) {
            setFormError('Use JPG, PNG, WEBP, HEIC, or HEIF for bullion images.')
            return
        }

        if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
            setFormError('Image size must be 5MB or less.')
            return
        }

        setImageFile(selectedFile)
        setIsImageMarkedForRemoval(false)
        setFormError(null)
    }

    const handleRemoveImage = () => {
        if (!imageFile && !storedImagePath) return
        setImageFile(null)
        setIsImageMarkedForRemoval(Boolean(storedImagePath))
        setFormError(null)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setFormError(null)

        const cleanMintYear = mintYear.trim()
        const cleanHoldingTitle = holdingTitle.trim()
        const cleanNotes = notes.trim()

        if (!selectedProduct || !selectedVariant) {
            setFormError('Please choose a bullion item and size/variant.')
            return
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setFormError('Amount must be greater than 0.')
            return
        }

        if (!purchaseDate) {
            setFormError('Please select a purchase date.')
            return
        }

        if (!Number.isFinite(parsedPurchasePrice) || parsedPurchasePrice <= 0) {
            setFormError(`Price must be greater than 0 in ${preferredCurrency}.`)
            return
        }

        if (!Number.isFinite(parsedMarketPremiumPct)) {
            setFormError('Market premium must be a valid percentage.')
            return
        }

        const weightPerItemGrams = selectedVariant.grossWeightG
            ?? selectedVariant.fineMetalG
            ?? selectedProduct.grossWeightG
            ?? selectedProduct.fineMetalG
            ?? 0

        if (!Number.isFinite(weightPerItemGrams) || weightPerItemGrams <= 0) {
            setFormError('Selected bullion size is missing weight data.')
            return
        }

        setIsSaving(true)
        const supabase = createClient()
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setFormError('Session not found. Please sign in again.')
            setIsSaving(false)
            return
        }

        const description = buildDescription(selectedProduct, selectedVariant)
        const effectiveTaxRate = isSilver ? taxRate : null
        const computedTaxAmount = effectiveTaxRate !== null && effectiveTaxRate > 0
            ? Math.round(parsedPurchasePrice * (effectiveTaxRate / 100) * 100) / 100
            : effectiveTaxRate === 0 ? 0 : null
        const computedTotalInclTax = computedTaxAmount !== null
            ? Math.round((parsedPurchasePrice + computedTaxAmount) * 100) / 100
            : null
        const previousImagePath = storedImagePath
        let finalImagePath = isImageMarkedForRemoval ? null : storedImagePath
        let uploadedImagePath: string | null = null

        if (imageFile) {
            const imageExtension = resolveImageExtension(imageFile)
            const randomId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`
            const uploadPath = `${user.id}/${randomId}.${imageExtension}`
            const { error: uploadError } = await supabase
                .storage
                .from(BULLION_IMAGES_BUCKET)
                .upload(uploadPath, imageFile, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: imageFile.type || undefined,
                })

            if (uploadError) {
                setFormError(uploadError.message || 'Unable to upload the selected image.')
                setIsSaving(false)
                return
            }

            finalImagePath = uploadPath
            uploadedImagePath = uploadPath
        }

        const holdingPayload = {
            user_id: user.id,
            catalog_product_id: selectedProduct.id,
            catalog_variant_id: selectedVariant.id,
            metal,
            type,
            title: cleanHoldingTitle || null,
            description,
            amount: parsedAmount,
            weight_per_item_grams: weightPerItemGrams,
            manufacturer: null,
            country: selectedProduct.country,
            mint_year: cleanMintYear || null,
            purchase_date: purchaseDate,
            purchase_value: parsedPurchasePrice,
            purchase_currency: preferredCurrency,
            tax_rate_pct: effectiveTaxRate,
            tax_amount: computedTaxAmount,
            total_price_incl_tax: computedTotalInclTax,
            market_premium_pct: parsedMarketPremiumPct,
            notes: cleanNotes || null,
            image_path: finalImagePath,
        }

        let dbId = editHolding?.id

        if (editHolding?.id) {
            const { error } = await supabase
                .from('bullion_holdings')
                .update(holdingPayload)
                .match({ id: editHolding.id, user_id: user.id })

            if (error) {
                if (uploadedImagePath) {
                    await supabase.storage.from(BULLION_IMAGES_BUCKET).remove([uploadedImagePath])
                }
                setFormError(error.message || 'Unable to update bullion holding.')
                setIsSaving(false)
                return
            }
        } else {
            const { data, error } = await supabase
                .from('bullion_holdings')
                .insert(holdingPayload)
                .select('id')
                .single()

            if (error || !data?.id) {
                if (uploadedImagePath) {
                    await supabase.storage.from(BULLION_IMAGES_BUCKET).remove([uploadedImagePath])
                }
                setFormError(error?.message || 'Unable to save bullion holding.')
                setIsSaving(false)
                return
            }
            dbId = data.id
        }

        if (!dbId) {
            if (uploadedImagePath) {
                await supabase.storage.from(BULLION_IMAGES_BUCKET).remove([uploadedImagePath])
            }
            setFormError('Failed to confirm holding ID.')
            setIsSaving(false)
            return
        }

        if (previousImagePath && previousImagePath !== finalImagePath) {
            await supabase.storage.from(BULLION_IMAGES_BUCKET).remove([previousImagePath])
        }

        const submittedRow: BullionRow = {
            id: dbId,
            metal,
            title: cleanHoldingTitle || null,
            description,
            amount: parsedAmount,
            weightPerItemGrams: weightPerItemGrams,
            totalWeightGrams: parsedAmount * weightPerItemGrams,
            intrinsicPriceGbp: 0,
            marketPriceGbp: 0,
            marketTotalGbp: 0,
            intrinsicTotalGbp: 0,
            investedTotalGbp: 0,
            type,
            manufacturer: '',
            country: selectedProduct.country ?? '',
            year: cleanMintYear,
            linkLabel: null,
            catalogProductId: selectedProduct.id,
            catalogVariantId: selectedVariant.id,
            purchaseDate,
            purchaseValue: parsedPurchasePrice,
            purchaseCurrency: preferredCurrency,
            taxRatePct: effectiveTaxRate,
            taxAmount: computedTaxAmount,
            totalPriceInclTax: computedTotalInclTax,
            marketPremiumPct: parsedMarketPremiumPct,
            notes: cleanNotes || null,
            imagePath: finalImagePath,
        }

        if (editHolding?.id && onUpdated) {
             onUpdated(submittedRow)
        } else if (onCreated) {
             onCreated(submittedRow)
        }

        resetForm()
        setIsSaving(false)
        onClose()
        router.refresh()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">{editHolding ? 'Edit Bullion' : 'Add Bullion'}</h2>
                        <p className="mt-1 text-xs text-white/60">Select a bullion item and size from the seeded catalog. Pricing is calculated separately by the backend.</p>
                    </div>
                    <button onClick={handleClose} className="p-1 text-rose-300 transition-colors hover:text-rose-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Metal</label>
                            <select
                                value={metal}
                                onChange={(event) => setMetal(event.target.value as BullionMetal)}
                                disabled={isCatalogLoading || isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                <option value="GOLD">Gold</option>
                                <option value="SILVER">Silver</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Format</label>
                            <select
                                value={type}
                                onChange={(event) => setType(event.target.value as BullionType)}
                                disabled={isCatalogLoading || isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                <option value="COIN">Coin</option>
                                <option value="BAR">Bar</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Bullion Item</label>
                            <select
                                value={effectiveSelectedProductId}
                                onChange={(event) => setSelectedProductId(event.target.value)}
                                disabled={isCatalogLoading || isSaving || filteredProducts.length === 0}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                {filteredProducts.length === 0 ? <option value="">No items available</option> : null}
                                {filteredProducts.map((product) => (
                                    <option key={product.id} value={product.id}>{product.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Size / Variant</label>
                            <select
                                value={effectiveSelectedVariantId}
                                onChange={(event) => setSelectedVariantId(event.target.value)}
                                disabled={isCatalogLoading || isSaving || filteredVariants.length === 0}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                {filteredVariants.length === 0 ? <option value="">No variants available</option> : null}
                                {filteredVariants.map((variant) => (
                                    <option key={variant.id} value={variant.id}>{variant.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-white/80">Holding Title (Optional)</label>
                            <input
                                type="text"
                                value={holdingTitle}
                                onChange={(event) => setHoldingTitle(event.target.value)}
                                disabled={isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="e.g. Emergency stack, Gift set, Vault allocation"
                            />
                            <p className="text-xs text-white/45">
                                This is your custom entry title and does not replace the catalog description.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Amount</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="any"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                disabled={isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Mint Year (Optional)</label>
                            <input
                                type="text"
                                value={mintYear}
                                onChange={(event) => setMintYear(event.target.value)}
                                disabled={isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="2025"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <DatePickerField
                            label="Purchase Date"
                            value={purchaseDate}
                            onChange={setPurchaseDate}
                            disabled={isSaving}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">{`Price per item (${preferredCurrency})`}</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={purchasePrice}
                                onChange={(event) => setPurchasePrice(event.target.value)}
                                disabled={isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Market Premium %</label>
                            <input
                                type="number"
                                step="0.01"
                                value={marketPremiumPct}
                                onChange={(event) => setMarketPremiumPct(event.target.value)}
                                disabled={isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="0.00"
                            />
                            <p className="text-xs text-white/45">
                                Enter a positive or negative premium over intrinsic spot value.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Notes (Optional)</label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                disabled={isSaving}
                                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="Add notes about this holding..."
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Holding Image (Optional)</label>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
                                onChange={handleImageSelected}
                                disabled={isSaving}
                                className="block w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-200 hover:file:bg-indigo-500/30"
                            />
                            <p className="text-xs text-white/45">Supported formats: JPG, PNG, WEBP, HEIC, HEIF (max 5MB).</p>
                        </div>

                        <div className="mt-3 space-y-2">
                            {activeImagePreviewUrl ? (
                                <>
                                    <img
                                        src={activeImagePreviewUrl}
                                        alt="Bullion holding preview"
                                        className="h-44 w-full rounded-xl border border-white/10 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        disabled={isSaving}
                                        className="rounded-lg border border-rose-500/35 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/10 disabled:opacity-60"
                                    >
                                        Remove image
                                    </button>
                                </>
                            ) : (
                                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-900/40 text-xs text-white/45">
                                    No image selected.
                                </div>
                            )}
                            {isImageMarkedForRemoval && !activeImagePreviewUrl ? (
                                <p className="text-xs text-amber-300/80">Image will be removed when you save.</p>
                            ) : null}
                        </div>
                    </div>

                    {isSilver ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">VAT Rate</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTaxRate(0)}
                                        disabled={isSaving}
                                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                                            taxRate === 0
                                                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/10'
                                                : 'border-white/10 bg-slate-900 text-white/60 hover:bg-white/5 hover:text-white/80'
                                        }`}
                                    >
                                        0% (VAT Free)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTaxRate(20)}
                                        disabled={isSaving}
                                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                                            taxRate === 20
                                                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/10'
                                                : 'border-white/10 bg-slate-900 text-white/60 hover:bg-white/5 hover:text-white/80'
                                        }`}
                                    >
                                        20% (Standard VAT)
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Price incl. VAT</label>
                                <div className="flex h-12 items-center rounded-xl border border-white/10 bg-slate-900/50 px-4 text-sm">
                                    {priceInclTax !== null ? (
                                        <span className="font-medium text-white/85">
                                            {priceInclTax.toLocaleString('en-GB', { style: 'currency', currency: preferredCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    ) : (
                                        <span className="text-white/40">Enter price above</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Selected Reference</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-4 text-sm">
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-xs text-white/45">Country</p>
                                <p className="mt-1 font-medium text-white/85">{selectedProduct?.country ?? 'Not set'}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-xs text-white/45">Purity</p>
                                <p className="mt-1 font-medium text-white/85">{formatPurity(selectedProduct?.purity ?? null)}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-xs text-white/45">Fine Weight</p>
                                <p className="mt-1 font-medium text-white/85">{formatWeightSummary(selectedProduct, selectedVariant)}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-xs text-white/45">Liquidity Tier</p>
                                <p className="mt-1 font-medium text-white/85">{selectedProduct?.liquidityTier ?? 'Not set'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
                        The selected catalog item IDs are stored on the holding as references, while display fields are snapshotted for the current UI. Purchase price is recorded in your current settings currency: {preferredCurrency}.
                    </div>

                    {catalogError ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {catalogError}
                        </div>
                    ) : null}

                    {formError ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {formError}
                        </div>
                    ) : null}

                    <div className="flex gap-3 pt-2 items-center">
                        {editHolding ? (
                            <button
                                type="button"
                                disabled={isSaving || isDeleting}
                                onClick={() => setShowDeleteConfirm(true)}
                                className="rounded-xl border border-rose-500/35 px-4 py-3 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/10 disabled:opacity-60"
                            >
                                Delete
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSaving || isDeleting}
                            className="flex-1 rounded-xl border border-rose-500/35 text-rose-300 px-4 py-3 text-sm font-semibold hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isDeleting || isCatalogLoading || filteredProducts.length === 0 || filteredVariants.length === 0}
                            className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-purple-400 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {isSaving ? 'Saving...' : isCatalogLoading ? 'Loading...' : editHolding ? 'Save Changes' : 'Add Bullion'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>

            <DeleteActionModal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    if (isDeleting) return
                    setShowDeleteConfirm(false)
                }}
                onConfirm={() => {
                    void handleDeleteHolding()
                }}
                title="Delete Bullion Holding?"
                message={`Are you sure you want to permanently delete "${editHolding?.title?.trim() || editHolding?.description || 'this holding'}"? This action cannot be undone.`}
                confirmText="Delete Permanently"
                isProcessing={isDeleting}
            />
        </div>
    )
}
