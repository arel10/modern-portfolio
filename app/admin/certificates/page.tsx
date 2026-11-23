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
  Toggle,
} from '@/components/admin/ui'
import type { Certificate } from '@/components/admin/types'

type Notice = { tone: 'success' | 'error'; text: string } | null

interface CertificateFormState {
  title: string
  issuer: string
  issue_date: string
  expiration_date: string
  credential_id: string
  credential_url: string
  image_url: string
  skills: string
  sort_order: string
  is_active: boolean
}

function toForm(item?: Certificate): CertificateFormState {
  return {
    title: item?.title ?? '',
    issuer: item?.issuer ?? '',
    issue_date: item?.issue_date ?? '',
    expiration_date: item?.expiration_date ?? '',
    credential_id: item?.credential_id ?? '',
    credential_url: item?.credential_url ?? '',
    image_url: item?.image_url ?? '',
    skills: listToText(item?.skills),
    sort_order: String(item?.sort_order ?? 0),
    is_active: item?.is_active ?? true,
  }
}

function CertificateThumb({
  src,
  title,
}: {
  src?: string | null
  title: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-text-secondary/15 bg-thirdary/40 text-text-secondary">
        <Icon name="certificate" className="h-8 w-8" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      className="h-20 w-20 shrink-0 rounded-2xl border border-text-secondary/15 object-cover dark:border-white/10"
    />
  )
}

function CertificateModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial?: Certificate
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = Boolean(initial)
  const [form, setForm] = useState<CertificateFormState>(() => toForm(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof CertificateFormState>(
    key: K,
    value: CertificateFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        issue_date: form.issue_date.trim(),
        expiration_date: form.expiration_date.trim() || undefined,
        credential_id: form.credential_id.trim() || undefined,
        credential_url: form.credential_url.trim() || undefined,
        image_url: form.image_url.trim() || undefined,
        skills: parseList(form.skills),
        sort_order: Number(form.sort_order) || 0,
        ...(isEdit ? { is_active: form.is_active } : {}),
      }

      await adminFetch(
        isEdit
          ? `/api/admin/certificates/${initial?.id}`
          : '/api/admin/certificates',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      )
      onSaved(
        isEdit
          ? 'Data sertifikat berhasil diperbarui.'
          : 'Sertifikat baru berhasil ditambahkan.'
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
      title={isEdit ? 'Edit Sertifikat' : 'Tambah Sertifikat'}
      description="Sertifikasi profesional, lisensi, dan sertifikat pelatihan yang tampil di website."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button
            type="submit"
            form="certificate-form"
            loading={saving}
          >
            <Icon name="save" className="h-4 w-4" />
            {isEdit ? 'Simpan Perubahan' : 'Tambah Sertifikat'}
          </Button>
        </>
      }
    >
      <form id="certificate-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <Field label="Nama Sertifikasi / Lisensi" required>
          <Input
            value={form.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder="Contoh: Associate Cloud Engineer Certification"
            required
          />
        </Field>

        <Field label="Penerbit Sertifikat" required>
          <Input
            value={form.issuer}
            onChange={(event) => set('issuer', event.target.value)}
            placeholder="Contoh: Google Cloud / Dicoding / AWS / Coursera"
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal Terbit" hint="Contoh: November 2024" required>
            <Input
              value={form.issue_date}
              onChange={(event) => set('issue_date', event.target.value)}
              placeholder="November 2024"
              required
            />
          </Field>

          <Field label="Tanggal Kadaluarsa" hint="Kosongkan jika tidak ada">
            <Input
              value={form.expiration_date}
              onChange={(event) => set('expiration_date', event.target.value)}
              placeholder="Contoh: November 2027 atau Tidak Ada"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ID Kredensial / No. Sertifikat">
            <Input
              value={form.credential_id}
              onChange={(event) => set('credential_id', event.target.value)}
              placeholder="Contoh: GCP-ACE-892410"
            />
          </Field>

          <Field label="URL Verifikasi Online" hint="Link verifikasi sertifikat">
            <Input
              value={form.credential_url}
              onChange={(event) => set('credential_url', event.target.value)}
              placeholder="https://www.credential.net/..."
            />
          </Field>
        </div>

        <ImageUpload
          label="Foto / Scan Sertifikat / Badge"
          hint="Unggah bukti scan atau gambar sertifikat. Otomatis dikompres oleh server."
          value={form.image_url}
          onChange={(url) => set('image_url', url)}
          allowPdf
        />

        <Field
          label="Kompetensi / Skills Terkait"
          hint="Pisahkan dengan koma. Contoh: Google Cloud, Kubernetes, Docker"
        >
          <Input
            value={form.skills}
            onChange={(event) => set('skills', event.target.value)}
            placeholder="Google Cloud, Docker, Kubernetes"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Urutan Tampil" hint="Angka kecil tampil lebih dulu.">
            <Input
              type="number"
              value={form.sort_order}
              onChange={(event) => set('sort_order', event.target.value)}
              min={0}
            />
          </Field>

          {isEdit && (
            <div className="flex flex-col justify-end pb-1">
              <Toggle
                label="Status Tampil di Website"
                checked={form.is_active}
                onChange={(checked) => set('is_active', checked)}
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default function CertificatesPage() {
  const toast = useToast()
  const { data, loading, error, reload } = useAdminData<Certificate[]>(
    '/api/admin/certificates'
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Certificate | undefined>(undefined)
  const [deleting, setDeleting] = useState<Certificate | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  function handleOpenCreate() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function handleOpenEdit(item: Certificate) {
    setEditing(item)
    setModalOpen(true)
  }

  async function handleToggleActive(item: Certificate) {
    try {
      await adminFetch(`/api/admin/certificates/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      const nextState = !item.is_active
      const msg = `Sertifikat "${item.title}" ${nextState ? 'diaktifkan' : 'dinonaktifkan'}.`
      setNotice({ tone: 'success', text: msg })
      toast.success(msg)
      reload()
    } catch (err) {
      const msg = getErrorMessage(err)
      setNotice({ tone: 'error', text: msg })
      toast.error(msg)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeletingLoading(true)
    try {
      await adminFetch(`/api/admin/certificates/${deleting.id}`, {
        method: 'DELETE',
      })
      const msg = 'Data sertifikat berhasil dihapus.'
      setNotice({ tone: 'success', text: msg })
      toast.success(msg)
      setDeleting(null)
      reload()
    } catch (err) {
      const msg = getErrorMessage(err)
      setNotice({ tone: 'error', text: msg })
      toast.error(msg)
    } finally {
      setDeletingLoading(false)
    }
  }

  const items = data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sertifikat &amp; Lisensi"
        description="Kelola sertifikasi profesional, lisensi keahlian, dan kredensial terverifikasi."
      >
        <Button onClick={handleOpenCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Tambah Sertifikat
        </Button>
      </PageHeader>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      {loading ? (
        <Card>
          <LoadingState label="Memuat data sertifikat..." />
        </Card>
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon="certificate"
            title="Belum Ada Sertifikat"
            description="Tambahkan sertifikat atau lisensi keahlian Anda untuk meningkatkan kepercayaan recruiter."
            action={
              <Button onClick={handleOpenCreate}>
                <Icon name="plus" className="h-4 w-4" />
                Tambah Sertifikat Pertama
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 transition-all hover:border-text-primary/40"
            >
              <CertificateThumb src={item.image_url} title={item.title} />

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="green">Terverifikasi</Badge>
                  <span className="text-xs font-bold text-text-secondary font-mono">
                    #{item.sort_order}
                  </span>
                  <span className="text-xs text-text-secondary">&bull;</span>
                  <span className="text-xs font-semibold text-text-secondary">
                    Terbit: {item.issue_date}
                  </span>
                  {item.expiration_date && (
                    <span className="text-xs text-text-secondary">
                      (Exp: {item.expiration_date})
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                  {item.issuer}
                </p>

                {item.credential_id && (
                  <p className="text-xs font-mono text-text-secondary">
                    ID: <span className="font-semibold text-text-primary">{item.credential_id}</span>
                  </p>
                )}

                {item.skills && item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-thirdary/60 text-text-primary px-2 py-0.5 rounded-md border border-text-secondary/10 uppercase tracking-wider"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {item.credential_url && (
                  <div className="pt-1">
                    <a
                      href={item.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-text-primary hover:underline"
                    >
                      <span>Verifikasi Kredensial Online</span>
                      <Icon name="external" className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-text-secondary/15 shrink-0">
                <Toggle
                  checked={item.is_active}
                  onChange={() => handleToggleActive(item)}
                  label={item.is_active ? 'Aktif' : 'Nonaktif'}
                />

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(item)}
                  >
                    <Icon name="edit" className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => setDeleting(item)}
                  >
                    <Icon name="trash" className="h-4 w-4" />
                    Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <CertificateModal
          open={modalOpen}
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={(msg) => {
            setModalOpen(false)
            setNotice({ tone: 'success', text: msg })
            toast.success(msg)
            reload()
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Hapus Sertifikat"
        message={
          <>
            Data sertifikat <strong>{deleting?.title}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
          </>
        }
        confirmLabel="Hapus Sertifikat"
        loading={deletingLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
