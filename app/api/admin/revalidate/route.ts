import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminFromRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * Dipanggil otomatis oleh admin setelah setiap simpan/hapus data,
 * supaya halaman publik yang di-cache langsung menampilkan data terbaru.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  revalidatePath('/')
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
