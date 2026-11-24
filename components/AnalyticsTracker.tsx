'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const VISITOR_KEY = 'portfolio_visitor_id'
const OPT_OUT_KEY = 'portfolio_track_optout'

function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY)
    if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) return existing

    const generated =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`

    localStorage.setItem(VISITOR_KEY, generated)
    return generated
  } catch {
    return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  }
}

/**
 * Mengirim satu page view ke /api/track setiap kali halaman publik dibuka.
 * Tidak aktif di area /admin dan bisa di-opt-out lewat localStorage.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return
    if (lastTracked.current === pathname) return

    try {
      if (localStorage.getItem(OPT_OUT_KEY) === '1') return
    } catch {
      // localStorage bisa diblokir; tetap lanjut tanpa opt-out.
    }

    lastTracked.current = pathname

    const payload = JSON.stringify({
      visitorId: getVisitorId(),
      path: pathname,
      referrer: document.referrer || null,
    })

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' })
        if (navigator.sendBeacon('/api/track', blob)) return
      }

      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    } catch {
      // Abaikan kegagalan analytics.
    }
  }, [pathname])

  return null
}
