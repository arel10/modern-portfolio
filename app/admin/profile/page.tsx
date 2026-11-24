'use client'

import { useState } from 'react'
import { adminFetch, getErrorMessage, useAdminData } from '@/components/admin/api'
import { Icon } from '@/components/admin/icons'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { resolveMapsEmbedUrl } from '@/lib/maps'
import { useToast } from '@/components/admin/ToastContext'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Textarea,
} from '@/components/admin/ui'
import type { Profile } from '@/components/admin/types'

type Notice = { tone: 'success' | 'error'; text: string } | null

interface ProfileForm {
  full_name: string
  short_name: string
  bio: string
  avatar_url: string
  cv_url: string
  place_of_birth: string
  phone: string
  email: string
  gpa: string
  education: string
  location_name: string
  location_city: string
  maps_embed_url: string
  who_am_i: string
  my_approach: string
}

function toForm(profile: Profile): ProfileForm {
  return {
    full_name: profile.full_name ?? '',
    short_name: profile.short_name ?? '',
    bio: profile.bio ?? '',
    avatar_url: profile.avatar_url ?? '',
    cv_url: profile.cv_url ?? '',
    place_of_birth: profile.place_of_birth ?? '',
    phone: profile.phone ?? '',
    email: profile.email ?? '',
    gpa: profile.gpa ?? '',
    education: profile.education ?? '',
    location_name: profile.location_name ?? '',
    location_city: profile.location_city ?? '',
    maps_embed_url: profile.maps_embed_url ?? '',
    who_am_i: profile.who_am_i ?? '',
    my_approach: profile.my_approach ?? '',
  }
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: 'user' | 'link' | 'globe' | 'sparkles'
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-text-secondary/15 bg-thirdary/40 text-text-primary dark:border-white/10">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-text-primary">{title}</h2>
          <p className="text-xs font-medium text-text-secondary">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  )
}

