import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { getAllOrganizations, createOrganization } from '@/lib/admin-db'
import { revalidatePublicPages } from '@/lib/revalidate'

function parseArr(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[]
  if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    return NextResponse.json(await getAllOrganizations())
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = (await req.json()) as Record<string, unknown>
    const data = await createOrganization({
      name: body.name as string,
      role: body.role as string,
      date_range: body.date_range as string,
      description: (body.description as string) || '',
      image_url: (body.image_url as string) || '',
      images: parseArr(body.images),
      skills: parseArr(body.skills),
      sort_order: Number(body.sort_order) || 0,
    })
    revalidatePublicPages()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal membuat data' }, { status: 500 })
  }
}
