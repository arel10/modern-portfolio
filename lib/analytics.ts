import { createHash } from 'node:crypto'
import { pool } from './db'

const TIMEZONE = 'Asia/Jakarta'

// ─────────────────────────────────────────────────────────────────────────────
// Tabel analytics dibuat otomatis saat request pertama (idempotent), jadi
// tidak perlu menjalankan migrasi manual di Neon.
// ─────────────────────────────────────────────────────────────────────────────

let ensurePromise: Promise<void> | null = null

export function ensureAnalyticsTable(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = pool
      .query(`
        CREATE TABLE IF NOT EXISTS page_views (
          id          BIGSERIAL PRIMARY KEY,
          visitor_id  VARCHAR(64)  NOT NULL,
          path        VARCHAR(500) NOT NULL,
          referrer    VARCHAR(500),
          source      VARCHAR(80)  NOT NULL DEFAULT 'Direct',
          user_agent  TEXT,
          ip_hash     VARCHAR(64),
          country     VARCHAR(10),
          region      VARCHAR(120),
          city        VARCHAR(120),
          device      VARCHAR(20)  NOT NULL DEFAULT 'Desktop',
          browser     VARCHAR(50)  NOT NULL DEFAULT 'Unknown',
          os          VARCHAR(50)  NOT NULL DEFAULT 'Unknown',
          created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_page_views_created_at
          ON page_views (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_page_views_visitor
          ON page_views (visitor_id, created_at DESC);
      `)
      .then(() => undefined)
      .catch((error: unknown) => {
        const err = error as { code?: string; message?: string }
        // Abaikan race condition saat dua lambda membuat tabel bersamaan.
        if (err?.code === '23505' || /already exists/i.test(err?.message ?? '')) return
        ensurePromise = null
        throw error
      })
  }

  return ensurePromise
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function safeDecode(value: string | null): string | null {
  if (!value) return null
  try {
    // Header Vercel bisa berisi nilai URL-encoded (mis. "Kota%20Bandung").
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function hashIp(ip: string): string {
  const salt = process.env.ANALYTICS_SALT || process.env.ADMIN_JWT_SECRET || 'portfolio-analytics'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

export function parseUserAgent(userAgent: string): {
  device: string
  browser: string
  os: string
} {
  const ua = userAgent.toLowerCase()

  let device = 'Desktop'
  if (/ipad|tablet|playbook|silk/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
    device = 'Tablet'
  } else if (/mobile|iphone|ipod|android|windows phone|blackberry|opera mini/.test(ua)) {
    device = 'Mobile'
  }

  let browser = 'Unknown'
  if (/edg\//.test(ua)) browser = 'Microsoft Edge'
  else if (/opr\/|opera/.test(ua)) browser = 'Opera'
  else if (/samsungbrowser/.test(ua)) browser = 'Samsung Internet'
  else if (/firefox\/|fxios/.test(ua)) browser = 'Firefox'
  else if (/chrome\/|crios/.test(ua)) browser = 'Chrome'
  else if (/safari\//.test(ua)) browser = 'Safari'

  let os = 'Unknown'
  if (/windows/.test(ua)) os = 'Windows'
  else if (/android/.test(ua)) os = 'Android'
  else if (/iphone|ipad|ipod/.test(ua)) os = 'iOS'
  else if (/mac os x|macintosh/.test(ua)) os = 'macOS'
  else if (/linux/.test(ua)) os = 'Linux'

  return { device, browser, os }
}

export function classifySource(referrer: string | null): string {
  if (!referrer) return 'Direct'

  let host = ''
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return 'Lainnya'
  }
  if (!host) return 'Direct'

  const known: Array<[RegExp, string]> = [
    [/google\./, 'Google'],
    [/instagram\./, 'Instagram'],
    [/linkedin\./, 'LinkedIn'],
    [/github\./, 'GitHub'],
    [/^(x\.com|t\.co)$|twitter\./, 'X / Twitter'],
    [/facebook\.|fb\./, 'Facebook'],
    [/tiktok\./, 'TikTok'],
    [/youtube\.|youtu\.be/, 'YouTube'],
    [/whatsapp\.|^wa\.me$/, 'WhatsApp'],
    [/telegram\.|t\.me$/, 'Telegram'],
    [/bing\./, 'Bing'],
    [/yahoo\./, 'Yahoo'],
    [/duckduckgo\./, 'DuckDuckGo'],
  ]

  for (const [pattern, label] of known) {
    if (pattern.test(host)) return label
  }

  return host
}

export function isBot(userAgent: string): boolean {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|headless|lighthouse|pagespeed|vercel-screenshot|preview/i.test(
    userAgent
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Simpan satu page view
// ─────────────────────────────────────────────────────────────────────────────

export interface TrackPageViewInput {
  visitorId: string
  path: string
  referrer: string | null
  userAgent: string
  ip: string
  country: string | null
  region: string | null
  city: string | null
}

export async function trackPageView(input: TrackPageViewInput): Promise<void> {
  await ensureAnalyticsTable()

  const { device, browser, os } = parseUserAgent(input.userAgent)
  const source = classifySource(input.referrer)

  await pool.query(
    `INSERT INTO page_views
      (visitor_id, path, referrer, source, user_agent, ip_hash, country, region, city, device, browser, os)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      input.visitorId,
      input.path.slice(0, 500),
      input.referrer ? input.referrer.slice(0, 500) : null,
      source,
      input.userAgent.slice(0, 1000),
      input.ip ? hashIp(input.ip) : null,
      input.country,
      input.region,
      input.city,
      device,
      browser,
      os,
    ]
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Query data untuk dashboard admin
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyticsTotals {
  viewsAll: number
  visitorsAll: number
  viewsToday: number
  visitorsToday: number
  views7d: number
  visitors7d: number
  views30d: number
  visitors30d: number
}

export interface AnalyticsDailyPoint {
  date: string
  views: number
  visitors: number
}

export interface AnalyticsBreakdown {
  label: string
  views: number
  visitors: number
}

export interface AnalyticsVisitorPage {
  path: string
  views: number
  lastSeen: string
}

export interface AnalyticsVisitor {
  id: string
  firstSeen: string
  lastSeen: string
  country: string | null
  region: string | null
  city: string | null
  device: string
  browser: string
  os: string
  source: string
  referrer: string | null
  views: number
  pages: AnalyticsVisitorPage[]
}

export interface AnalyticsData {
  generatedAt: string
  totals: AnalyticsTotals
  daily: AnalyticsDailyPoint[]
  topPages: AnalyticsBreakdown[]
  sources: AnalyticsBreakdown[]
  devices: AnalyticsBreakdown[]
  browsers: AnalyticsBreakdown[]
  countries: AnalyticsBreakdown[]
  cities: AnalyticsBreakdown[]
  visitors: AnalyticsVisitor[]
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  await ensureAnalyticsTable()

  const [
    totalsRes,
    dailyRes,
    pagesRes,
    sourcesRes,
    devicesRes,
    browsersRes,
    countriesRes,
    citiesRes,
  ] = await Promise.all([
      pool.query<{
        views_all: number
        visitors_all: number
        views_today: number
        visitors_today: number
        views_7d: number
        visitors_7d: number
        views_30d: number
        visitors_30d: number
      }>(
        `SELECT
           COUNT(*)::int AS views_all,
           COUNT(DISTINCT visitor_id)::int AS visitors_all,
           COUNT(*) FILTER (
             WHERE (created_at AT TIME ZONE $1)::date = (NOW() AT TIME ZONE $1)::date
           )::int AS views_today,
           COUNT(DISTINCT visitor_id) FILTER (
             WHERE (created_at AT TIME ZONE $1)::date = (NOW() AT TIME ZONE $1)::date
           )::int AS visitors_today,
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS views_7d,
           COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS visitors_7d,
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS views_30d,
           COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS visitors_30d
         FROM page_views`,
        [TIMEZONE]
      ),
      pool.query<{ date: string; views: number; visitors: number }>(
        `SELECT
           to_char(d.day, 'YYYY-MM-DD') AS date,
           COUNT(v.id)::int AS views,
           COUNT(DISTINCT v.visitor_id)::int AS visitors
         FROM generate_series(
           (NOW() AT TIME ZONE $1)::date - INTERVAL '29 days',
           (NOW() AT TIME ZONE $1)::date,
           INTERVAL '1 day'
         ) AS d(day)
         LEFT JOIN page_views v
           ON (v.created_at AT TIME ZONE $1)::date = d.day::date
         GROUP BY d.day
         ORDER BY d.day ASC`,
        [TIMEZONE]
      ),
      pool.query<{ label: string; views: number; visitors: number }>(
        `SELECT path AS label,
                COUNT(*)::int AS views,
                COUNT(DISTINCT visitor_id)::int AS visitors
         FROM page_views
         GROUP BY path
         ORDER BY views DESC
         LIMIT 8`
      ),
      pool.query<{ label: string; views: number; visitors: number }>(
        `SELECT source AS label,
                COUNT(*)::int AS views,
                COUNT(DISTINCT visitor_id)::int AS visitors
         FROM page_views
         GROUP BY source
         ORDER BY views DESC
         LIMIT 8`
      ),
      pool.query<{ label: string; views: number; visitors: number }>(
        `SELECT device AS label,
                COUNT(*)::int AS views,
                COUNT(DISTINCT visitor_id)::int AS visitors
         FROM page_views
         GROUP BY device
         ORDER BY views DESC`
      ),
      pool.query<{ label: string; views: number; visitors: number }>(
        `SELECT browser AS label,
                COUNT(*)::int AS views,
                COUNT(DISTINCT visitor_id)::int AS visitors
         FROM page_views
         GROUP BY browser
         ORDER BY views DESC
         LIMIT 8`
      ),
      pool.query<{ label: string; views: number; visitors: number }>(
        `SELECT COALESCE(country, 'Tidak diketahui') AS label,
                COUNT(*)::int AS views,
                COUNT(DISTINCT visitor_id)::int AS visitors
         FROM page_views
         GROUP BY COALESCE(country, 'Tidak diketahui')
         ORDER BY views DESC
         LIMIT 6`
      ),
      pool.query<{ label: string; views: number; visitors: number }>(
        `SELECT COALESCE(city, 'Tidak diketahui') AS label,
                COUNT(*)::int AS views,
                COUNT(DISTINCT visitor_id)::int AS visitors
         FROM page_views
         GROUP BY COALESCE(city, 'Tidak diketahui')
         ORDER BY views DESC
         LIMIT 6`
      ),
    ])

  const latestRes = await pool.query<{
    visitor_id: string
    path: string
    referrer: string | null
    source: string
    country: string | null
    region: string | null
    city: string | null
    device: string
    browser: string
    os: string
    created_at: Date
  }>(
    `WITH latest AS (
       SELECT DISTINCT ON (visitor_id)
         visitor_id, path, referrer, source, country, region, city,
         device, browser, os, created_at
       FROM page_views
       ORDER BY visitor_id, created_at DESC
     )
     SELECT * FROM latest
     ORDER BY created_at DESC
     LIMIT 30`
  )

  const visitorIds = latestRes.rows.map((row) => row.visitor_id)

  let statsRows: Array<{ visitor_id: string; views: number; first_seen: Date }> = []
  let pageRows: Array<{
    visitor_id: string
    path: string
    views: number
    last_seen: Date
  }> = []

  if (visitorIds.length > 0) {
    const [statsRes, pagesByVisitorRes] = await Promise.all([
      pool.query<{
        visitor_id: string
        views: number
        first_seen: Date
      }>(
        `SELECT visitor_id,
                COUNT(*)::int AS views,
                MIN(created_at) AS first_seen
         FROM page_views
         WHERE visitor_id = ANY($1::text[])
         GROUP BY visitor_id`,
        [visitorIds]
      ),
      pool.query<{
        visitor_id: string
        path: string
        views: number
        last_seen: Date
      }>(
        `SELECT visitor_id,
                path,
                COUNT(*)::int AS views,
                MAX(created_at) AS last_seen
         FROM page_views
         WHERE visitor_id = ANY($1::text[])
         GROUP BY visitor_id, path
         ORDER BY last_seen DESC`,
        [visitorIds]
      ),
    ])

    statsRows = statsRes.rows
    pageRows = pagesByVisitorRes.rows
  }

  const statsMap = new Map(statsRows.map((row) => [row.visitor_id, row]))
  const pagesMap = new Map<string, AnalyticsVisitorPage[]>()
  for (const row of pageRows) {
    const list = pagesMap.get(row.visitor_id) ?? []
    list.push({
      path: row.path,
      views: row.views,
      lastSeen: row.last_seen.toISOString(),
    })
    pagesMap.set(row.visitor_id, list)
  }

  const totalsRow = totalsRes.rows[0]

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      viewsAll: totalsRow.views_all,
      visitorsAll: totalsRow.visitors_all,
      viewsToday: totalsRow.views_today,
      visitorsToday: totalsRow.visitors_today,
      views7d: totalsRow.views_7d,
      visitors7d: totalsRow.visitors_7d,
      views30d: totalsRow.views_30d,
      visitors30d: totalsRow.visitors_30d,
    },
    daily: dailyRes.rows,
    topPages: pagesRes.rows,
    sources: sourcesRes.rows,
    devices: devicesRes.rows,
    browsers: browsersRes.rows,
    countries: countriesRes.rows,
    cities: citiesRes.rows,
    visitors: latestRes.rows.map((row) => {
      const stats = statsMap.get(row.visitor_id)
      return {
        id: row.visitor_id,
        firstSeen: stats?.first_seen?.toISOString() ?? row.created_at.toISOString(),
        lastSeen: row.created_at.toISOString(),
        country: row.country,
        region: row.region,
        city: row.city,
        device: row.device,
        browser: row.browser,
        os: row.os,
        source: row.source,
        referrer: row.referrer,
        views: stats?.views ?? 1,
        pages: (pagesMap.get(row.visitor_id) ?? []).slice(0, 12),
      }
    }),
  }
}

