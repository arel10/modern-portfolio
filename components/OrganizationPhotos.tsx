'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface OrganizationPhotosProps {
  name: string
  cover?: string
  images?: string[]
}

/**
 * Foto organisasi pada halaman publik.
 * Sampul tampil di kartu; klik untuk membuka lightbox berisi semua foto.
 */
export default function OrganizationPhotos({
  name,
  cover,
  images = [],
}: OrganizationPhotosProps) {
  const photos = useMemo(() => {
    const list = [cover ?? '', ...images]
      .map((item) => item?.trim())
      .filter((item): item is string => Boolean(item))
    return Array.from(new Set(list))
  }, [cover, images])

  const total = photos.length
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const current = total > 0 ? Math.min(active, total - 1) : 0

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return
      setActive(((index % total) + total) % total)
    },
    [total]
  )

  useEffect(() => {
    if (!open) return

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key === 'ArrowRight') goTo(current + 1)
      if (event.key === 'ArrowLeft') goTo(current - 1)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, current, goTo])

  if (total === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl border border-dashed border-text-secondary/20 bg-thirdary/20 text-text-secondary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 opacity-60"
          aria-hidden="true"
        >
          <path d="M3 21h18" />
          <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
          <path d="M15 9h2a2 2 0 0 1 2 2v10" />
          <path d="M9 7h2M9 11h2M9 15h2" />
        </svg>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setActive(0)
          setOpen(true)
        }}
        aria-label={`Lihat foto ${name}`}
        className="group relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-xl border border-text-secondary/15 bg-thirdary/30"
      >
        <Image
          src={photos[current]}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 420px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-70" />

        {total > 1 && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-text-secondary/20 bg-background/85 px-2 py-0.5 text-[10px] font-bold text-text-primary shadow backdrop-blur">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
            </svg>
            {total} foto
          </span>
        )}

        <span className="pointer-events-none absolute bottom-2 left-2 hidden rounded-full border border-text-secondary/20 bg-background/85 px-2 py-0.5 text-[10px] font-bold text-text-secondary shadow backdrop-blur sm:inline-flex">
          Klik untuk memperbesar
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri foto ${name}`}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/95 p-4 backdrop-blur-md sm:p-8"
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-text-secondary/20 bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[16/10] w-full bg-thirdary/30">
              <Image
                src={photos[current]}
                alt={`${name} — foto ${current + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-text-secondary/15 px-4 py-3">
              <span className="min-w-0 truncate text-xs font-bold text-text-primary">
                {name}
                <span className="ml-2 font-medium text-text-secondary">
                  {current + 1} / {total}
                </span>
              </span>

              <div className="flex shrink-0 items-center gap-2">
                {total > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => goTo(current - 1)}
                      aria-label="Foto sebelumnya"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-text-secondary/20 text-text-primary transition-colors hover:bg-text-secondary/10"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="m15 19-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo(current + 1)}
                      aria-label="Foto berikutnya"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-text-secondary/20 text-text-primary transition-colors hover:bg-text-secondary/10"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="m9 5 7 7-7 7" />
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
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