function ProfileEditor({ initial }: { initial: Profile }) {
  const toast = useToast()
  const [form, setForm] = useState<ProfileForm>(() => toForm(initial))
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [failedSrc, setFailedSrc] = useState('')

  const previewMapsUrl = resolveMapsEmbedUrl(form.maps_embed_url)

  function set<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      await adminFetch<Profile>('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify({ id: initial.id, ...form }),
      })
      const successMessage = 'Profil berhasil disimpan dan diperbarui di website!'
      setNotice({ tone: 'success', text: successMessage })
      toast.success(successMessage)
    } catch (error) {
      const err = getErrorMessage(error)
      setNotice({ tone: 'error', text: err })
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  const showAvatar = Boolean(form.avatar_url) && failedSrc !== form.avatar_url
  const initials =
    form.full_name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'A'

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-6">
        {notice && (
          <Alert tone={notice.tone} onClose={() => setNotice(null)}>
            {notice.text}
          </Alert>
        )}

        <FormSection
          icon="user"
          title="Identitas"
          description="Informasi utama yang tampil di hero dan bagian tentang."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama lengkap" required>
              <Input
                value={form.full_name}
                onChange={(event) => set('full_name', event.target.value)}
                placeholder="Afcha Arel Pratama"
                required
              />
            </Field>
            <Field label="Nama panggilan" required>
              <Input
                value={form.short_name}
                onChange={(event) => set('short_name', event.target.value)}
                placeholder="Afcha"
                required
              />
            </Field>
            <Field label="Bio" required className="sm:col-span-2">
              <Textarea
                value={form.bio}
                onChange={(event) => set('bio', event.target.value)}
                rows={4}
                placeholder="Ceritakan singkat tentang dirimu..."
                required
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon="link"
          title="Kontak & Pendidikan"
          description="Detail kontak dan latar belakang pendidikan."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(event) => set('email', event.target.value)}
                placeholder="nama@email.com"
              />
            </Field>
            <Field label="Telepon">
              <Input
                value={form.phone}
                onChange={(event) => set('phone', event.target.value)}
                placeholder="+62..."
              />
            </Field>
            <Field label="Tempat lahir">
              <Input
                value={form.place_of_birth}
                onChange={(event) => set('place_of_birth', event.target.value)}
                placeholder="Bukittinggi, Indonesia"
              />
            </Field>
            <Field label="GPA / IPK">
              <Input
                value={form.gpa}
                onChange={(event) => set('gpa', event.target.value)}
                placeholder="3.44"
              />
            </Field>
            <Field label="Pendidikan" className="sm:col-span-2">
              <Input
                value={form.education}
                onChange={(event) => set('education', event.target.value)}
                placeholder="D4 Software Engineer — Politeknik Negeri Padang"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon="globe"
          title="Lokasi"
          description="Digunakan pada bagian kontak dan peta."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama lokasi">
              <Input
                value={form.location_name}
                onChange={(event) => set('location_name', event.target.value)}
                placeholder="Politeknik Negeri Padang"
              />
            </Field>
            <Field label="Kota">
              <Input
                value={form.location_city}
                onChange={(event) => set('location_city', event.target.value)}
                placeholder="Padang, Indonesia"
              />
            </Field>
            <Field
              label="URL / kode embed Google Maps"
              hint="Bisa tempel link share dari Google Maps (termasuk maps.app.goo.gl), kode <iframe>, atau URL embed. Otomatis dikonversi agar tampil di website."
              className="sm:col-span-2"
            >
              <Input
                value={form.maps_embed_url}
                onChange={(event) => set('maps_embed_url', event.target.value)}
                placeholder="https://www.google.com/maps/place/... atau https://maps.google.com/maps?...&output=embed"
              />
              {previewMapsUrl ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-text-secondary/20">
                  <iframe
                    src={previewMapsUrl}
                    title="Pratinjau lokasi"
                    className="h-44 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                <p className="mt-2 text-[11px] font-medium text-text-secondary">
                  Pratinjau peta akan muncul di sini setelah URL diisi.
                </p>
              )}
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon="sparkles"
          title="Tentang Saya"
          description="Narasi yang tampil pada bagian About."
        >
          <div className="grid gap-4">
            <Field label="Who am I">
              <Textarea
                value={form.who_am_i}
                onChange={(event) => set('who_am_i', event.target.value)}
                rows={5}
                placeholder="Jelaskan siapa dirimu..."
              />
            </Field>
            <Field label="My approach">
              <Textarea
                value={form.my_approach}
                onChange={(event) => set('my_approach', event.target.value)}
                rows={5}
                placeholder="Pendekatan kerja yang kamu gunakan..."
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon="link"
          title="Foto Profil & CV"
          description="Foto avatar dan file resume yang digunakan di seluruh situs."
        >
          <div className="grid gap-6">
            <ImageUpload
              label="Foto Avatar / Profil Utama"
              hint="Unggah foto Anda untuk bagian Hero dan About. Bebas ukuran dari HP/kamera, otomatis dikompres oleh server."
              value={form.avatar_url}
              onChange={(url) => set('avatar_url', url)}
            />

            <ImageUpload
              label="File CV / Resume"
              hint="Unggah file CV/Resume dalam bentuk PDF atau Gambar dokumen."
              value={form.cv_url}
              onChange={(url) => set('cv_url', url)}
              allowPdf
              accept=".pdf,application/pdf,image/*"
            />
          </div>
        </FormSection>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setForm(toForm(initial))
              setNotice(null)
            }}
            disabled={saving}
          >
            <Icon name="refresh" className="h-4 w-4" />
            Reset
          </Button>
          <Button type="submit" loading={saving}>
            <Icon name="save" className="h-4 w-4" />
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card className="overflow-hidden">
          <div className="h-20 bg-gradient-to-br from-text-primary/20 via-text-secondary/10 to-background dark:from-white/10 dark:via-white/5 dark:to-transparent" />
          <div className="-mt-10 px-5 pb-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-thirdary text-xl font-bold text-text-primary shadow-md">
              {showAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.avatar_url}
                  alt={form.full_name}
                  className="h-full w-full object-cover"
                  onError={() => setFailedSrc(form.avatar_url)}
                />
              ) : (
                initials
              )}
            </div>
            <h3 className="mt-3 text-lg font-bold text-text-primary">
              {form.full_name || 'Nama lengkap'}
            </h3>
            <p className="text-sm font-medium text-text-secondary">
              {form.short_name ? `@${form.short_name}` : 'Nama panggilan'}
            </p>
            <p className="mt-3 line-clamp-4 text-xs font-medium leading-relaxed text-text-secondary">
              {form.bio || 'Bio akan tampil di sini.'}
            </p>

            <dl className="mt-4 space-y-2 border-t border-text-secondary/15 pt-4 text-xs dark:border-white/10">
              <div className="flex items-start gap-2">
                <Icon name="link" className="mt-0.5 h-3.5 w-3.5 text-text-secondary" />
                <span className="min-w-0 break-all text-text-secondary">
                  {form.email || 'Email belum diisi'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="user" className="mt-0.5 h-3.5 w-3.5 text-text-secondary" />
                <span className="min-w-0 break-all text-text-secondary">
                  {form.phone || 'Telepon belum diisi'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="globe" className="mt-0.5 h-3.5 w-3.5 text-text-secondary" />
                <span className="min-w-0 break-words text-text-secondary">
                  {form.location_city || form.location_name || 'Lokasi belum diisi'}
                </span>
              </div>
            </dl>

            {form.cv_url && (
              <a
                href={form.cv_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-text-secondary/20 px-3 py-2 text-xs font-bold text-text-primary transition hover:bg-text-secondary/10 dark:border-white/15 dark:hover:bg-white/5"
              >
                <Icon name="eye" className="h-4 w-4" />
                Lihat CV
              </a>
            )}
          </div>
        </Card>

        <div className="rounded-2xl border border-text-secondary/15 bg-thirdary/30 p-4 text-xs font-medium leading-relaxed text-text-secondary dark:border-white/10 dark:bg-white/[0.02]">
          <p className="flex items-center gap-2 font-bold text-text-primary">
            <Icon name="sparkles" className="h-4 w-4" />
            Tips
          </p>
          <p className="mt-1.5">
            Perubahan langsung tersimpan ke database setelah tombol simpan ditekan.
            Halaman publik akan otomatis diperbarui.
          </p>
        </div>
      </aside>
    </form>
  )
}

export default function ProfilePage() {
  const { data, loading, error, reload } = useAdminData<Profile | null>(
    '/api/admin/profile'
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Kelola informasi utama yang tampil di halaman portofolio."
      />

      {error && (
        <Alert tone="error">
          {error}
          <div className="mt-2">
            <Button size="sm" variant="secondary" onClick={reload}>
              <Icon name="refresh" className="h-4 w-4" />
              Coba lagi
            </Button>
          </div>
        </Alert>
      )}

      {loading ? (
        <Card>
          <LoadingState label="Memuat profil..." />
        </Card>
      ) : data ? (
        <ProfileEditor key={data.id} initial={data} />
      ) : !error ? (
        <Card>
          <EmptyState
            icon="user"
            title="Profil belum tersedia"
            description="Tambahkan satu baris data profil pada tabel profile agar halaman ini dapat digunakan."
          />
        </Card>
      ) : null}
    </div>
  )
}
