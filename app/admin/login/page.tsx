'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@/components/admin/icons'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = (await res.json()) as { error?: string; success?: boolean; username?: string }

      if (!res.ok) {
        setError(data.error || 'Username/email atau password salah.')
        setLoading(false)
      } else {
        setSuccessMsg(`Login berhasil! Selamat datang, ${data.username || 'Admin'}.`)
        setTimeout(() => {
          router.push('/admin/dashboard')
          router.refresh()
        }, 800)
      }
    } catch {
      setError('Gagal menghubungi server. Pastikan database dan server berjalan.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden selection:bg-text-primary selection:text-background transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Top Navbar / Back Link */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary transition-colors py-2 group"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          <span>Kembali ke Website</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="relative rounded-3xl border border-text-secondary/15 dark:border-white/10 bg-background/80 dark:bg-[#0c0c0e]/80 backdrop-blur-2xl p-8 sm:p-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_16px_48px_-12px_rgba(0,0,0,0.8)]">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 mb-4 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] text-text-secondary bg-text-secondary/10 border border-text-secondary/15">
              Secure Control Center
            </span>
            <h1 className="text-3xl font-black text-text-primary tracking-tighter">
              PORTFOLIO.<span className="text-text-secondary font-mono text-lg">ADMIN</span>
            </h1>
            <p className="text-xs text-text-secondary font-medium mt-2">
              Masuk untuk mengelola data portofolio Afcha Arel Pratama
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black">
                <Icon name="check" className="h-3.5 w-3.5 stroke-[3]" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Akses Diterima</p>
                <p className="text-xs font-medium text-emerald-300/90 mt-0.5">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                <Icon name="alert" className="h-3.5 w-3.5 stroke-[3]" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Autentikasi Gagal</p>
                <p className="text-xs font-medium text-red-300/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Username atau Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full rounded-2xl border border-text-secondary/20 dark:border-white/10 bg-background/60 dark:bg-black/30 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/40 shadow-sm outline-none transition focus:border-text-primary focus:ring-1 focus:ring-text-primary/30"
                  placeholder="admin atau afchaarelpratama@gmail.com"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-2xl border border-text-secondary/20 dark:border-white/10 bg-background/60 dark:bg-black/30 px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-secondary/40 shadow-sm outline-none transition focus:border-text-primary focus:ring-1 focus:ring-text-primary/30"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || Boolean(successMsg)}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-text-primary text-background px-6 py-3.5 text-sm font-black tracking-wider uppercase transition-all duration-300 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  <span>Memverifikasi...</span>
                </>
              ) : successMsg ? (
                <span>Membuka Dashboard...</span>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-8 pt-6 border-t border-text-secondary/15 text-center">
            <p className="text-[11px] text-text-secondary font-medium">
              Akun admin dikonfigurasi melalui <code>.env</code> & database seed.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto text-center z-10">
        <p className="text-xs text-text-secondary">
          © {new Date().getFullYear()} Afcha Arel Pratama. All rights reserved.
        </p>
      </div>
    </div>
  )
}
