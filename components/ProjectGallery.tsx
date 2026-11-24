'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface ProjectGalleryProps {
  title: string
  cover: string
  images?: string[]
}

/**
 * Galeri foto halaman detail project.
 * Sampul selalu tampil pertama, diikuti foto tambahan.
 */
export default function ProjectGallery({
  title,
  cover,
  images = [],
}: ProjectGalleryProps) {
  const photos = useMemo(() => {
    const list = [cover, ...images]
      .map((item) => item?.trim())
      .filter((item): item is string => Boolean(item))
    return Array.from(new Set(list))
  }, [cover, images])

  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)

  const total = photos.length
  const current = total > 0 ? Math.min(active, total - 1) : 0

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return
      setActive(((index % total) + total) % total)
    },
    [total]
  )

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const previous = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (!open) return

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') previous()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, next, previous])

  if (total === 0) {
    return (
      <div className="mt-10 flex aspect-[16/10] w-full items-center justify-center rounded-3xl border border-text-secondary/15 bg-thirdary/30 text-sm font-medium text-text-secondary">
        Foto project belum tersedia.
      </div>
    )
  }

  return (
    <div className="mt-10">
      {/* Foto utama */}
      <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-text-secondary/15 bg-thirdary/40 shadow-xl">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Perbesar foto"
          className="absolute inset-0 z-10 cursor-zoom-in"
        >
          <Image
            src={photos[current]}
            alt={`${title} — foto ${current + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 860px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </button>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Foto sebelumnya"
              className="absolute left-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-text-secondary/20 bg-background/85 text-text-primary shadow-lg backdrop-blur transition-all hover:scale-105 hover:bg-background"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto berikutnya"
              className="absolute right-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-text-secondary/20 bg-background/85 text-text-primary shadow-lg backdrop-blur transition-all hover:scale-105 hover:bg-background"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <span className="absolute bottom-3 right-3 z-20 rounded-full border border-text-secondary/20 bg-background/85 px-2.5 py-1 text-[10px] font-bold tabular-nums text-text-primary shadow backdrop-blur">
          {current + 1} / {total}
        </span>

        {total > 1 && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-20 hidden rounded-full border border-text-secondary/20 bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary shadow backdrop-blur sm:inline-flex">
            Klik untuk memperbesar
          </span>
        )}
      </div>

      {/* Thumbnail */}
      {total > 1 && (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'thin' }}
        >
          {photos.map((photo, index) => {
            const isActive = index === current
            return (
              <button
                key={`${photo}-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Lihat foto ${index + 1}`}
                aria-current={isActive}
                className={`relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-text-primary opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={photo}
                  alt={`${title} — thumbnail ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-background/85 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-text-primary backdrop-blur">
                    Sampul
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri foto ${title}`}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/95 p-4 backdrop-blur-md sm:p-8"
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-text-secondary/20 bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={photos[current]}
                alt={`${title} — foto ${current + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-text-secondary/15 px-4 py-3">
              <span className="text-xs font-bold text-text-primary">
                {title}
                <span className="ml-2 font-medium text-text-secondary">
                  {current + 1} / {total}
                </span>
              </span>
              <div className="flex items-center gap-2">
                {total > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={previous}
                      aria-label="Foto sebelumnya"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-text-secondary/20 text-text-primary transition-colors hover:bg-text-secondary/10"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      aria-label="Foto berikutnya"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-text-secondary/20 text-text-primary transition-colors hover:bg-text-secondary/10"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup galeri"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-text-secondary/20 text-text-primary transition-colors hover:bg-text-secondary/10"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
