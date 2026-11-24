'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Icon } from './icons'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  hint?: string
  maxSizeMB?: number
  accept?: string
  allowPdf?: boolean
  className?: string
}

/**
 * Kompresi gambar di sisi klien sebelum dikirim ke server.
 * Ini memastikan foto kamera HP (5MB-25MB) diperkecil menjadi < 1MB,
 * mencegah error 413 (Content Too Large) di gateway Vercel (batas 4.5MB).
 */
export async function compressImageClientSide(file: File): Promise<File> {
  if (typeof window === 'undefined') return file

  // Jangan sentuh file non-gambar (seperti PDF) atau format vektor SVG
  const isImage = file.type.startsWith('image/')
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
  if (!isImage || isSvg) {
    return file
  }

  // Jika ukuran sudah kecil (< 1MB), kirim langsung
  if (file.size <= 1024 * 1024) {
    return file
  }

  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      // Batasi resolusi maksimal 1920px (standar Full HD)
      const maxDim = 1920
      let { width, height } = img

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Coba kompres ke format WebP kualitas 0.82 (atau JPEG jika WebP gagal)
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file)
            return
          }
          const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
          const compressed = new File([blob], cleanName, {
            type: 'image/webp',
            lastModified: Date.now(),
          })
          resolve(compressed)
        },
        'image/webp',
        0.82
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }

    img.src = objectUrl
  })
}

export function ImageUpload({
  value,
  onChange,
  label = 'Foto / Gambar',
  hint,
  maxSizeMB = 50,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/heic,image/heif',
  allowPdf = false,
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successInfo, setSuccessInfo] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const effectiveAccept = allowPdf ? `${accept},application/pdf,.pdf` : accept
  const effectiveMaxSize = maxSizeMB

  const handleFileProcess = useCallback(
    async (file: File) => {
      setErrorMsg('')

      // 1. Client-side size check
      const maxSizeBytes = effectiveMaxSize * 1024 * 1024
      if (file.size > maxSizeBytes) {
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2)
        setErrorMsg(
          `Ukuran file terlalu besar (${sizeInMb} MB). Batas maksimal adalah ${effectiveMaxSize} MB.`
        )
        return
      }

      // 2. Perform upload
      setUploading(true)
      setSuccessInfo('Memproses foto...')
      try {
        // Kompresi otomatis di browser jika foto besar (mencegah error 413 Vercel)
        let uploadFile = file
        try {
          uploadFile = await compressImageClientSide(file)
        } catch (compErr) {
          console.warn('Client compression failed, using original file:', compErr)
        }

        // Batas keras gateway Vercel adalah 4.5 MB
        if (uploadFile.size > 4.4 * 1024 * 1024) {
          const mb = (uploadFile.size / (1024 * 1024)).toFixed(2)
          setErrorMsg(
            `Ukuran file (${mb} MB) melebihi batas upload serverless (maksimal 4.5 MB). Silakan kompres dokumen terlebih dahulu.`
          )
          setUploading(false)
          return
        }

        const formData = new FormData()
        formData.append('file', uploadFile)

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (res.status === 413) {
          setErrorMsg(
            'Ukuran file terlalu besar untuk gateway server (413 Content Too Large). Maksimal 4.5 MB.'
          )
          return
        }

        let data: {
          url?: string
          error?: string
          message?: string
          wasCompressed?: boolean
          originalSize?: number
          compressedSize?: number
        } = {}

        try {
          data = await res.json()
        } catch {
          data = { error: 'Format respon server tidak valid.' }
        }

        if (!res.ok) {
          setErrorMsg(data.error || 'Gagal mengunggah file. Silakan coba lagi.')
        } else if (data.url) {
          onChange(data.url)
          setErrorMsg('')
          if (data.message) {
            setSuccessInfo(data.message)
            setTimeout(() => setSuccessInfo(''), 6000)
          }
        }
      } catch {
        setErrorMsg('Gagal menghubungi server upload. Periksa koneksi Anda.')
      } finally {
        setUploading(false)
      }
    },
    [effectiveMaxSize, onChange]
  )

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileProcess(file)
    }
    // reset input so the same file can be re-selected if needed
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileProcess(file)
    }
  }

  const isPdf = value?.toLowerCase().endsWith('.pdf')

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label & Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-text-primary">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors underline"
        >
          {manualMode ? 'Mode Upload File' : 'Input URL Manual'}
        </button>
      </div>

      {hint && <p className="text-xs text-text-secondary">{hint}</p>}

      {/* Manual URL Input Fallback Mode */}
      {manualMode ? (
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... atau /images/hero.jpg"
            className="w-full rounded-xl border border-text-secondary/20 bg-background px-3.5 py-2.5 text-sm text-text-primary shadow-sm outline-none transition placeholder:text-text-secondary/50 focus:border-text-primary focus:ring-1 focus:ring-text-primary/30"
          />
          <p className="text-[11px] text-text-secondary">
            Bisa berupa URL gambar eksternal atau path lokal seperti <code>/images/hero.jpg</code>.
          </p>
        </div>
      ) : value ? (
        /* Preview Card when image is present */
        <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-text-secondary/20 bg-background/50 p-4 backdrop-blur-md">
          {/* Thumbnail preview */}
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-text-secondary/20 bg-text-secondary/5 shadow-inner">
            {isPdf ? (
              <div className="flex flex-col items-center justify-center text-red-500 gap-1 p-2">
                <Icon name="file" className="h-8 w-8" />
                <span className="text-[10px] font-bold uppercase tracking-wider">PDF Dokumen</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback icon if image path is broken
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                ✓ Foto Terpasang
              </span>
            </div>
            <p className="text-xs text-text-secondary font-mono truncate" title={value}>
              {value}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-text-secondary/15 hover:bg-text-secondary/25 text-text-primary transition-colors disabled:opacity-50"
              >
                <Icon name="upload" className="h-3.5 w-3.5" />
                {uploading ? 'Mengunggah...' : 'Ganti Foto'}
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone when no file selected */
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? 'border-text-primary bg-text-secondary/10 shadow-lg scale-[1.01]'
              : 'border-text-secondary/25 bg-background/40 hover:border-text-primary/60 hover:bg-text-secondary/5'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 py-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-primary border-t-transparent" />
              <p className="text-sm font-semibold text-text-primary">
                Mengunggah & Mengompres Foto...
              </p>
              <p className="text-xs text-text-secondary">
                Server sedang mengoptimasi ukuran gambar otomatis
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-text-secondary/10 text-text-primary group-hover:scale-110 transition-transform">
                <Icon name="image" className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-text-primary">
                Pilih Foto <span className="font-normal text-text-secondary">atau seret ke sini</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-text-secondary/10 px-2 py-0.5 rounded">
                  Format: PNG, JPG, WEBP, HEIC {allowPdf ? ', PDF' : ''}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded inline-flex items-center gap-1">
                  ⚡ Auto-Kompres Backend
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={effectiveAccept}
        onChange={onFileChange}
        className="hidden"
      />

      {/* Success / Compression Notification */}
      {successInfo && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs font-medium text-emerald-500 animate-in fade-in">
          <Icon name="check" className="h-4 w-4 shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2 text-xs font-medium text-red-500 animate-in fade-in">
          <Icon name="alert" className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  )
}
