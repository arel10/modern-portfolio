import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { getAdminProfile, updateProfile } from '@/lib/admin-db'
import { revalidatePublicPages } from '@/lib/revalidate'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const profile = await getAdminProfile()
    return NextResponse.json(profile)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengambil data profil' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = (await req.json()) as { id: number } & Record<string, unknown>
    const { id, ...data } = body
    const updated = await updateProfile(id, data)
    revalidatePublicPages()
    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal update profil' }, { status: 500 })
  }
}
