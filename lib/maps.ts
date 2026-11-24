/**
 * Mengubah berbagai format link Google Maps menjadi URL yang bisa
 * ditampilkan di dalam <iframe>.
 *
 * Google hanya mengizinkan embed lewat URL khusus:
 *   https://maps.google.com/maps?q=...&output=embed
 *   https://www.google.com/maps/embed?pb=...
 *
 * Link "share" biasa (mis. /maps/place/Nama/@lat,lng/... atau maps.app.goo.gl)
 * akan ditolak Google saat dimuat di iframe, sehingga petanya kosong.
 */

const EMBED_HOST_REGEX = /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i

export function resolveMapsEmbedUrl(
  raw: string | null | undefined
): string | null {
  if (!raw) return null

  let value = raw.trim()
  if (!value) return null

  // Jika user menempel seluruh kode <iframe>, ambil src-nya saja.
  const iframeMatch = value.match(/src\s*=\s*["']([^"']+)["']/i)
  if (iframeMatch) value = iframeMatch[1].trim()

  // Sudah berupa URL embed yang valid.
  if (EMBED_HOST_REGEX.test(value)) return value

  // Koordinat titik lokasi paling presisi: !3d<lat>!4d<lng>
  const pin = value.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  // Koordinat viewport: @<lat>,<lng>
  const view = value.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)

  const lat = pin?.[1] ?? view?.[1]
  const lng = pin?.[2] ?? view?.[2]

  if (lat && lng) {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`
  }

  // Link pencarian dengan parameter q=...
  try {
    const url = new URL(value)
    const q = url.searchParams.get('q')
    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`
    }
  } catch {
    // bukan URL absolut; lanjut ke pola di bawah
  }

  // Link place: /maps/place/Nama+Tempat/...
  const placeMatch = value.match(/\/maps\/place\/([^/@?]+)/)
  if (placeMatch?.[1]) {
    const name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
    return `https://maps.google.com/maps?q=${encodeURIComponent(name)}&z=16&output=embed`
  }

  // URL Google Maps lain: coba paksa mode embed.
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value)
      url.searchParams.set('output', 'embed')
      return url.toString()
    } catch {
      return null
    }
  }

  // Bukan URL: anggap sebagai alamat/nama tempat.
  return `https://maps.google.com/maps?q=${encodeURIComponent(value)}&z=16&output=embed`
}
