/**
 * Shared Supabase Storage utilities.
 *
 * Consolidates buildBullionImagePublicUrl from bullion/page.tsx,
 * AddBullionModal.tsx, and bullion/[metal]/[type]/[id]/page.tsx.
 */

const BULLION_IMAGES_BUCKET = 'bullion_images'

/**
 * Construct the public URL for a bullion holding image stored in Supabase Storage.
 *
 * @param imagePath - The storage path relative to the bucket root (e.g. "userId/image.png")
 * @returns The full public URL, or null if the path is empty or SUPABASE_URL is missing.
 */
export function buildBullionImagePublicUrl(imagePath: string | null | undefined): string | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const normalizedPath = imagePath?.trim() ?? ''

    if (!supabaseUrl || !normalizedPath) return null

    const encodedPath = normalizedPath
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')

    return `${supabaseUrl}/storage/v1/object/public/${BULLION_IMAGES_BUCKET}/${encodedPath}`
}

/**
 * Resolve the file extension from a File object, falling back to MIME type.
 */
export function resolveImageExtension(file: File): string {
    const fromName = file.name.split('.').pop()?.trim().toLowerCase()
    if (fromName) return fromName

    if (file.type === 'image/png') return 'png'
    if (file.type === 'image/webp') return 'webp'
    if (file.type === 'image/heic') return 'heic'
    if (file.type === 'image/heif') return 'heif'
    return 'jpg'
}
