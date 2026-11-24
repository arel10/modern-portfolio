import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

// Allowed file types (termasuk foto mentah HP: HEIC/HEIF, JPEG, PNG, WEBP, GIF, SVG, PDF)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'image/heic',
  'image/heif',
  'application/pdf',
])

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
  '.gif',
  '.heic',
  '.heif',
  '.pdf',
])

// Batas aman ukuran file hingga 50MB (tanpa batas praktis untuk foto kamera HP)
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

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
          error: `Format file "${ext || 'unknown'}" tidak didukung. Harap unggah file foto (JPG, PNG, WEBP, HEIC, SVG) atau dokumen PDF.`,
        },
        { status: 400 }
      )
    }

    // 2. Validasi Batas Maksimal (50MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return NextResponse.json(
        {
          error: `Ukuran file terlalu besar (${actualSizeMB} MB). Batas maksimal adalah 50 MB.`,
        },
        { status: 400 }
      )
    }

    // 3. Baca file ke buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const isPdf = ext === '.pdf' || mime === 'application/pdf'
    const isSvg = ext === '.svg' || mime === 'image/svg+xml'

    let finalBuffer: Buffer = buffer
    let outputExt = ext
    let wasCompressed = false

    // 4. Kompresi otomatis di backend menggunakan Sharp untuk foto/gambar
    if (!isPdf && !isSvg) {
      try {
        finalBuffer = await sharp(buffer)
          .rotate() // Membaca EXIF orientation kamera HP agar foto tidak miring/terbalik
          .resize({
            width: 1920,
            height: 1920,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 82, effort: 4 })
          .toBuffer()

        outputExt = '.webp'
        wasCompressed = true
      } catch (sharpError) {
        console.warn('Sharp compression failed, fallback to original buffer:', sharpError)
        finalBuffer = buffer
        outputExt = ext
      }
    }

    // 5. Generate nama file unik & aman
    const rawBaseName = path.basename(file.name, ext)
    const cleanBaseName =
      rawBaseName
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30) || 'upload'

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const finalFilename = `${cleanBaseName}-${uniqueSuffix}${outputExt}`

    const originalKB = (file.size / 1024).toFixed(0)
    const finalKB = (finalBuffer.length / 1024).toFixed(0)

    // 6. Simpan File: Jika Vercel Blob tersedia (read-write token ATAU OIDC)
    // Catatan: store yang di-connect lewat dashboard sekarang memakai OIDC
    // (BLOB_STORE_ID + VERCEL_OIDC_TOKEN), bukan BLOB_READ_WRITE_TOKEN lagi.
    const isBlobConfigured = Boolean(
      process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
    )

    if (isBlobConfigured || process.env.VERCEL) {
      const mimeMap: Record<string, string> = {
        '.webp': 'image/webp',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
      }
      const contentType = mimeMap[outputExt] || mime
      const pathname = `uploads/${finalFilename}`

      const buildSuccessResponse = (url: string, storage: string) =>
        NextResponse.json({
          success: true,
          url,
          filename: finalFilename,
          originalName: file.name,
          originalSize: file.size,
          compressedSize: finalBuffer.length,
          wasCompressed,
          storage,
          message: wasCompressed
            ? `Foto berhasil dikompresi (${originalKB}KB ➔ ${finalKB}KB) & tersimpan aman di Vercel Blob Cloud!`
            : 'File berhasil diunggah ke Vercel Blob Cloud!',
        })

      try {
        let blob
        try {
          // Store Public: URL bisa langsung diakses dari CDN Vercel.
          blob = await put(pathname, finalBuffer, {
            access: 'public',
            contentType,
          })

          return buildSuccessResponse(blob.url, 'vercel-blob')
        } catch (publicErr: unknown) {
          const message = publicErr instanceof Error ? publicErr.message : String(publicErr)

          // Store Private menolak upload dengan access "public".
          // Karena mode store tidak bisa diubah, ulangi upload dengan access "private"
          // lalu sajikan file lewat route proxy /api/blob/... di bawah.
          const isPrivateStore = /private store|private access|cannot use public access/i.test(
            message
          )

          if (!isPrivateStore) {
            throw publicErr
          }

          blob = await put(pathname, finalBuffer, {
            access: 'private',
            contentType,
          })

          return buildSuccessResponse(`/api/blob/${pathname}`, 'vercel-blob-private')
        }
      } catch (blobErr: unknown) {
        const message = blobErr instanceof Error ? blobErr.message : String(blobErr)
        console.error('Vercel Blob upload error:', message)

        return NextResponse.json(
          {
            error: `Gagal mengunggah ke Vercel Blob: ${message}. Pastikan Blob store sudah di-connect ke environment Production lalu lakukan Redeploy.`,
            storage: 'vercel-blob',
          },
          { status: 500 }
        )
      }
    }

    // 7. Simpan File: Fallback ke Local Disk (Development / Server Mandiri)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      const targetFilePath = path.join(uploadsDir, finalFilename)
      await fs.promises.writeFile(targetFilePath, finalBuffer)

      const publicUrl = `/uploads/${finalFilename}`

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: finalFilename,
        originalName: file.name,
        originalSize: file.size,
        compressedSize: finalBuffer.length,
        wasCompressed,
        storage: 'local',
        message: wasCompressed
          ? `Foto berhasil dikompresi otomatis (${originalKB}KB ➔ ${finalKB}KB)!`
          : 'File berhasil diunggah!',
      })
    } catch (fsErr: unknown) {
      const err = fsErr as { code?: string; message?: string }
      console.error('File system write error:', err)

      // Deteksi error read-only file system di Vercel serverless jika token Blob belum di-setup
      if (err?.code === 'EROFS' || process.env.VERCEL) {
        return NextResponse.json(
          {
            error:
              'Penyimpanan Vercel bersifat read-only. Harap aktifkan Vercel Blob di tab Storage dashboard Vercel Anda (gratis), lalu klik "Connect to Project".',
          },
          { status: 500 }
        )
      }

      throw fsErr
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memproses unggahan file.' },
      { status: 500 }
    )
  }
}
