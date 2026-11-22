'use client'

import { useState } from 'react'
import {
  adminFetch,
  getErrorMessage,
  listToText,
  parseList,
  useAdminData,
} from '@/components/admin/api'
import { Icon } from '@/components/admin/icons'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { useToast } from '@/components/admin/ToastContext'
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Textarea,
  Toggle,
} from '@/components/admin/ui'
import type { Project } from '@/components/admin/types'

type Notice = { tone: 'success' | 'error'; text: string } | null

interface ProjectFormState {
  title: string
  short_description: string
  full_description: string
  image_path: string
  created_at_label: string
  tech: string
  features: string
  github_url: string
  live_demo_url: string
  is_private_repo: boolean
  sort_order: string
  is_active: boolean
}

function toForm(item?: Project): ProjectFormState {
  return {
    title: item?.title ?? '',
    short_description: item?.short_description ?? '',
    full_description: item?.full_description ?? '',
    image_path: item?.image_path ?? '',
    created_at_label: item?.created_at_label ?? '',
    tech: listToText(item?.tech),
    features: listToText(item?.features),
    github_url: item?.github_url ?? '',
    live_demo_url: item?.live_demo_url ?? '',
    is_private_repo: item?.is_private_repo ?? false,
    sort_order: String(item?.sort_order ?? 0),
    is_active: item?.is_active ?? true,
  }
}

function ProjectThumb({
  src,
  title,
  className = 'h-24 w-32',
}: {
  src: string
  title: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 ${className}`}
      >
        <Icon name="image" className="h-6 w-6" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-xl border border-gray-100 object-cover dark:border-gray-800 ${className}`}
    />
  )
}

function ProjectModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial?: Project
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = Boolean(initial)
  const [form, setForm] = useState<ProjectFormState>(() => toForm(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        short_description: form.short_description.trim(),
        full_description: form.full_description.trim() || undefined,
        image_path: form.image_path.trim(),
        created_at_label: form.created_at_label.trim() || undefined,
        tech: parseList(form.tech),
        features: parseList(form.features),
        github_url: form.github_url.trim(),
        live_demo_url: form.live_demo_url.trim(),
        is_private_repo: form.is_private_repo,
        sort_order: Number(form.sort_order) || 0,
        ...(isEdit ? { is_active: form.is_active } : {}),
      }
      await adminFetch(
        isEdit ? `/api/admin/projects/${initial?.id}` : '/api/admin/projects',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      )
      onSaved(
        isEdit ? 'Proyek berhasil diperbarui.' : 'Proyek baru berhasil ditambahkan.'
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Proyek' : 'Tambah Proyek'}
      description={
        isEdit
          ? 'Perbarui detail proyek yang tampil di portofolio.'
          : 'Tambahkan karya baru ke bagian Projects.'
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="project-form" loading={saving}>
            <Icon name="save" className="h-4 w-4" />
            {isEdit ? 'Simpan Perubahan' : 'Tambah Proyek'}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul proyek" required className="sm:col-span-2">
            <Input
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="BossApp — SaaS POS Platform"
              required
            />
          </Field>
          <Field label="Deskripsi singkat" required className="sm:col-span-2">
            <Textarea
              value={form.short_description}
              onChange={(event) => set('short_description', event.target.value)}
              rows={3}
              placeholder="Ringkasan proyek dalam 1–2 kalimat..."
              required
            />
          </Field>
          <Field
            label="Deskripsi lengkap"
            hint="Opsional. Mendukung teks markdown pada tampilan publik."
            className="sm:col-span-2"
          >
            <Textarea
              value={form.full_description}
              onChange={(event) => set('full_description', event.target.value)}
              rows={5}
              placeholder="Detail fitur, tantangan, dan solusi..."
            />
          </Field>
        </div>

        <ImageUpload
          label="Foto Sampul / Screenshot Proyek"
          hint="Unggah foto karya/proyek Anda (PNG, JPG, WEBP, SVG). Maksimal 2MB."
          value={form.image_path}
          onChange={(url) => set('image_path', url)}
          maxSizeMB={2}
        />

        <Field label="Label tanggal" hint="Contoh: 2025-06-01 atau Juni 2025">
          <Input
            value={form.created_at_label}
            onChange={(event) => set('created_at_label', event.target.value)}
            placeholder="2025-06-01"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Tech stack"
            hint="Pisahkan dengan koma. Contoh: Next.js, TypeScript, PostgreSQL"
          >
            <Input
              value={form.tech}
              onChange={(event) => set('tech', event.target.value)}
              placeholder="Next.js, TypeScript, PostgreSQL"
            />
          </Field>
          <Field
            label="Fitur utama"
            hint="Pisahkan dengan koma. Contoh: Multi-outlet, Dashboard"
          >
            <Input
              value={form.features}
              onChange={(event) => set('features', event.target.value)}
              placeholder="Multi-outlet Management, Dashboard"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="URL GitHub">
            <Input
              value={form.github_url}
              onChange={(event) => set('github_url', event.target.value)}
              placeholder="https://github.com/username/repo"
            />
          </Field>
          <Field label="URL Live Demo">
            <Input
              value={form.live_demo_url}
              onChange={(event) => set('live_demo_url', event.target.value)}
              placeholder="https://example.com"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Urutan tampil" hint="Angka kecil tampil lebih dulu.">
            <Input
              type="number"
              value={form.sort_order}
              onChange={(event) => set('sort_order', event.target.value)}
              min={0}
            />
          </Field>
          <div className="flex items-center justify-between gap-3 self-end rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Repo privat
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Sembunyikan tautan GitHub.
              </p>
            </div>
            <Toggle
              checked={form.is_private_repo}
              onChange={(value) => set('is_private_repo', value)}
              label="Repo privat"
            />
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tampilkan di portofolio
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Nonaktifkan untuk menyembunyikan tanpa menghapus data.
              </p>
            </div>
            <Toggle
              checked={form.is_active}
              onChange={(value) => set('is_active', value)}
              label="Tampilkan proyek"
            />
          </div>
        )}
      </form>
    </Modal>
  )
}

