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
import type { Experience } from '@/components/admin/types'

type Notice = { tone: 'success' | 'error'; text: string } | null

interface ExperienceFormState {
  company: string
  role: string
  date_range: string
  description: string
  skills: string
  sort_order: string
  is_active: boolean
}

function toForm(item?: Experience): ExperienceFormState {
  return {
    company: item?.company ?? '',
    role: item?.role ?? '',
    date_range: item?.date_range ?? '',
    description: item?.description ?? '',
    skills: listToText(item?.skills),
    sort_order: String(item?.sort_order ?? 0),
    is_active: item?.is_active ?? true,
  }
}

function ExperienceModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial?: Experience
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = Boolean(initial)
  const [form, setForm] = useState<ExperienceFormState>(() => toForm(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof ExperienceFormState>(
    key: K,
    value: ExperienceFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        company: form.company.trim(),
        role: form.role.trim(),
        date_range: form.date_range.trim(),
        description: form.description.trim(),
        skills: parseList(form.skills),
        sort_order: Number(form.sort_order) || 0,
        ...(isEdit ? { is_active: form.is_active } : {}),
      }
      await adminFetch(
        isEdit
          ? `/api/admin/experiences/${initial?.id}`
          : '/api/admin/experiences',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      )
      onSaved(
        isEdit
          ? 'Pengalaman berhasil diperbarui.'
          : 'Pengalaman baru berhasil ditambahkan.'
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
      title={isEdit ? 'Edit Pengalaman' : 'Tambah Pengalaman'}
      description={
        isEdit
          ? 'Perbarui detail riwayat pekerjaan atau magang.'
          : 'Tambahkan riwayat pekerjaan, magang, atau organisasi.'
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="experience-form" loading={saving}>
            <Icon name="save" className="h-4 w-4" />
            {isEdit ? 'Simpan Perubahan' : 'Tambah Pengalaman'}
          </Button>
        </>
      }
    >
      <form id="experience-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Perusahaan" required>
            <Input
              value={form.company}
              onChange={(event) => set('company', event.target.value)}
              placeholder="bossapp.id — Padang, Indonesia"
              required
            />
          </Field>
          <Field label="Posisi" required>
            <Input
              value={form.role}
              onChange={(event) => set('role', event.target.value)}
              placeholder="Fullstack Developer"
              required
            />
          </Field>
          <Field label="Periode" required hint="Contoh: June 2025 – Present">
            <Input
              value={form.date_range}
              onChange={(event) => set('date_range', event.target.value)}
              placeholder="June 2025 – Present"
              required
            />
          </Field>
          <Field label="Urutan tampil" hint="Angka kecil tampil lebih dulu.">
            <Input
              type="number"
              value={form.sort_order}
              onChange={(event) => set('sort_order', event.target.value)}
              min={0}
            />
          </Field>
        </div>

        <Field label="Deskripsi" required>
          <Textarea
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            rows={5}
            placeholder="Jelaskan tanggung jawab dan pencapaian..."
            required
          />
        </Field>

        <Field
          label="Skills"
          hint="Pisahkan setiap skill dengan koma. Contoh: Next.js, Node.js, PostgreSQL"
        >
          <Input
            value={form.skills}
            onChange={(event) => set('skills', event.target.value)}
            placeholder="Next.js, TypeScript, PostgreSQL"
          />
        </Field>

        {isEdit && (
          <div className="flex items-center justify-between rounded-xl border border-text-secondary/15 px-4 py-3 dark:border-white/10">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Tampilkan di portofolio
              </p>
              <p className="text-xs font-medium text-text-secondary">
                Nonaktifkan untuk menyembunyikan tanpa menghapus data.
              </p>
            </div>
            <Toggle
              checked={form.is_active}
              onChange={(value) => set('is_active', value)}
              label="Tampilkan pengalaman"
            />
          </div>
        )}
      </form>
    </Modal>
  )
}

export default function ExperiencesPage() {
  const toast = useToast()
  const { data, setData, loading, error, reload } = useAdminData<Experience[]>(
    '/api/admin/experiences'
  )
  const [editor, setEditor] = useState<{ item?: Experience } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const items = data ?? []

  async function toggleActive(item: Experience) {
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
      await adminFetch(`/api/admin/experiences/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: next }),
      })
    } catch (err) {
      setData((prev) =>
        prev
          ? prev.map((entry) =>
              entry.id === item.id ? { ...entry, is_active: item.is_active } : entry
            )
          : prev
      )
      setNotice({ tone: 'error', text: getErrorMessage(err) })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setNotice(null)
    try {
      await adminFetch(`/api/admin/experiences/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      setData((prev) =>
        prev ? prev.filter((entry) => entry.id !== deleteTarget.id) : prev
      )
      setNotice({ tone: 'success', text: 'Pengalaman berhasil dihapus.' })
      setDeleteTarget(null)
    } catch (err) {
      setNotice({ tone: 'error', text: getErrorMessage(err) })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengalaman"
        description="Kelola riwayat pekerjaan, magang, dan organisasi yang tampil di portofolio."
      >
        <Button onClick={() => setEditor({})}>
          <Icon name="plus" className="h-4 w-4" />
          Tambah Pengalaman
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
          <LoadingState label="Memuat pengalaman..." />
        </Card>
      ) : !error && items.length === 0 ? (
        <Card>
          <EmptyState
            icon="briefcase"
            title="Belum ada pengalaman"
            description="Tambahkan pengalaman pertama kamu agar tampil di bagian Experience."
            action={
              <Button onClick={() => setEditor({})}>
                <Icon name="plus" className="h-4 w-4" />
                Tambah Pengalaman
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium text-text-secondary">
            {items.length} pengalaman terdaftar
          </p>
          {items.map((item) => (
            <Card
              key={item.id}
              className={
                item.is_active ? 'p-5 sm:p-6' : 'p-5 opacity-75 sm:p-6'
              }
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-text-primary">
                      {item.role}
                    </h2>
                    {!item.is_active && <Badge tone="amber">Nonaktif</Badge>}
                    <Badge tone="blue">{item.date_range}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-text-primary/90">
                    {item.company}
                  </p>
                  <p className="mt-2 max-w-3xl whitespace-pre-line text-sm font-medium leading-relaxed text-text-secondary">
                    {item.description}
                  </p>
                  {item.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.skills.map((skill) => (
                        <Badge key={skill} tone="gray">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs font-medium text-text-secondary">
                    Urutan tampil: {item.sort_order}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-2 rounded-xl border border-text-secondary/15 px-2.5 py-1.5 dark:border-white/10">
                    <span className="text-xs font-medium text-text-secondary">
                      Aktif
                    </span>
                    <Toggle
                      checked={item.is_active}
                      onChange={() => toggleActive(item)}
                      disabled={busyId === item.id}
                      label={`Aktifkan ${item.role}`}
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
        <ExperienceModal
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
        title="Hapus pengalaman?"
        message={
          <>
            Pengalaman <strong>{deleteTarget?.role}</strong> di{' '}
            <strong>{deleteTarget?.company}</strong> akan dihapus permanen. Tindakan
            ini tidak dapat dibatalkan.
          </>
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
