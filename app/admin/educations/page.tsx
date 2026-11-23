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
import type { Education } from '@/components/admin/types'

type Notice = { tone: 'success' | 'error'; text: string } | null

interface EducationFormState {
  institution: string
  degree: string
  field_of_study: string
  date_range: string
  grade: string
  description: string
  image_url: string
  skills: string
  sort_order: string
  is_active: boolean
}

function toForm(item?: Education): EducationFormState {
  return {
    institution: item?.institution ?? '',
    degree: item?.degree ?? '',
    field_of_study: item?.field_of_study ?? '',
    date_range: item?.date_range ?? '',
    grade: item?.grade ?? '',
    description: item?.description ?? '',
    image_url: item?.image_url ?? '',
    skills: listToText(item?.skills),
    sort_order: String(item?.sort_order ?? 0),
    is_active: item?.is_active ?? true,
  }
}

function EducationThumb({
  src,
  institution,
}: {
  src?: string | null
  institution: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-text-secondary/15 bg-thirdary/40 text-text-secondary">
        <Icon name="academic" className="h-8 w-8" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={institution}
      onError={() => setFailed(true)}
      className="h-20 w-20 shrink-0 rounded-2xl border border-text-secondary/15 object-cover dark:border-white/10"
    />
  )
}

function EducationModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial?: Education
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = Boolean(initial)
  const [form, setForm] = useState<EducationFormState>(() => toForm(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof EducationFormState>(
    key: K,
    value: EducationFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        institution: form.institution.trim(),
        degree: form.degree.trim(),
        field_of_study: form.field_of_study.trim() || undefined,
        date_range: form.date_range.trim(),
        grade: form.grade.trim() || undefined,
        description: form.description.trim() || undefined,
        image_url: form.image_url.trim() || undefined,
        skills: parseList(form.skills),
        sort_order: Number(form.sort_order) || 0,
        ...(isEdit ? { is_active: form.is_active } : {}),
      }

      await adminFetch(
        isEdit
          ? `/api/admin/educations/${initial?.id}`
          : '/api/admin/educations',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      )
      onSaved(
        isEdit
          ? 'Data pendidikan berhasil diperbarui.'
          : 'Pendidikan baru berhasil ditambahkan.'
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
      title={isEdit ? 'Edit Pendidikan' : 'Tambah Pendidikan'}
      description={
        isEdit
          ? 'Perbarui detail riwayat pendidikan atau studi.'
          : 'Tambahkan data almamater, universitas, atau sekolah ke portofolio.'
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="education-form" loading={saving}>
            <Icon name="save" className="h-4 w-4" />
            {isEdit ? 'Simpan Perubahan' : 'Tambah Pendidikan'}
          </Button>
        </>
      }
    >
      <form id="education-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Institusi / Kampus" required className="sm:col-span-2">
            <Input
              value={form.institution}
              onChange={(event) => set('institution', event.target.value)}
              placeholder="Politeknik Negeri Padang"
              required
            />
          </Field>

          <Field label="Gelar / Jenjang" required>
            <Input
              value={form.degree}
              onChange={(event) => set('degree', event.target.value)}
              placeholder="Sarjana Terapan (D4)"
              required
            />
          </Field>

          <Field label="Jurusan / Program Studi">
            <Input
              value={form.field_of_study}
              onChange={(event) => set('field_of_study', event.target.value)}
              placeholder="Rekayasa Perangkat Lunak (Software Engineering)"
            />
          </Field>

          <Field label="Periode" required hint="Contoh: 2021 – 2025">
            <Input
              value={form.date_range}
              onChange={(event) => set('date_range', event.target.value)}
              placeholder="2021 – 2025"
              required
            />
          </Field>

          <Field label="Nilai / IPK" hint="Contoh: IPK 3.44 / 4.00">
            <Input
              value={form.grade}
              onChange={(event) => set('grade', event.target.value)}
              placeholder="IPK 3.44 / 4.00"
            />
          </Field>
        </div>

        <ImageUpload
          label="Foto Almamater / Logo Kampus"
          hint="Unggah foto gedung, almamater, atau logo kampus. Bebas ukuran dari HP/kamera, otomatis dikompres oleh server."
          value={form.image_url}
          onChange={(url) => set('image_url', url)}
        />

        <Field label="Deskripsi / Prestasi">
          <Textarea
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            rows={4}
            placeholder="Jelaskan fokus studi, topik skripsi/tugas akhir, atau kegiatan akademik..."
          />
        </Field>

        <Field
          label="Mata Kuliah / Kompetensi Utama"
          hint="Pisahkan dengan koma. Contoh: Software Engineering, Database Design, Data Structures"
        >
          <Input
            value={form.skills}
            onChange={(event) => set('skills', event.target.value)}
            placeholder="Software Engineering, Fullstack Development, Database Design"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Urutan tampil" hint="Angka kecil tampil lebih dulu.">
            <Input
              type="number"
              value={form.sort_order}
              onChange={(event) => set('sort_order', event.target.value)}
              min={0}
            />
          </Field>

          {isEdit && (
            <div className="flex items-center justify-between self-end rounded-xl border border-text-secondary/15 px-4 py-3 dark:border-white/10">
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Tampilkan di portofolio
                </p>
                <p className="text-xs font-medium text-text-secondary">
                  Nonaktifkan untuk menyembunyikan tanpa menghapus.
                </p>
              </div>
              <Toggle
                checked={form.is_active}
                onChange={(value) => set('is_active', value)}
                label="Tampilkan pendidikan"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default function EducationsPage() {
  const toast = useToast()
  const { data, setData, loading, error, reload } = useAdminData<Education[]>(
    '/api/admin/educations'
  )
  const [editor, setEditor] = useState<{ item?: Education } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const items = data ?? []

  async function toggleActive(item: Education) {
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
      await adminFetch(`/api/admin/educations/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: next }),
      })
      const msg = `Status "${item.institution}" ${next ? 'diaktifkan' : 'dinonaktifkan'}.`
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
      await adminFetch(`/api/admin/educations/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      setData((prev) =>
        prev ? prev.filter((entry) => entry.id !== deleteTarget.id) : prev
      )
      const msg = 'Data pendidikan berhasil dihapus.'
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
        title="Pendidikan"
        description="Kelola riwayat pendidikan formal, gelar, almamater, dan prestasi akademik."
      >
        <Button onClick={() => setEditor({})}>
          <Icon name="plus" className="h-4 w-4" />
          Tambah Pendidikan
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
          <LoadingState label="Memuat data pendidikan..." />
        </Card>
      ) : !error && items.length === 0 ? (
        <Card>
          <EmptyState
            icon="academic"
            title="Belum ada data pendidikan"
            description="Tambahkan riwayat almamater atau studi Anda agar tampil di section Education."
            action={
              <Button onClick={() => setEditor({})}>
                <Icon name="plus" className="h-4 w-4" />
                Tambah Pendidikan
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium text-text-secondary">
            {items.length} riwayat pendidikan terdaftar
          </p>
          {items.map((item) => (
            <Card
              key={item.id}
              className={
                item.is_active ? 'p-5 sm:p-6' : 'p-5 opacity-75 sm:p-6'
              }
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                  <EducationThumb src={item.image_url} institution={item.institution} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-text-primary">
                        {item.institution}
                      </h2>
                      {!item.is_active && <Badge tone="amber">Nonaktif</Badge>}
                      <Badge tone="blue">{item.date_range}</Badge>
                      {item.grade && <Badge tone="green">{item.grade}</Badge>}
                    </div>

                    <p className="mt-1 text-sm font-semibold text-text-primary/90">
                      {item.degree}
                      {item.field_of_study && ` — ${item.field_of_study}`}
                    </p>

                    {item.description && (
                      <p className="mt-2 max-w-3xl whitespace-pre-line text-sm font-medium leading-relaxed text-text-secondary">
                        {item.description}
                      </p>
                    )}

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
                      label={`Aktifkan ${item.institution}`}
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
        <EducationModal
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
        title="Hapus riwayat pendidikan?"
        message={
          <>
            Data pendidikan <strong>{deleteTarget?.institution}</strong> ({deleteTarget?.degree}) akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
          </>
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
