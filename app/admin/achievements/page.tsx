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
import type { Achievement } from '@/components/admin/types'

type Notice = { tone: 'success' | 'error'; text: string } | null

interface AchievementFormState {
  title: string
  category: string
  issuer: string
  date: string
  description: string
  link_url: string
  image_url: string
  skills: string
  sort_order: string
  is_active: boolean
}

function toForm(item?: Achievement): AchievementFormState {
  return {
    title: item?.title ?? '',
    category: item?.category ?? 'prestasi',
    issuer: item?.issuer ?? '',
    date: item?.date ?? '',
    description: item?.description ?? '',
    link_url: item?.link_url ?? '',
    image_url: item?.image_url ?? '',
    skills: listToText(item?.skills),
    sort_order: String(item?.sort_order ?? 0),
    is_active: item?.is_active ?? true,
  }
}

function AchievementThumb({
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
        <Icon name="trophy" className="h-8 w-8" />
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

function getCategoryBadge(category: string) {
  switch (category) {
    case 'jurnal':
      return <Badge tone="blue">Jurnal Ilmiah</Badge>
    case 'prestasi':
      return <Badge tone="amber">Prestasi &amp; Lomba</Badge>
    case 'penghargaan':
      return <Badge tone="green">Penghargaan</Badge>
    default:
      return <Badge tone="gray">Pencapaian</Badge>
  }
}

function AchievementModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial?: Achievement
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = Boolean(initial)
  const [form, setForm] = useState<AchievementFormState>(() => toForm(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof AchievementFormState>(
    key: K,
    value: AchievementFormState[K]
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
        category: form.category.trim(),
        issuer: form.issuer.trim(),
        date: form.date.trim(),
        description: form.description.trim() || undefined,
        link_url: form.link_url.trim() || undefined,
        image_url: form.image_url.trim() || undefined,
        skills: parseList(form.skills),
        sort_order: Number(form.sort_order) || 0,
        ...(isEdit ? { is_active: form.is_active } : {}),
      }

      await adminFetch(
        isEdit
          ? `/api/admin/achievements/${initial?.id}`
          : '/api/admin/achievements',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      )
      onSaved(
        isEdit
          ? 'Data pencapaian berhasil diperbarui.'
          : 'Pencapaian baru berhasil ditambahkan.'
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
      title={isEdit ? 'Edit Pencapaian' : 'Tambah Pencapaian'}
      description="Pencapaian publikasi jurnal ilmiah, kompetisi, dan prestasi yang tampil di website."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button
            type="submit"
            form="achievement-form"
            loading={saving}
          >
            <Icon name="save" className="h-4 w-4" />
            {isEdit ? 'Simpan Perubahan' : 'Tambah Pencapaian'}
          </Button>
        </>
      }
    >
      <form id="achievement-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <Field label="Judul Pencapaian / Jurnal" required>
          <Input
            value={form.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder="Contoh: Publikasi Jurnal: Machine Learning Prediksi Churn..."
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategori" required>
            <select
              value={form.category}
              onChange={(event) => set('category', event.target.value)}
              className="w-full rounded-xl border border-text-secondary/20 bg-background px-3.5 py-2.5 text-sm text-text-primary shadow-sm outline-none transition focus:border-text-primary focus:ring-1 focus:ring-text-primary/30"
              required
            >
              <option value="jurnal">Publikasi Jurnal Ilmiah</option>
              <option value="prestasi">Prestasi &amp; Juara Lomba</option>
              <option value="penghargaan">Penghargaan / Award</option>
              <option value="lainnya">Pencapaian Lainnya</option>
            </select>
          </Field>

          <Field label="Penerbit / Penyelenggara" required>
            <Input
              value={form.issuer}
              onChange={(event) => set('issuer', event.target.value)}
              placeholder="Contoh: IEEE Xplore / Kementerian Kominfo"
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Waktu / Tanggal" hint="Contoh: Desember 2024" required>
            <Input
              value={form.date}
              onChange={(event) => set('date', event.target.value)}
              placeholder="Desember 2024"
              required
            />
          </Field>

          <Field label="Link Publikasi / Bukti Online" hint="DOI atau link pengumuman lomba">
            <Input
              value={form.link_url}
              onChange={(event) => set('link_url', event.target.value)}
              placeholder="https://doi.org/... atau https://..."
            />
          </Field>
        </div>

        <ImageUpload
          label="Foto Bukti / Sertifikat / Cover Jurnal"
          hint="Unggah foto piala, sertifikat juara, atau cover publikasi jurnal. Otomatis dikompres oleh server."
          value={form.image_url}
          onChange={(url) => set('image_url', url)}
        />

        <Field label="Deskripsi / Abstrak Singkat">
          <Textarea
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            rows={4}
            placeholder="Jelaskan ringkasan temuan penelitian jurnal atau pencapaian yang diraih..."
          />
        </Field>

        <Field
          label="Topik / Teknologi Terkait"
          hint="Pisahkan dengan koma. Contoh: Machine Learning, Python, Scikit-Learn"
        >
          <Input
            value={form.skills}
            onChange={(event) => set('skills', event.target.value)}
            placeholder="Machine Learning, Data Science, Python"
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

export default function AchievementsPage() {
  const toast = useToast()
  const { data, loading, error, reload } = useAdminData<Achievement[]>(
    '/api/admin/achievements'
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Achievement | undefined>(undefined)
  const [deleting, setDeleting] = useState<Achievement | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  function handleOpenCreate() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function handleOpenEdit(item: Achievement) {
    setEditing(item)
    setModalOpen(true)
  }

  async function handleToggleActive(item: Achievement) {
    try {
      await adminFetch(`/api/admin/achievements/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      const nextState = !item.is_active
      const msg = `Pencapaian "${item.title}" ${nextState ? 'diaktifkan' : 'dinonaktifkan'}.`
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
      await adminFetch(`/api/admin/achievements/${deleting.id}`, {
        method: 'DELETE',
      })
      const msg = 'Data pencapaian berhasil dihapus.'
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
  const filteredItems = items.filter((item) => {
    if (selectedFilter === 'all') return true
    return item.category === selectedFilter
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pencapaian &amp; Publikasi Jurnal"
        description="Kelola publikasi jurnal ilmiah, prestasi juara kompetisi, dan penghargaan profesional."
      >
        <Button onClick={handleOpenCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Tambah Pencapaian
        </Button>
      </PageHeader>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      {loading ? (
        <Card>
          <LoadingState label="Memuat data pencapaian..." />
        </Card>
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon="trophy"
            title="Belum Ada Pencapaian"
            description="Tambahkan publikasi jurnal atau prestasi lomba untuk memperkuat reputasi profesional Anda."
            action={
              <Button onClick={handleOpenCreate}>
                <Icon name="plus" className="h-4 w-4" />
                Tambah Pencapaian Pertama
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'all'
                  ? 'bg-text-primary text-background shadow-sm'
                  : 'bg-thirdary/60 text-text-secondary hover:text-text-primary'
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('jurnal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'jurnal'
                  ? 'bg-text-primary text-background shadow-sm'
                  : 'bg-thirdary/60 text-text-secondary hover:text-text-primary'
              }`}
            >
              Jurnal Ilmiah ({items.filter((i) => i.category === 'jurnal').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('prestasi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'prestasi'
                  ? 'bg-text-primary text-background shadow-sm'
                  : 'bg-thirdary/60 text-text-secondary hover:text-text-primary'
              }`}
            >
              Prestasi &amp; Lomba ({items.filter((i) => i.category === 'prestasi').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('penghargaan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'penghargaan'
                  ? 'bg-text-primary text-background shadow-sm'
                  : 'bg-thirdary/60 text-text-secondary hover:text-text-primary'
              }`}
            >
              Penghargaan ({items.filter((i) => i.category === 'penghargaan').length})
            </button>
          </div>

          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 transition-all hover:border-text-primary/40"
              >
                <AchievementThumb src={item.image_url} title={item.title} />

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(item.category)}
                    <span className="text-xs font-bold text-text-secondary font-mono">
                      #{item.sort_order}
                    </span>
                    <span className="text-xs text-text-secondary">&bull;</span>
                    <span className="text-xs font-semibold text-text-secondary">
                      {item.date}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                    {item.issuer}
                  </p>

                  {item.description && (
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2">
                      {item.description}
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

                  {item.link_url && (
                    <div className="pt-1">
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-text-primary hover:underline"
                      >
                        <span>Lihat Bukti / Publikasi</span>
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
        </>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <AchievementModal
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
        title="Hapus Pencapaian"
        message={
          <>
            Data pencapaian <strong>{deleting?.title}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
          </>
        }
        confirmLabel="Hapus Pencapaian"
        loading={deletingLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
