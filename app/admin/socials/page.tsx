'use client'

import { useState } from 'react'
import { adminFetch, getErrorMessage, useAdminData } from '@/components/admin/api'
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
  IconButton,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Toggle,
} from '@/components/admin/ui'
import type { Social } from '@/components/admin/types'

type Notice = { tone: 'success' | 'error'; text: string } | null

const platformSuggestions = [
  'github',
  'linkedin',
  'instagram',
  'tiktok',
  'whatsapp',
  'email',
  'twitter',
  'youtube',
  'facebook',
]

function platformLabel(platform: string): string {
  if (!platform) return '—'
  return platform.charAt(0).toUpperCase() + platform.slice(1)
}

function SocialModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial?: Social
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = Boolean(initial)
  const [form, setForm] = useState({
    platform: initial?.platform ?? '',
    url: initial?.url ?? '',
    username: initial?.username ?? '',
    sort_order: String(initial?.sort_order ?? 0),
    is_active: initial?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await adminFetch(
        isEdit ? `/api/admin/socials/${initial?.id}` : '/api/admin/socials',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify({
            platform: form.platform.trim().toLowerCase(),
            url: form.url.trim(),
            username: form.username.trim() || undefined,
            sort_order: Number(form.sort_order) || 0,
            ...(isEdit ? { is_active: form.is_active } : {}),
          }),
        }
      )
      onSaved(
        isEdit
          ? 'Sosial media berhasil diperbarui.'
          : 'Sosial media baru berhasil ditambahkan.'
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
      title={isEdit ? 'Edit Sosial Media' : 'Tambah Sosial Media'}
      description="Tautan ini tampil pada hero, kontak, dan footer portofolio."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="social-form" loading={saving}>
            <Icon name="save" className="h-4 w-4" />
            {isEdit ? 'Simpan Perubahan' : 'Tambah Sosial Media'}
          </Button>
        </>
      }
    >
      <form id="social-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Platform"
            required
            hint="Contoh: github, linkedin, instagram."
          >
            <Input
              list="social-platform-options"
              value={form.platform}
              onChange={(event) => set('platform', event.target.value)}
              placeholder="github"
              required
            />
            <datalist id="social-platform-options">
              {platformSuggestions.map((platform) => (
                <option key={platform} value={platform} />
              ))}
            </datalist>
          </Field>
          <Field label="Label / username" hint="Teks yang tampil di samping ikon.">
            <Input
              value={form.username}
              onChange={(event) => set('username', event.target.value)}
              placeholder="@afcha"
            />
          </Field>
        </div>

        <Field
          label="URL"
          required
          hint="Untuk email, isi alamat email. Untuk WhatsApp, gunakan https://wa.me/..."
        >
          <Input
            value={form.url}
            onChange={(event) => set('url', event.target.value)}
            placeholder="https://github.com/afcha"
            required
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
            <div className="flex items-center justify-between gap-3 self-end rounded-xl border border-text-secondary/15 px-4 py-3 dark:border-white/10">
              <span className="text-sm font-semibold text-text-primary">
                Aktif
              </span>
              <Toggle
                checked={form.is_active}
                onChange={(value) => set('is_active', value)}
                label="Aktifkan sosial media"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default function SocialsPage() {
  const toast = useToast()
  const { data, setData, loading, error, reload } = useAdminData<Social[]>(
    '/api/admin/socials'
  )
  const [editor, setEditor] = useState<{ item?: Social } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Social | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const items = data ?? []

  async function toggleActive(item: Social) {
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
      await adminFetch(`/api/admin/socials/${item.id}`, {
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
      await adminFetch(`/api/admin/socials/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      setData((prev) =>
        prev ? prev.filter((entry) => entry.id !== deleteTarget.id) : prev
      )
      setNotice({ tone: 'success', text: 'Sosial media berhasil dihapus.' })
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
        title="Sosial Media"
        description="Kelola tautan sosial media dan kontak yang tampil di portofolio."
      >
        <Button onClick={() => setEditor({})}>
          <Icon name="plus" className="h-4 w-4" />
          Tambah Sosial Media
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
          <LoadingState label="Memuat sosial media..." />
        </Card>
      ) : !error && items.length === 0 ? (
        <Card>
          <EmptyState
            icon="globe"
            title="Belum ada sosial media"
            description="Tambahkan tautan agar pengunjung dapat menghubungi kamu."
            action={
              <Button onClick={() => setEditor({})}>
                <Icon name="plus" className="h-4 w-4" />
                Tambah Sosial Media
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-text-secondary/15 px-5 py-4 dark:border-white/10">
            <p className="text-sm font-medium text-text-secondary">
              {items.length} tautan terdaftar
            </p>
            <Badge tone="green">
              {items.filter((item) => item.is_active).length} aktif
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-text-secondary/15 text-xs uppercase tracking-wider text-text-secondary dark:border-white/10">
                  <th className="px-5 py-3 font-semibold">Platform</th>
                  <th className="px-5 py-3 font-semibold">Label</th>
                  <th className="px-5 py-3 font-semibold">URL</th>
                  <th className="px-5 py-3 font-semibold">Urutan</th>
                  <th className="px-5 py-3 font-semibold">Aktif</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-text-secondary/10 dark:divide-white/5">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={
                      item.is_active
                        ? 'transition-colors hover:bg-text-secondary/5'
                        : 'opacity-60 transition-colors hover:bg-text-secondary/5'
                    }
                  >
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2.5 font-bold text-text-primary">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-text-secondary/15 bg-thirdary/60 text-text-primary dark:border-white/10">
                          <Icon name="globe" className="h-4 w-4" />
                        </span>
                        {platformLabel(item.platform)}
                      </span>
                    </td>
                    <td className="max-w-[180px] truncate px-5 py-3 font-medium text-text-secondary">
                      {item.username || '—'}
                    </td>
                    <td className="max-w-[240px] px-5 py-3">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-full items-center gap-1.5 truncate font-mono text-xs text-text-primary hover:underline"
                        >
                          <Icon name="link" className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                          <span className="truncate">{item.url}</span>
                        </a>
                      ) : (
                        <span className="text-text-secondary/50">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-text-secondary font-medium">
                      {item.sort_order}
                    </td>
                    <td className="px-5 py-3">
                      <Toggle
                        checked={item.is_active}
                        onChange={() => toggleActive(item)}
                        disabled={busyId === item.id}
                        label={`Aktifkan ${item.platform}`}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon="edit"
                          label={`Edit ${item.platform}`}
                          onClick={() => setEditor({ item })}
                        />
                        <IconButton
                          icon="trash"
                          label={`Hapus ${item.platform}`}
                          variant="danger"
                          onClick={() => setDeleteTarget(item)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {editor && (
        <SocialModal
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
        title="Hapus sosial media?"
        message={
          <>
            Tautan <strong>{platformLabel(deleteTarget?.platform ?? '')}</strong> akan
            dihapus permanen. Tindakan ini tidak dapat dibatalkan.
          </>
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
