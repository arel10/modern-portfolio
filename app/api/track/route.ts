import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth'
import {
  hashIp,
  isBot,
  safeDecode,
  trackPageView,
} from '@/lib/analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Endpoint publik untuk mencatat page view.
 * - Tidak mencatat kunjungan admin (cookie admin valid).
 * - Tidak menyimpan IP mentah; hanya hash untuk fallback identitas.
 */
export async function POST(req: NextRequest) {
  try {
    // Jangan hitung kunjungan pemilik website saat sedang login admin.
    const adminToken = req.cookies.get(ADMIN_COOKIE)?.value
    if (adminToken) {
      const admin = await verifyAdminToken(adminToken)
      if (admin) return new NextResponse(null, { status: 204 })
    }

    const body = (await req.json()) as {
      visitorId?: unknown
      path?: unknown
      referrer?: unknown
    }

    const path = typeof body.path === 'string' ? body.path : '/'
    if (
      !path.startsWith('/') ||
      path.startsWith('/admin') ||
      path.startsWith('/api') ||
      path.startsWith('/_next')
    ) {
      return new NextResponse(null, { status: 204 })
    }

    const userAgent = req.headers.get('user-agent') ?? ''
    if (!userAgent || isBot(userAgent)) {
      return new NextResponse(null, { status: 204 })
    }

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip =
      forwardedFor?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      ''

    const rawVisitorId =
      typeof body.visitorId === 'string' ? body.visitorId.trim() : ''
    const visitorId = /^[a-zA-Z0-9_-]{8,64}$/.test(rawVisitorId)
      ? rawVisitorId
      : `anon-${hashIp(`${ip}:${userAgent}`).slice(0, 24)}`

    const referrer =
      typeof body.referrer === 'string' && body.referrer.trim()
        ? body.referrer.trim()
        : null

    await trackPageView({
      visitorId,
      path: path.split('?')[0] || '/',
      referrer,
      userAgent,
      ip,
      country: req.headers.get('x-vercel-ip-country') || null,
      region: safeDecode(req.headers.get('x-vercel-ip-country-region')),
      city: safeDecode(req.headers.get('x-vercel-ip-city')),
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    // Analytics tidak boleh mengganggu pengalaman pengunjung.
    console.error('Track page view error:', error)
    return new NextResponse(null, { status: 204 })
  }
}
