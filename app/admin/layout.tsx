'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icon, type IconName } from '@/components/admin/icons'
import { cn } from '@/components/admin/ui'
import { ToastProvider } from '@/components/admin/ToastContext'

const navItems: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/analytics', label: 'Pengunjung', icon: 'chart' },
  { href: '/admin/profile', label: 'Profil Saya', icon: 'user' },
  { href: '/admin/projects', label: 'Karya / Proyek', icon: 'rocket' },
  { href: '/admin/experiences', label: 'Pengalaman', icon: 'briefcase' },
  { href: '/admin/educations', label: 'Pendidikan', icon: 'academic' },
  { href: '/admin/achievements', label: 'Pencapaian & Jurnal', icon: 'trophy' },
  { href: '/admin/certificates', label: 'Sertifikat', icon: 'certificate' },
  { href: '/admin/tech-stack', label: 'Tech Stack', icon: 'stack' },
  { href: '/admin/socials', label: 'Sosial Media', icon: 'globe' },
  { href: '/admin/roles', label: 'Roles & Stats', icon: 'tag' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored ? stored === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', isDark)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  if (pathname === '/admin/login') {
    return <ToastProvider>{children}</ToastProvider>
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
    } finally {
      router.push('/admin/login')
      router.refresh()
    }
  }

  const currentPage =
    navItems.find(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/')
    )?.label ?? 'Dashboard'

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-text-primary transition-colors duration-300">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border-r border-text-secondary/15 dark:border-white/10 transition-transform duration-300 ease-out lg:translate-x-0',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-text-secondary/15 dark:border-white/10 px-6 py-5">
            <Link href="/admin/dashboard" className="flex flex-col">
              <span className="text-xl font-black text-text-primary tracking-tighter">
                PORTFOLIO.<span className="text-text-secondary font-mono text-sm">ADMIN</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                Afcha Arel Pratama
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="rounded-lg p-1.5 text-text-secondary hover:bg-text-secondary/10 hover:text-text-primary lg:hidden"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
              Navigasi Admin
            </p>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-text-secondary/15 text-text-primary font-bold shadow-sm border border-text-secondary/20 dark:border-white/10'
                      : 'text-text-secondary hover:bg-text-secondary/10 hover:text-text-primary'
                  )}
                >
                  <Icon
                    name={item.icon}
                    className={cn(
                      'h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-text-primary shadow-[0_0_8px_currentColor]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="space-y-2 border-t border-text-secondary/15 dark:border-white/10 p-4">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-text-secondary/10 transition-colors"
            >
              <Icon name="external" className="h-4 w-4" />
              <span>Lihat Website Publik</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Icon name="logout" className="h-4 w-4" />
              <span>{loggingOut ? 'Memproses Keluar...' : 'Keluar (Logout)'}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-text-secondary/15 dark:border-white/10 bg-background/80 dark:bg-[#0c0c0e]/80 backdrop-blur-2xl px-4 sm:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Buka menu navigasi"
                className="rounded-xl p-2 text-text-secondary hover:bg-text-secondary/10 hover:text-text-primary lg:hidden"
              >
                <Icon name="menu" className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                  Panel Kontrol
                </p>
                <h1 className="truncate text-base font-black tracking-tight text-text-primary">
                  {currentPage}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
                className="rounded-full p-2 text-text-secondary hover:text-text-primary hover:bg-text-secondary/10 transition-colors"
              >
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-4.5 w-4.5" />
              </button>
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