export default function ProjectsPage() {
  const toast = useToast()
  const { data, setData, loading, error, reload } = useAdminData<Project[]>(
    '/api/admin/projects'
  )
  const [editor, setEditor] = useState<{ item?: Project } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const items = data ?? []

  async function toggleActive(item: Project) {
    setBusyId(item.id)
    setNotice(null)
    const next = !item.is_active
    setData((prev) =>
      prev
        ? prev.map((entry) =>
            entry.id === item.id ? { ...entry, is_active: next } : entry
          )
        : prev
    )
    try {
      await adminFetch(`/api/admin/projects/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: next }),
      })
      const msg = `Status proyek "${item.title}" ${next ? 'diaktifkan' : 'dinonaktifkan'}.`
      toast.success(msg)
    } catch (err) {
      setData((prev) =>
        prev
          ? prev.map((entry) =>
              entry.id === item.id ? { ...entry, is_active: item.is_active } : entry
            )
          : prev
      )
      const errText = getErrorMessage(err)
      setNotice({ tone: 'error', text: errText })
      toast.error(errText)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setNotice(null)
    try {
      await adminFetch(`/api/admin/projects/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      setData((prev) =>
        prev ? prev.filter((entry) => entry.id !== deleteTarget.id) : prev
      )
      const msg = 'Proyek berhasil dihapus dari portofolio.'
      setNotice({ tone: 'success', text: msg })
      toast.success(msg)
      setDeleteTarget(null)
    } catch (err) {
      const errText = getErrorMessage(err)
      setNotice({ tone: 'error', text: errText })
      toast.error(errText)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proyek"
        description="Kelola karya dan proyek yang ditampilkan di bagian Projects."
      >
        <Button onClick={() => setEditor({})}>
          <Icon name="plus" className="h-4 w-4" />
          Tambah Proyek
        </Button>
      </PageHeader>

      {notice && (
        <Alert tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

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
          <LoadingState label="Memuat proyek..." />
        </Card>
      ) : !error && items.length === 0 ? (
        <Card>
          <EmptyState
            icon="rocket"
            title="Belum ada proyek"
            description="Tambahkan proyek pertama kamu agar tampil di bagian Projects."
            action={
              <Button onClick={() => setEditor({})}>
                <Icon name="plus" className="h-4 w-4" />
                Tambah Proyek
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {items.length} proyek terdaftar
          </p>
          {items.map((item) => (
            <Card
              key={item.id}
              className={item.is_active ? 'p-5 sm:p-6' : 'p-5 opacity-75 sm:p-6'}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                  <ProjectThumb src={item.image_path} title={item.title} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h2>
                      {item.is_private_repo && (
                        <Badge tone="violet">Repo privat</Badge>
                      )}
                      {!item.is_active && <Badge tone="amber">Nonaktif</Badge>}
                    </div>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                      {item.short_description}
                    </p>
                    {item.tech.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.tech.map((tech) => (
                          <Badge key={tech} tone="blue">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
                      {item.created_at_label && (
                        <span className="inline-flex items-center gap-1">
                          <Icon name="chart" className="h-3.5 w-3.5" />
                          {item.created_at_label}
                        </span>
                      )}
                      <span>Urutan: {item.sort_order}</span>
                      {item.github_url && item.github_url !== '#' && (
                        <a
                          href={item.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <Icon name="link" className="h-3.5 w-3.5" />
                          GitHub
                        </a>
                      )}
                      {item.live_demo_url && item.live_demo_url !== '#' && (
                        <a
                          href={item.live_demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <Icon name="external" className="h-3.5 w-3.5" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 dark:border-gray-800">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Aktif
                    </span>
                    <Toggle
                      checked={item.is_active}
                      onChange={() => toggleActive(item)}
                      disabled={busyId === item.id}
                      label={`Aktifkan ${item.title}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditor({ item })}
                    >
                      <Icon name="edit" className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Icon name="trash" className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editor && (
        <ProjectModal
          key={editor.item?.id ?? 'new'}
          open
          initial={editor.item}
          onClose={() => setEditor(null)}
          onSaved={(message) => {
            setEditor(null)
            setNotice({ tone: 'success', text: message })
            toast.success(message)
            reload()
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus proyek?"
        message={
          <>
            Proyek <strong>{deleteTarget?.title}</strong> akan dihapus permanen.
            Tindakan ini tidak dapat dibatalkan.
          </>
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
