import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { createTechItem } from '@/lib/admin-db'
import { revalidatePublicPages } from '@/lib/revalidate'

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = (await req.json()) as Record<string, unknown>
    const data = await createTechItem({
      category_id: Number(body.category_id),
      name: body.name as string,
      svg_path: (body.svg_path as string) || '',
      sort_order: Number(body.sort_order) || 0,
    })
    revalidatePublicPages()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal membuat data' }, { status: 500 })
  }
}
