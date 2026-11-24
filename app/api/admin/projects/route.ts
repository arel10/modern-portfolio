import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { getAllProjects, createProject } from '@/lib/admin-db'
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
    return NextResponse.json(await getAllProjects())
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
    const data = await createProject({
      title: body.title as string,
      short_description: body.short_description as string,
      full_description: body.full_description as string | undefined,
      image_path: (body.image_path as string) || '',
      images: parseArr(body.images),
      created_at_label: body.created_at_label as string | undefined,
      tech: parseArr(body.tech),
      features: parseArr(body.features),
      github_url: (body.github_url as string) || '',
      live_demo_url: (body.live_demo_url as string) || '',
      is_private_repo: Boolean(body.is_private_repo),
      sort_order: Number(body.sort_order) || 0,
    })
    revalidatePublicPages()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal membuat data' }, { status: 500 })
  }
}
