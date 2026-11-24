'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Icon } from './icons'
import { compressImageClientSide } from './ImageUpload'

export interface ProjectGalleryValue {
  cover: string
  images: string[]
}

interface ProjectGalleryInputProps {
  cover: string
  images: string[]
  onChange: (value: ProjectGalleryValue) => void
  label?: string
  hint?: string
  maxPhotos?: number
}

const MAX_FILE_BYTES = 4.4 * 1024 * 1024

/**
 * Pengelola foto project:
 * - unggah banyak foto sekaligus
 * - pilih satu foto sebagai sampul (cover)
 * - hapus foto dari galeri
 *
 * Sampul disimpan di kolom `image_path`, foto lainnya di `images`.
 */
export function ProjectGalleryInput({
  cover,
  images,
  onChange,
  label = 'Foto Proyek',
  hint = 'Unggah beberapa screenshot/foto sekaligus. Pilih satu sebagai sampul yang tampil di kartu project.',
  maxPhotos = 30,
}: ProjectGalleryInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const photos = useMemo(() => {
    const list = [cover, ...images]
      .map((item) => item?.trim())
      .filter((item): item is string => Boolean(item))
    return Array.from(new Set(list))
  }, [cover, images])

  const setCover = (url: string) => {
    if (url === cover) return
    const remaining = images.filter((item) => item !== url)
    onChange({
      cover: url,
      // Sampul lama tetap disimpan di galeri supaya tidak hilang.
      images: cover ? [cover, ...remaining] : remaining,
    })
  }

  const removePhoto = (url: string) => {
    if (url === cover) {
      const [nextCover, ...rest] = images
      onChange({ cover: nextCover ?? '', images: rest })
      return
    }
    onChange({ cover, images: images.filter((item) => item !== url) })
  }

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((file) =>
        file.type.startsWith('image/')
      )
      setError('')
      setNotice('')

      if (files.length === 0) {
        setError('Pilih file gambar (JPG, PNG, WEBP, atau HEIC).')
        return
      }

      const room = Math.max(maxPhotos - photos.length, 0)
      if (room === 0) {
        setError(`Maksimal ${maxPhotos} foto per project.`)
        return
      }

      const queue = files.slice(0, room)
      if (files.length > room) {
        setError(`Hanya ${room} foto pertama yang diunggah (batas ${maxPhotos}).`)
      }

      setUploading(queue.length)
      const uploaded: string[] = []
      const failures: string[] = []

      for (const file of queue) {
        try {
          let uploadFile = file
          try {
            uploadFile = await compressImageClientSide(file)
          } catch {
            // biarkan file asli jika kompresi browser gagal
          }

          if (uploadFile.size > MAX_FILE_BYTES) {
            failures.push(`${file.name}: ukuran masih di atas 4.4 MB`)
            continue
          }

          const formData = new FormData()
          formData.append('file', uploadFile)

          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
          })

          let data: { url?: string; error?: string } = {}
          try {
            data = await res.json()
          } catch {
            data = { error: 'Respon server tidak valid.' }
          }

          if (!res.ok || !data.url) {
            failures.push(`${file.name}: ${data.error || 'gagal diunggah'}`)
            continue
          }

          uploaded.push(data.url)
        } catch {
          failures.push(`${file.name}: gagal menghubungi server`)
        } finally {
          setUploading((count) => Math.max(count - 1, 0))
        }
      }

      if (uploaded.length > 0) {
        const nextCover = cover || uploaded[0]
        const nextImages = [
          ...images,
          ...uploaded.filter((url) => url !== nextCover),
        ]
        onChange({
          cover: nextCover,
          images: Array.from(new Set(nextImages)),
        })
        setNotice(
          `${uploaded.length} foto berhasil diunggah${
            cover ? '' : ' dan dijadikan sampul'
          }.`
        )
      }

      if (failures.length > 0) {
        setError(failures.slice(0, 3).join(' · '))
      }
    },
    [cover, images, maxPhotos, onChange, photos.length]
  )

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
    if (event.dataTransfer.files?.length) {
      void uploadFiles(event.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="block text-sm font-semibold text-text-primary">
            {label}
          </label>
          <p className="mt-0.5 text-xs text-text-secondary">{hint}</p>
        </div>
        <span className="shrink-0 rounded-full border border-text-secondary/20 bg-text-secondary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
          {photos.length} / {maxPhotos} Foto
        </span>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-all duration-300 ${
          dragOver
            ? 'border-text-primary bg-text-secondary/10'
            : 'border-text-secondary/25 bg-background/40 hover:border-text-primary/60 hover:bg-text-secondary/5'
        } ${uploading > 0 ? 'pointer-events-none opacity-70' : ''}`}
      >
        {uploading > 0 ? (
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-text-primary border-t-transparent" />
            <p className="text-sm font-semibold text-text-primary">
              Mengunggah {uploading} foto...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-text-secondary/10 text-text-primary">
              <Icon name="image" className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-text-primary">
              Tambah foto{' '}
              <span className="font-normal text-text-secondary">
                (bisa pilih banyak sekaligus)
              </span>
            </p>
            <p className="text-[11px] font-medium text-text-secondary">
              JPG, PNG, WEBP, HEIC · otomatis dikompres
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            void uploadFiles(event.target.files)
          }
          event.target.value = ''
        }}
      />

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((url, index) => {
            const isCover = url === cover
            return (
              <div
                key={`${url}-${index}`}
                className={`group relative overflow-hidden rounded-xl border bg-background ${
                  isCover
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'border-text-secondary/20 dark:border-white/10'
                }`}
              >
                <div className="relative aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Foto ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {isCover && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                      <Icon name="check" className="h-3 w-3" />
                      Sampul
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    aria-label="Hapus foto"
                    title="Hapus foto"
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-red-500 shadow transition-colors hover:bg-red-500 hover:text-white"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                  <span className="truncate text-[10px] font-medium text-text-secondary">
                    Foto {index + 1}
                  </span>
                  {isCover ? (
                    <span className="shrink-0 text-[10px] font-bold text-emerald-500">
                      Dipakai di kartu
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCover(url)}
                      className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-text-primary transition-colors hover:bg-text-secondary/15"
                    >
                      Jadikan Sampul
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-text-secondary/20 px-3 py-4 text-center text-xs font-medium text-text-secondary">
          Belum ada foto. Unggah minimal satu foto untuk sampul project.
        </p>
      )}

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-500">
          <Icon name="check" className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-500">
          <Icon name="alert" className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
