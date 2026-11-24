import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { getDashboardStats, getAdminProfile } from '@/lib/admin-db'
import { getAnalyticsData } from '@/lib/analytics'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [stats, analytics, profile] = await Promise.all([
      getDashboardStats(),
      getAnalyticsData().catch((error) => {
        console.error('Analytics dashboard error:', error)
        return null
      }),
      getAdminProfile().catch(() => null),
    ])

    return NextResponse.json({
      stats,
      analytics: analytics?.totals ?? null,
      daily: analytics?.daily.slice(-14) ?? [],
      topPages: analytics?.topPages.slice(0, 5) ?? [],
      recentVisitors: analytics?.visitors.slice(0, 6) ?? [],
      profile: profile
        ? {
            full_name: profile.full_name,
            short_name: profile.short_name,
            avatar_url: profile.avatar_url,
            email: profile.email,
          }
        : null,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}
