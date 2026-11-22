import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import fs from 'node:fs'
import path from 'node:path'

// Allowed file types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'application/pdf',
])

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
  '.gif',
  '.pdf',
])

// Maximum file size limits
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const MAX_DOC_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Harap login kembali.' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Tidak ada file yang dipilih untuk diunggah.' }, { status: 400 })
    }

    const ext = path.extname(file.name).toLowerCase()
    const mime = file.type.toLowerCase()

    // 1. Validasi Ekstensi dan Mime Type
    const isExtAllowed = ALLOWED_EXTENSIONS.has(ext)
    const isMimeAllowed = ALLOWED_MIME_TYPES.has(mime) || ext === '.svg' // fallback untuk svg

    if (!isExtAllowed && !isMimeAllowed) {
      return NextResponse.json(
        {
          error: `Format file "${ext || 'unknown'}" tidak didukung. Harap unggah file foto (JPG, PNG, WEBP, SVG) atau PDF.`,
        },
        { status: 400 }
      )
    }

    // 2. Validasi Ukuran File (Maksimal 2MB untuk gambar, 5MB untuk dokumen PDF)
    const isPdf = ext === '.pdf' || mime === 'application/pdf'
    const maxSizeBytes = isPdf ? MAX_DOC_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES
    const maxSizeLabel = isPdf ? '5 MB' : '2 MB'

    if (file.size > maxSizeBytes) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return NextResponse.json(
        {
          error: `Ukuran file terlalu besar (${actualSizeMB} MB). Batas maksimal yang diizinkan adalah ${maxSizeLabel}.`,
        },
        { status: 400 }
      )
    }

    // 3. Pastikan direktori public/uploads ada
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // 4. Generate nama file unik & aman
    const rawBaseName = path.basename(file.name, ext)
    const cleanBaseName = rawBaseName
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30) || 'upload'

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const finalFilename = `${cleanBaseName}-${uniqueSuffix}${ext}`
    const targetFilePath = path.join(uploadsDir, finalFilename)

    // 5. Tulis file ke disk
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.promises.writeFile(targetFilePath, buffer)

    const publicUrl = `/uploads/${finalFilename}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
      originalName: file.name,
      size: file.size,
      message: 'Foto berhasil diunggah!',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memproses unggahan file.' },
      { status: 500 }
    )
  }
}
