import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { getAnalyticsData } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await getAnalyticsData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Analytics query error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pengunjung. Pastikan database Neon aktif.' },
      { status: 500 }
    )
  }
}
