'use client'

import Link from 'next/link'
import { useAdminData } from '@/components/admin/api'
import { Icon, type IconName } from '@/components/admin/icons'
import {
  Alert,
  Card,
  LoadingState,
  PageHeader,
  cn,
} from '@/components/admin/ui'
import type { DashboardData, DashboardStats } from '@/components/admin/types'

const numberFormatter = new Intl.NumberFormat('id-ID')

function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
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

function countryLabel(code: string | null): string {
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

function deviceIcon(device: string): string {
  if (device === 'Mobile') return '📱'
  if (device === 'Tablet') return '💻'
  return '🖥️'
}

function dayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

type StatKey = Exclude<keyof DashboardStats, 'active'>

const contentConfig: {
  key: StatKey
  label: string
  description: string
  href: string
  icon: IconName
  accent: string
}[] = [
  {
    key: 'projects',
    label: 'Karya / Proyek',
    description: 'Selected Works',
    href: '/admin/projects',
    icon: 'rocket',
    accent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  {
    key: 'experiences',
    label: 'Pengalaman',
    description: 'Karier & magang',
    href: '/admin/experiences',
    icon: 'briefcase',
    accent: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  {
    key: 'organizations',
    label: 'Organisasi',
    description: 'Komunitas & kepanitiaan',
    href: '/admin/organizations',
    icon: 'organization',
    accent: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  },
  {
    key: 'educations',
    label: 'Pendidikan',
    description: 'Almamater & akademik',
    href: '/admin/educations',
    icon: 'academic',
    accent: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    key: 'achievements',
    label: 'Pencapaian & Jurnal',
    description: 'Prestasi & publikasi',
    href: '/admin/achievements',
    icon: 'trophy',
    accent: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    key: 'certificates',
    label: 'Sertifikat',
    description: 'Kredensial & lisensi',
    href: '/admin/certificates',
    icon: 'certificate',
    accent: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  {
    key: 'techItems',
    label: 'Teknologi',
    description: 'Item tech stack',
    href: '/admin/tech-stack',
    icon: 'stack',
    accent: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  },
  {
    key: 'socials',
    label: 'Sosial Media',
    description: 'Tautan kontak',
    href: '/admin/socials',
    icon: 'globe',
    accent: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
  {
    key: 'roles',
    label: 'Role Hero',
    description: 'Teks typewriter',
    href: '/admin/roles',
    icon: 'tag',
    accent: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20',
  },
  {
    key: 'quickStats',
    label: 'Quick Stats',
    description: 'Statistik hero',
    href: '/admin/roles',
    icon: 'sparkles',
    accent: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
]

const quickActions: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin/projects', label: 'Tambah Proyek', icon: 'rocket' },
  { href: '/admin/organizations', label: 'Tambah Organisasi', icon: 'organization' },
  { href: '/admin/experiences', label: 'Tambah Pengalaman', icon: 'briefcase' },
  { href: '/admin/certificates', label: 'Tambah Sertifikat', icon: 'certificate' },
  { href: '/admin/profile', label: 'Edit Profil', icon: 'user' },
  { href: '/admin/tech-stack', label: 'Kelola Tech Stack', icon: 'stack' },
]

function AnalyticsCard({
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
    <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-text-primary tabular-nums">
            {value}
          </p>
          <p className="mt-1 truncate text-xs font-medium text-text-secondary">
            {hint}
          </p>
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

export default function DashboardPage() {
  const { data, loading, error, reload } = useAdminData<DashboardData>(
    '/api/admin/dashboard'
  )

  const stats = data?.stats
  const analytics = data?.analytics
  const daily = data?.daily ?? []
  const topPages = data?.topPages ?? []
  const visitors = data?.recentVisitors ?? []
  const profile = data?.profile

  const displayName = profile?.full_name ?? 'Afcha Arel Pratama'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A'

  const maxDaily = Math.max(...daily.map((point) => point.views), 1)
  const totalDailyViews = daily.reduce((sum, point) => sum + point.views, 0)
  const averageDaily = daily.length > 0 ? Math.round(totalDailyViews / daily.length) : 0
  const maxPageViews = Math.max(...topPages.map((page) => page.views), 1)

  const contentItems = stats
    ? contentConfig.map((item) => ({
        ...item,
        count: stats[item.key],
        active: stats.active[item.key],
      }))
    : []
  const filledSections = contentItems.filter((item) => item.count > 0).length
  const completeness =
    contentItems.length > 0
      ? Math.round((filledSections / contentItems.length) * 100)
      : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan konten, performa website, dan aktivitas pengunjung dalam satu tempat."
      >
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-text-secondary/20 bg-background px-4 py-2.5 text-xs font-bold text-text-primary transition-colors hover:bg-text-secondary/10 dark:border-white/15"
        >
          <Icon name="external" className="h-4 w-4" />
          Lihat Website
        </Link>
      </PageHeader>

      {error && (
        <Alert tone="error">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold transition-colors hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/40"
            >
              <Icon name="refresh" className="h-3.5 w-3.5" />
              Muat Ulang
            </button>
          </div>
        </Alert>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-text-secondary/15 bg-background/60 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_36px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c0c0e]/80 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-text-secondary/20 bg-text-secondary/10 text-xl font-black text-text-primary shadow-inner dark:border-white/15">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                Selamat datang kembali
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
                {displayName}
              </h2>
              <p className="mt-1 text-sm font-medium text-text-secondary">
                Semua perubahan langsung tampil di website publik.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-text-primary px-4 py-2.5 text-xs font-black uppercase tracking-wider text-background shadow-md transition-opacity hover:opacity-90"
            >
              <Icon name="user" className="h-4 w-4" />
              Edit Profil
            </Link>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-text-secondary/20 bg-background/50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-text-primary transition-colors hover:border-text-primary"
            >
              <Icon name="plus" className="h-4 w-4" />
              Tambah Proyek
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Website Online
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-text-secondary/15 bg-text-secondary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            <Icon name="chart" className="h-3.5 w-3.5" />
            Analitik Aktif
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-text-secondary/15 bg-text-secondary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            {stats
              ? `${filledSections}/${contentItems.length} bagian terisi`
              : 'Memuat ringkasan…'}
          </span>
        </div>
      </div>

      {/* Analytics */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
              Performa Website
            </p>
            <h3 className="text-lg font-black tracking-tight text-text-primary">
              Statistik Pengunjung
            </h3>
          </div>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary transition-colors hover:text-text-primary"
          >
            Detail
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsCard
            label="Pengunjung Hari Ini"
            value={analytics ? formatNumber(analytics.visitorsToday) : '—'}
            hint={
              analytics
                ? `${formatNumber(analytics.viewsToday)} tayangan halaman`
                : 'Menunggu data analitik'
            }
            icon="user"
            accent="bg-blue-500/10 text-blue-500 border-blue-500/20"
          />
          <AnalyticsCard
            label="7 Hari Terakhir"
            value={analytics ? formatNumber(analytics.visitors7d) : '—'}
            hint={
              analytics
                ? `${formatNumber(analytics.views7d)} tayangan halaman`
                : 'Menunggu data analitik'
            }
            icon="chart"
            accent="bg-purple-500/10 text-purple-500 border-purple-500/20"
          />
          <AnalyticsCard
            label="30 Hari Terakhir"
            value={analytics ? formatNumber(analytics.visitors30d) : '—'}
            hint={
              analytics
                ? `${formatNumber(analytics.views30d)} tayangan halaman`
                : 'Menunggu data analitik'
            }
            icon="sparkles"
            accent="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          />
          <AnalyticsCard
            label="Total Kunjungan"
            value={analytics ? formatNumber(analytics.viewsAll) : '—'}
            hint={
              analytics
                ? `${formatNumber(analytics.visitorsAll)} pengunjung unik`
                : 'Menunggu data analitik'
            }
            icon="globe"
            accent="bg-amber-500/10 text-amber-500 border-amber-500/20"
          />
        </div>
      </div>

      {/* Chart + Top Pages */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Tren 14 Hari
              </h3>
              <p className="mt-0.5 text-xs font-medium text-text-secondary">
                Tayangan halaman per hari
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black tracking-tight text-text-primary tabular-nums">
                {formatNumber(totalDailyViews)}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                Rata-rata {formatNumber(averageDaily)}/hari
              </p>
            </div>
          </div>

          {loading && daily.length === 0 ? (
            <LoadingState label="Memuat tren..." />
          ) : daily.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-text-secondary/20 px-4 py-8 text-center text-sm font-medium text-text-secondary">
              Belum ada data kunjungan.
            </p>
          ) : (
            <div className="mt-6">
              <div className="flex h-36 items-end gap-1.5 sm:gap-2">
                {daily.map((point) => {
                  const height = Math.max((point.views / maxDaily) * 100, 3)
                  return (
                    <div
                      key={point.date}
                      className="group flex h-full flex-1 flex-col justify-end"
                      title={`${dayLabel(point.date)} · ${point.views} tayangan · ${point.visitors} pengunjung`}
                    >
                      <div
                        className="w-full rounded-t-md bg-text-primary/80 transition-all duration-300 group-hover:bg-text-primary"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 flex gap-1.5 sm:gap-2">
                {daily.map((point, index) => (
                  <span
                    key={point.date}
                    className="flex-1 text-center text-[8px] font-bold uppercase tracking-wide text-text-secondary/70 sm:text-[9px]"
                  >
                    {index % 2 === 0 ? dayLabel(point.date) : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Halaman Populer
              </h3>
              <p className="mt-0.5 text-xs font-medium text-text-secondary">
                Paling banyak dibuka
              </p>
            </div>
            <Icon name="eye" className="h-4 w-4 text-text-secondary" />
          </div>

          {topPages.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-text-secondary/20 px-4 py-8 text-center text-sm font-medium text-text-secondary">
              Belum ada data halaman.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {topPages.map((page) => (
                <div key={page.label}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-xs font-bold text-text-primary">
                      {pathLabel(page.label)}
                    </span>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-text-secondary">
                      {formatNumber(page.views)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-text-secondary/10">
                    <div
                      className="h-full rounded-full bg-text-primary/70"
                      style={{ width: `${Math.max((page.views / maxPageViews) * 100, 6)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Content + Recent Visitors */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 sm:p-6 lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Kesehatan Konten
              </h3>
              <p className="mt-0.5 text-xs font-medium text-text-secondary">
                Kelengkapan data yang tampil di portofolio
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black tracking-tight text-text-primary tabular-nums">
                {stats ? `${completeness}%` : '—'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                {stats ? `${filledSections}/${contentItems.length} bagian` : 'Memuat…'}
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-text-secondary/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
              style={{ width: `${completeness}%` }}
            />
          </div>

          {loading && !stats ? (
            <LoadingState label="Memuat konten..." />
          ) : (
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {contentItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 transition-colors hover:border-text-secondary/15 hover:bg-text-secondary/5 dark:hover:border-white/10"
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                      item.accent
                    )}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-text-primary">
                      {item.label}
                    </p>
                    <p className="truncate text-[10px] font-medium text-text-secondary">
                      {item.active} aktif · {item.count} total
                    </p>
                  </div>
                  <span className="text-sm font-black tabular-nums text-text-primary">
                    {item.count}
                  </span>
                  <Icon
                    name="chevronRight"
                    className="h-3.5 w-3.5 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary"
                  />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Pengunjung Terbaru
              </h3>
              <p className="mt-0.5 text-xs font-medium text-text-secondary">
                Aktivitas terakhir di website
              </p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs font-bold text-text-secondary transition-colors hover:text-text-primary"
            >
              Semua
            </Link>
          </div>

          {loading && visitors.length === 0 ? (
            <LoadingState label="Memuat pengunjung..." />
          ) : visitors.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-text-secondary/20 px-4 py-8 text-center text-sm font-medium text-text-secondary">
              Belum ada pengunjung tercatat.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-text-secondary/10">
              {visitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-text-secondary/15 bg-text-secondary/5 text-sm dark:border-white/10">
                    {deviceIcon(visitor.device)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-text-primary">
                      {visitor.city
                        ? `${visitor.city}, ${countryLabel(visitor.country)}`
                        : countryLabel(visitor.country)}
                    </p>
                    <p className="truncate text-[10px] font-medium text-text-secondary">
                      {visitor.source} · {visitor.browser}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold text-text-secondary">
                      {timeAgo(visitor.lastSeen)}
                    </p>
                    <p className="font-mono text-[9px] text-text-secondary/60">
                      #{shortVisitor(visitor.id)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-text-primary">
            Pintasan Cepat
          </h3>
          <p className="text-xs text-text-secondary">
            Akses langsung ke pengelolaan konten yang sering diperbarui.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href + action.label}
              href={action.href}
              className="group flex items-center gap-2.5 rounded-xl border border-text-secondary/15 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/40 hover:bg-text-secondary/5 dark:border-white/10"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-text-secondary/10 text-text-primary transition-transform group-hover:scale-110">
                <Icon name={action.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-bold text-text-primary">
                {action.label}
              </span>
              <Icon
                name="chevronRight"
                className="h-3.5 w-3.5 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary"
              />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
