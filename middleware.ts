import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_COOKIE = 'admin_token'

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || 'dev-fallback-secret-change-in-prod-32chars'
  return new TextEncoder().encode(secret)
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public admin routes — no auth needed
  const isPublicAdminRoute =
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin/auth/') ||
    pathname === '/api/admin/setup'

  if (isPublicAdminRoute) return NextResponse.next()

  const token = req.cookies.get(ADMIN_COOKIE)?.value

  if (!token) {
    if (pathname.startsWith('/api/admin/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  try {
    await jwtVerify(token, getSecret())
    return NextResponse.next()
  } catch {
    if (pathname.startsWith('/api/admin/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/admin/login', req.url))
    response.cookies.delete(ADMIN_COOKIE)
    return response
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
