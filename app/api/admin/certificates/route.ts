import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { getAllCertificates, createCertificate } from '@/lib/admin-db'
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
    return NextResponse.json(await getAllCertificates())
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengambil data sertifikat' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = (await req.json()) as Record<string, unknown>
    const data = await createCertificate({
      title: (body.title as string)?.trim(),
      issuer: (body.issuer as string)?.trim(),
      issue_date: (body.issue_date as string)?.trim(),
      expiration_date: (body.expiration_date as string)?.trim() || undefined,
      credential_id: (body.credential_id as string)?.trim() || undefined,
      credential_url: (body.credential_url as string)?.trim() || undefined,
      image_url: (body.image_url as string)?.trim() || undefined,
      skills: parseArr(body.skills),
      sort_order: Number(body.sort_order) || 0,
    })
    revalidatePublicPages()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menambah data sertifikat' }, { status: 500 })
  }
}
