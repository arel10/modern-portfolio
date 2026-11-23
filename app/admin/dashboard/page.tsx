'use client'

import Link from 'next/link'
import { useAdminData } from '@/components/admin/api'
import { Icon, type IconName } from '@/components/admin/icons'
import { Alert, Card, LoadingState, PageHeader, cn } from '@/components/admin/ui'
import type { DashboardStats } from '@/components/admin/types'

const statCards: {
  key: keyof DashboardStats
  label: string
  description: string
  href: string
  accent: string
}[] = [
    {
      key: 'projects',
      label: 'Karya / Proyek',
      description: 'Tampil di section Selected Works',
      href: '/admin/projects',
      accent: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    },
    {
      key: 'experiences',
      label: 'Pengalaman',
      description: 'Riwayat pekerjaan & magang',
      href: '/admin/experiences',
      accent: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
    },
    {
      key: 'educations',
      label: 'Pendidikan',
      description: 'Almamater & riwayat akademik',
      href: '/admin/educations',
      accent: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    },
    {
      key: 'achievements',
      label: 'Pencapaian & Jurnal',
      description: 'Publikasi ilmiah & juara lomba',
      href: '/admin/achievements',
      accent: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    },
    {
      key: 'certificates',
      label: 'Sertifikat & Lisensi',
      description: 'Sertifikasi profesional terverifikasi',
      href: '/admin/certificates',
      accent: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
    },
    {
      key: 'techItems',
      label: 'Teknologi',
      description: 'Item teknologi pada stack',
      href: '/admin/tech-stack',
      accent: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    },
    {
      key: 'techCategories',
      label: 'Kategori Tech',
      description: 'Grup klasifikasi teknologi',
      href: '/admin/tech-stack',
      accent: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20',
    },
    {
      key: 'socials',
      label: 'Sosial Media',
      description: 'Tautan profil & kontak sosial',
      href: '/admin/socials',
      accent: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    },
    {
      key: 'roles',
      label: 'Role Hero',
      description: 'Teks typewriter di bagian hero',
      href: '/admin/roles',
      accent: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    },
    {
      key: 'quickStats',
      label: 'Quick Stats',
      description: 'Statistik kecil di banner hero',
      href: '/admin/roles',
      accent: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
    },
  ]

const quickActions: { href: string; label: string; icon: IconName; description: string }[] = [
  {
    href: '/admin/profile',
    label: 'Edit Profil & Bio',
    icon: 'user',
    description: 'Nama, bio, foto avatar, kontak, dan CV',
  },
  {
    href: '/admin/projects',
    label: 'Kelola Proyek',
    icon: 'rocket',
    description: 'Tambah karya baru dan unggah foto sampul',
  },
  {
    href: '/admin/experiences',
    label: 'Riwayat Karier',
    icon: 'briefcase',
    description: 'Update pengalaman kerja & skill terkait',
  },
  {
    href: '/admin/educations',
    label: 'Riwayat Pendidikan',
    icon: 'academic',
    description: 'Kelola almamater, foto kampus, dan IPK',
  },
  {
    href: '/admin/achievements',
    label: 'Pencapaian & Jurnal',
    icon: 'trophy',
    description: 'Kelola publikasi jurnal, juara lomba, dan bukti foto',
  },
  {
    href: '/admin/certificates',
    label: 'Sertifikat & Lisensi',
    icon: 'certificate',
    description: 'Kelola sertifikat profesional dan link verifikasi',
  },
  {
    href: '/admin/tech-stack',
    label: 'Tech Stack & Ikon',
    icon: 'stack',
    description: 'Unggah logo svg dan kategori teknologi',
  },
]

export default function DashboardPage() {
  const { data, loading, error, reload } = useAdminData<DashboardStats>(
    '/api/admin/dashboard'
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Ringkasan Portofolio"
        description="Pantau status konten dan kelola seluruh informasi portofolio Anda secara real-time."
      >
      </PageHeader>

      {error && (
        <Alert tone="error">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-800 px-3 py-1 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <Icon name="refresh" className="h-3.5 w-3.5" />
              Muat Ulang
            </button>
          </div>
        </Alert>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-text-secondary/15 dark:border-white/10 bg-background/60 dark:bg-[#0c0c0e]/80 backdrop-blur-2xl p-6 sm:p-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_36px_-12px_rgba(0,0,0,0.5)]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">

          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
            Afcha Arel Pratama
          </h2>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed font-medium">
            Setiap perubahan data yang Anda simpan di panel admin ini akan langsung ter-update secara otomatis di halaman publik portofolio tanpa perlu refresh manual.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-text-primary text-background px-5 py-2.5 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-md"
            >
              <Icon name="user" className="h-4 w-4" />
              <span>Edit Profil & Foto</span>
            </Link>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-text-secondary/20 hover:border-text-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-text-primary bg-background/50 transition-all"
            >
              <Icon name="plus" className="h-4 w-4" />
              <span>Tambah Proyek</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Statistics */}
      <div>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
            Statistik Konten
          </p>
          <h3 className="text-xl font-black text-text-primary tracking-tight">
            Data Terpublikasi
          </h3>
        </div>

        {loading ? (
          <Card className="p-8">
            <LoadingState label="Memuat ringkasan data portofolio..." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <Link
                key={card.key}
                href={card.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-text-secondary/15 dark:border-white/10 bg-background/60 dark:bg-[#121215]/60 backdrop-blur-xl p-5 transition-all duration-300 hover:border-text-primary/50 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mt-5">
                  <p className="text-4xl font-black tracking-tight text-text-primary">
                    {data ? data[card.key] : '—'}
                  </p>
                  <p className="mt-1 text-sm font-bold text-text-primary">
                    {card.label}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                    {card.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-text-primary">Pintasan Manajemen</h3>
            <p className="text-xs text-text-secondary">Akses cepat ke bagian yang paling sering diperbarui.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.href + action.label}
              href={action.href}
              className="group flex items-center gap-4 rounded-2xl border border-text-secondary/15 dark:border-white/10 p-4 transition-all duration-200 hover:border-text-primary/50 hover:bg-text-secondary/5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-text-secondary/10 text-text-primary transition-transform group-hover:scale-110">
                <Icon name={action.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-text-primary group-hover:text-text-primary">
                  {action.label}
                </span>
                <span className="block truncate text-xs text-text-secondary mt-0.5">
                  {action.description}
                </span>
              </div>
              <Icon
                name="chevronRight"
                className="h-4 w-4 shrink-0 text-text-secondary group-hover:text-text-primary group-hover:translate-x-1 transition-all"
              />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
