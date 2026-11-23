import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { getAllAchievements, createAchievement } from '@/lib/admin-db'
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
    return NextResponse.json(await getAllAchievements())
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengambil data pencapaian' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = (await req.json()) as Record<string, unknown>
    const data = await createAchievement({
      title: (body.title as string)?.trim(),
      category: (body.category as string)?.trim() || 'prestasi',
      issuer: (body.issuer as string)?.trim(),
      date: (body.date as string)?.trim(),
      description: (body.description as string)?.trim() || undefined,
      link_url: (body.link_url as string)?.trim() || undefined,
      image_url: (body.image_url as string)?.trim() || undefined,
      skills: parseArr(body.skills),
      sort_order: Number(body.sort_order) || 0,
    })
    revalidatePublicPages()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menambah data pencapaian' }, { status: 500 })
  }
}
