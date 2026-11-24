import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'

export const dynamic = 'force-dynamic'

/**
 * Proxy untuk file yang tersimpan di Vercel Blob store bertipe "Private".
 *
 * Store private tidak bisa diakses langsung lewat URL-nya (butuh autentikasi),
 * jadi halaman publik membaca gambar lewat route ini. SDK `get()` akan
 * mengautentikasi memakai OIDC / BLOB_READ_WRITE_TOKEN yang tersedia di
 * environment Vercel.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const { pathname } = await params
  const key = pathname.join('/')

  // Hanya izinkan file hasil upload admin, bukan seluruh isi store.
  if (!key.startsWith('uploads/')) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const result = await get(key, { access: 'private' })

    if (!result || result.statusCode !== 200) {
      return new NextResponse('Not found', { status: 404 })
    }

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Blob proxy error:', error)
    return new NextResponse('Not found', { status: 404 })
  }
}
