'use client'

import { useAdminData } from '@/components/admin/api'
import { Icon, type IconName } from '@/components/admin/icons'
import {
  Alert,
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
  cn,
} from '@/components/admin/ui'
import type { AnalyticsBreakdown, AnalyticsData } from '@/lib/analytics'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const numberFormatter = new Intl.NumberFormat('id-ID')

function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

function countryName(code: string | null): string {
  if (!code) return 'Tidak diketahui'
  try {
    return new Intl.DisplayNames(['id'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

function pathLabel(path: string): string {
  if (path === '/' || path === '') return 'Beranda'
  return path
}

function shortVisitor(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'ANON'
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function exactTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function deviceIcon(device: string): string {
  if (device === 'Mobile') return '📱'
  if (device === 'Tablet') return '💻'
  return '🖥️'
}

const sourceTone: Record<string, string> = {
  Direct: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Google: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Instagram: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  LinkedIn: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  GitHub: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
}

function sourceClass(source: string): string {
  return sourceTone[source] ?? 'bg-text-secondary/10 text-text-secondary border-text-secondary/20'
}

// ─────────────────────────────────────────────────────────────────────────────
// Small UI pieces
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string
  value: string
  hint: string
  icon: IconName
  accent: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-text-primary">{value}</p>
          <p className="mt-1 text-xs font-medium text-text-secondary">{hint}</p>
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
            accent
          )}
        >
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
    </Card>
  )
}

function BreakdownList({
  items,
  emptyLabel,
  formatLabel = (label: string) => label,
}: {
  items: AnalyticsBreakdown[]
  emptyLabel: string
  formatLabel?: (label: string) => string
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-xs font-medium text-text-secondary">{emptyLabel}</p>
  }

  const max = Math.max(...items.map((item) => item.views), 1)

  return (
    <div className="space-y-3.5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-semibold text-text-primary" title={item.label}>
              {formatLabel(item.label)}
            </span>
            <span className="shrink-0 font-mono text-[11px] font-bold text-text-secondary">
              {formatNumber(item.views)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-text-secondary/10">
            <div
              className="h-full rounded-full bg-text-primary/60"
              style={{ width: `${Math.max((item.views / max) * 100, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function TrendChart({ data }: { data: AnalyticsData['daily'] }) {
  const max = Math.max(...data.map((point) => point.views), 1)
  const totalViews = data.reduce((sum, point) => sum + point.views, 0)
  const totalVisitors = data.reduce((sum, point) => sum + point.visitors, 0)

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-text-primary">Tren 30 Hari Terakhir</h2>
          <p className="mt-0.5 text-xs font-medium text-text-secondary">
            {formatNumber(totalViews)} page views · {formatNumber(totalVisitors)} kunjungan pengunjung
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-text-primary/80" />
            Page views
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
            Pengunjung
          </span>
        </div>
      </div>

      <div className="flex h-44 items-end gap-[3px] sm:gap-1.5">
        {data.map((point, index) => {
          const viewsHeight = Math.max((point.views / max) * 100, point.views > 0 ? 4 : 1)
          const visitorsHeight = Math.max(
            (point.visitors / max) * 100,
            point.visitors > 0 ? 4 : 1
          )
          const showLabel = index % 5 === 0 || index === data.length - 1

          return (
            <div key={point.date} className="group flex h-full flex-1 flex-col justify-end gap-1">
              <div
                className="flex h-full items-end justify-center gap-[2px]"
                title={`${point.date}: ${point.views} views, ${point.visitors} pengunjung`}
              >
                <div
                  className="w-full max-w-[10px] rounded-t-sm bg-text-primary/80 transition-opacity group-hover:opacity-100 sm:max-w-[14px]"
                  style={{ height: `${viewsHeight}%`, opacity: point.views > 0 ? 0.85 : 0.2 }}
                />
                <div
                  className="w-full max-w-[10px] rounded-t-sm bg-emerald-500/70 transition-opacity group-hover:opacity-100 sm:max-w-[14px]"
                  style={{ height: `${visitorsHeight}%`, opacity: point.visitors > 0 ? 0.8 : 0.15 }}
                />
              </div>
              <span className="h-4 text-center text-[9px] font-medium text-text-secondary">
                {showLabel
                  ? new Date(`${point.date}T00:00:00`).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                    })
                  : ''}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data, loading, error, reload } =
    useAdminData<AnalyticsData>('/api/admin/analytics')

  return (
    <div className="space-y-8">
      <PageHeader
        title="Monitoring Pengunjung"
        description="Lihat berapa orang yang membuka portofolio Anda, dari mana asalnya, dan halaman apa yang dibuka."
      >
        <button
          type="button"
          onClick={reload}
          className="inline-flex items-center gap-2 rounded-xl border border-text-secondary/20 bg-background/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-primary transition-colors hover:border-text-primary"
        >
          <Icon name="refresh" className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </PageHeader>

      <Card className="border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <Icon name="eye" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-blue-500" />
          <div className="text-xs leading-relaxed text-text-secondary">
            <p className="font-bold text-text-primary">Data pengunjung bersifat anonim.</p>
            <p className="mt-1">
              Yang tercatat hanya perangkat, perkiraan kota/negara, sumber kunjungan, dan halaman
              yang dibuka. Nama atau email asli tidak bisa diketahui kecuali pengunjung mengisi
              form kontak. Kunjungan Anda sendiri saat login admin tidak dihitung.
            </p>
          </div>
        </div>
      </Card>

      {error && (
        <Alert tone="error">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold transition-colors hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/40"
            >
              <Icon name="refresh" className="h-3.5 w-3.5" />
              Coba Lagi
            </button>
          </div>
        </Alert>
      )}

      {loading && !data ? (
        <Card>
          <LoadingState label="Menghitung data pengunjung..." />
        </Card>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Pengunjung 30 Hari"
              value={formatNumber(data.totals.visitors30d)}
              hint={`${formatNumber(data.totals.visitorsAll)} pengunjung total`}
              icon="user"
              accent="border-blue-500/20 bg-blue-500/10 text-blue-500"
            />
            <StatCard
              label="Page Views 30 Hari"
              value={formatNumber(data.totals.views30d)}
              hint={`${formatNumber(data.totals.viewsAll)} page views total`}
              icon="eye"
              accent="border-purple-500/20 bg-purple-500/10 text-purple-500"
            />
            <StatCard
              label="Hari Ini"
              value={formatNumber(data.totals.visitorsToday)}
              hint={`${formatNumber(data.totals.viewsToday)} page views hari ini`}
              icon="chart"
              accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              label="7 Hari Terakhir"
              value={formatNumber(data.totals.visitors7d)}
              hint={`${formatNumber(data.totals.views7d)} page views`}
              icon="sparkles"
              accent="border-amber-500/20 bg-amber-500/10 text-amber-500"
            />
          </div>

          <TrendChart data={data.daily} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-text-primary">Halaman Terpopuler</h2>
              <BreakdownList items={data.topPages} emptyLabel="Belum ada data halaman." formatLabel={pathLabel} />
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-text-primary">Sumber Kunjungan</h2>
              <BreakdownList items={data.sources} emptyLabel="Belum ada data sumber." />
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-text-primary">Perangkat</h2>
              <BreakdownList
                items={data.devices}
                emptyLabel="Belum ada data perangkat."
                formatLabel={(label) => `${deviceIcon(label)} ${label}`}
              />
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-text-primary">Negara</h2>
              <BreakdownList
                items={data.countries}
                emptyLabel="Belum ada data negara."
                formatLabel={(label) =>
                  label === 'Tidak diketahui' ? label : countryName(label)
                }
              />
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-text-primary">Kota</h2>
              <BreakdownList items={data.cities} emptyLabel="Belum ada data kota." />
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-text-primary">Browser</h2>
              <BreakdownList items={data.browsers} emptyLabel="Belum ada data browser." />
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-1 border-b border-text-secondary/15 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-text-primary">Pengunjung Terbaru</h2>
                <p className="mt-0.5 text-xs font-medium text-text-secondary">
                  30 pengunjung terakhir, diurutkan dari yang paling baru.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Diperbarui {exactTime(data.generatedAt)}
              </span>
            </div>

            {data.visitors.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="Belum ada pengunjung tercatat"
                description="Buka website publik dari perangkat lain atau mode incognito (tanpa login admin), lalu refresh halaman ini."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="border-b border-text-secondary/15 bg-thirdary/40 text-[10px] uppercase tracking-wider text-text-secondary dark:border-white/10">
                    <tr>
                      <th className="px-5 py-3 font-bold">Pengunjung</th>
                      <th className="px-4 py-3 font-bold">Lokasi</th>
                      <th className="px-4 py-3 font-bold">Perangkat</th>
                      <th className="px-4 py-3 font-bold">Sumber</th>
                      <th className="px-4 py-3 font-bold">Halaman Dibuka</th>
                      <th className="px-4 py-3 text-center font-bold">Views</th>
                      <th className="px-5 py-3 font-bold">Terakhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-text-secondary/10 dark:divide-white/5">
                    {data.visitors.map((visitor) => (
                      <tr
                        key={visitor.id}
                        className="transition-colors hover:bg-text-secondary/5"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-text-secondary/20 bg-text-secondary/10 font-mono text-[10px] font-black text-text-primary">
                              {shortVisitor(visitor.id)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-text-primary">
                                Visitor #{shortVisitor(visitor.id)}
                              </p>
                              <p
                                className="truncate text-[10px] text-text-secondary"
                                title={exactTime(visitor.firstSeen)}
                              >
                                Pertama: {timeAgo(visitor.firstSeen)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-text-primary">
                            {visitor.city || 'Kota tidak diketahui'}
                          </p>
                          <p className="text-[10px] text-text-secondary">
                            {countryName(visitor.country)}
                            {visitor.region ? ` · ${visitor.region}` : ''}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-text-primary">
                            {deviceIcon(visitor.device)} {visitor.device}
                          </p>
                          <p className="text-[10px] text-text-secondary">
                            {visitor.browser} · {visitor.os}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold',
                              sourceClass(visitor.source)
                            )}
                            title={visitor.referrer ?? 'Akses langsung'}
                          >
                            {visitor.source}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex max-w-[260px] flex-wrap gap-1">
                            {visitor.pages.slice(0, 2).map((page) => (
                              <span
                                key={page.path}
                                className="inline-flex max-w-[180px] items-center gap-1 rounded-md border border-text-secondary/15 bg-background px-1.5 py-0.5 font-mono text-[10px] text-text-secondary"
                                title={`${page.path} · ${page.views} views`}
                              >
                                <span className="truncate">{pathLabel(page.path)}</span>
                                <span className="font-bold text-text-primary">×{page.views}</span>
                              </span>
                            ))}
                            {visitor.pages.length > 2 && (
                              <span className="inline-flex items-center rounded-md bg-text-secondary/10 px-1.5 py-0.5 text-[10px] font-bold text-text-secondary">
                                +{visitor.pages.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-text-primary">
                          {formatNumber(visitor.views)}
                        </td>
                        <td className="px-5 py-3.5">
                          <p
                            className="font-semibold text-text-primary"
                            title={exactTime(visitor.lastSeen)}
                          >
                            {timeAgo(visitor.lastSeen)}
                          </p>
                          <p className="text-[10px] text-text-secondary">
                            {visitor.source === 'Direct' ? 'Akses langsung' : visitor.source}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : null}
    </div>
  )
}
