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
  cn,
} from '@/components/admin/ui'
import type { QuickStat, Role } from '@/components/admin/types'

type Notice = { tone: 'success' | 'error'; text: string } | null

// ─── Roles ────────────────────────────────────────────────────────────────────

function RoleModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial?: Role
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = Boolean(initial)
  const [label, setLabel] = useState(initial?.label ?? '')
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0))
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await adminFetch(
        isEdit ? `/api/admin/roles/${initial?.id}` : '/api/admin/roles',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify({
            label: label.trim(),
            sort_order: Number(sortOrder) || 0,
            ...(isEdit ? { is_active: isActive } : {}),
          }),
        }
      )
      onSaved(isEdit ? 'Role berhasil diperbarui.' : 'Role baru berhasil ditambahkan.')
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
      title={isEdit ? 'Edit Role' : 'Tambah Role'}
      description="Role tampil sebagai teks bergantian pada bagian hero."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="role-form" loading={saving}>
            <Icon name="save" className="h-4 w-4" />
            {isEdit ? 'Simpan Perubahan' : 'Tambah Role'}
          </Button>
        </>
      }
    >
      <form id="role-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="Label role" required>
          <Input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Fullstack Developer"
            required
          />
        </Field>
        <Field label="Urutan tampil" hint="Angka kecil tampil lebih dulu.">
          <Input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            min={0}
          />
        </Field>
        {isEdit && (
          <div className="flex items-center justify-between rounded-xl border border-text-secondary/15 px-4 py-3 dark:border-white/10">
            <span className="text-sm font-semibold text-text-primary">
              Aktif
            </span>
            <Toggle checked={isActive} onChange={setIsActive} label="Aktifkan role" />
          </div>
        )}
      </form>
    </Modal>
  )
}

function RolesPanel() {
  const toast = useToast()
  const { data, setData, loading, error, reload } = useAdminData<Role[]>(
    '/api/admin/roles'
  )
  const [editor, setEditor] = useState<{ item?: Role } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const items = data ?? []

  async function toggleActive(item: Role) {
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
      await adminFetch(`/api/admin/roles/${item.id}`, {
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
      await adminFetch(`/api/admin/roles/${deleteTarget.id}`, { method: 'DELETE' })
      setData((prev) =>
        prev ? prev.filter((entry) => entry.id !== deleteTarget.id) : prev
      )
      setNotice({ tone: 'success', text: 'Role berhasil dihapus.' })
      setDeleteTarget(null)
    } catch (err) {
      setNotice({ tone: 'error', text: getErrorMessage(err) })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-text-primary">
            Roles
          </h2>
          <p className="text-sm font-medium text-text-secondary">
            Teks jabatan yang bergantian di bagian hero.
          </p>
        </div>
        <Button onClick={() => setEditor({})}>
          <Icon name="plus" className="h-4 w-4" />
          Tambah Role
        </Button>
      </div>

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
          <LoadingState label="Memuat roles..." />
        </Card>
      ) : !error && items.length === 0 ? (
        <Card>
          <EmptyState
            icon="tag"
            title="Belum ada role"
            description="Tambahkan role agar teks hero tidak kosong."
            action={
              <Button onClick={() => setEditor({})}>
                <Icon name="plus" className="h-4 w-4" />
                Tambah Role
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="divide-y divide-text-secondary/15 dark:divide-white/10">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
                !item.is_active && 'opacity-60'
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500">
                  <Icon name="tag" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-text-primary">
                    {item.label}
                  </p>
                  <p className="text-xs font-medium text-text-secondary">
                    Urutan: {item.sort_order}
                  </p>
                </div>
                {!item.is_active && <Badge tone="amber">Nonaktif</Badge>}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-text-secondary/15 px-2.5 py-1.5 dark:border-white/10">
                  <span className="text-xs font-medium text-text-secondary">Aktif</span>
                  <Toggle
                    checked={item.is_active}
                    onChange={() => toggleActive(item)}
                    disabled={busyId === item.id}
                    label={`Aktifkan ${item.label}`}
                  />
                </div>
                <IconButton
                  icon="edit"
                  label={`Edit ${item.label}`}
                  onClick={() => setEditor({ item })}
                />
                <IconButton
                  icon="trash"
                  label={`Hapus ${item.label}`}
                  variant="danger"
                  onClick={() => setDeleteTarget(item)}
                />
              </div>
            </div>
          ))}
        </Card>
      )}

      {editor && (
        <RoleModal
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
        title="Hapus role?"
        message={
          <>
            Role <strong>{deleteTarget?.label}</strong> akan dihapus permanen.
          </>
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

// ─── Quick Stats ──────────────────────────────────────────────────────────────

function StatModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial?: QuickStat
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = Boolean(initial)
  const [form, setForm] = useState({
    label: initial?.label ?? '',
    value: initial?.value ?? '',
    message: initial?.message ?? '',
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
        isEdit ? `/api/admin/stats/${initial?.id}` : '/api/admin/stats',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify({
            label: form.label.trim(),
            value: form.value.trim(),
            message: form.message.trim(),
            sort_order: Number(form.sort_order) || 0,
            ...(isEdit ? { is_active: form.is_active } : {}),
          }),
        }
      )
      onSaved(
        isEdit ? 'Quick stat berhasil diperbarui.' : 'Quick stat baru berhasil ditambahkan.'
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
      title={isEdit ? 'Edit Quick Stat' : 'Tambah Quick Stat'}
      description="Badge statistik singkat yang tampil di bagian hero."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="stat-form" loading={saving}>
            <Icon name="save" className="h-4 w-4" />
            {isEdit ? 'Simpan Perubahan' : 'Tambah Quick Stat'}
          </Button>
        </>
      }
    >
      <form id="stat-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label" required>
            <Input
              value={form.label}
              onChange={(event) => set('label', event.target.value)}
              placeholder="Experience"
              required
            />
          </Field>
          <Field label="Nilai" required>
            <Input
              value={form.value}
              onChange={(event) => set('value', event.target.value)}
              placeholder="2+ Years"
              required
            />
          </Field>
        </div>
        <Field label="Pesan" required hint="Teks lengkap yang tampil pada badge.">
          <Input
            value={form.message}
            onChange={(event) => set('message', event.target.value)}
            placeholder="2+ Years Experience"
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
                label="Aktifkan quick stat"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}

function StatsPanel() {
  const toast = useToast()
  const { data, setData, loading, error, reload } = useAdminData<QuickStat[]>(
    '/api/admin/stats'
  )
  const [editor, setEditor] = useState<{ item?: QuickStat } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<QuickStat | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const items = data ?? []

  async function toggleActive(item: QuickStat) {
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
      await adminFetch(`/api/admin/stats/${item.id}`, {
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
      await adminFetch(`/api/admin/stats/${deleteTarget.id}`, { method: 'DELETE' })
      setData((prev) =>
        prev ? prev.filter((entry) => entry.id !== deleteTarget.id) : prev
      )
      setNotice({ tone: 'success', text: 'Quick stat berhasil dihapus.' })
      setDeleteTarget(null)
    } catch (err) {
      setNotice({ tone: 'error', text: getErrorMessage(err) })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-text-primary">
            Quick Stats
          </h2>
          <p className="text-sm font-medium text-text-secondary">
            Badge statistik singkat yang tampil di bagian hero.
          </p>
        </div>
        <Button onClick={() => setEditor({})}>
          <Icon name="plus" className="h-4 w-4" />
          Tambah Quick Stat
        </Button>
      </div>

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
          <LoadingState label="Memuat quick stats..." />
        </Card>
      ) : !error && items.length === 0 ? (
        <Card>
          <EmptyState
            icon="sparkles"
            title="Belum ada quick stat"
            description="Tambahkan statistik singkat untuk memperkuat bagian hero."
            action={
              <Button onClick={() => setEditor({})}>
                <Icon name="plus" className="h-4 w-4" />
                Tambah Quick Stat
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className={cn('p-5', !item.is_active && 'opacity-60')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-2xl font-black tracking-tight text-text-primary">
                    {item.value}
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-500">
                  <Icon name="sparkles" className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-text-secondary">
                {item.message}
              </p>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-text-secondary/15 pt-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Toggle
                    checked={item.is_active}
                    onChange={() => toggleActive(item)}
                    disabled={busyId === item.id}
                    label={`Aktifkan ${item.label}`}
                  />
                  <span className="text-xs font-medium text-text-secondary">
                    #{item.sort_order}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton
                    icon="edit"
                    label={`Edit ${item.label}`}
                    onClick={() => setEditor({ item })}
                  />
                  <IconButton
                    icon="trash"
                    label={`Hapus ${item.label}`}
                    variant="danger"
                    onClick={() => setDeleteTarget(item)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editor && (
        <StatModal
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
        title="Hapus quick stat?"
        message={
          <>
            Quick stat <strong>{deleteTarget?.label}</strong> akan dihapus permanen.
          </>
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [tab, setTab] = useState<'roles' | 'stats'>('roles')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Stats"
        description="Kelola teks role dan badge statistik yang tampil di bagian hero."
      />

      <div className="inline-flex rounded-2xl border border-text-secondary/15 bg-thirdary/30 p-1.5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setTab('roles')}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all',
            tab === 'roles'
              ? 'bg-text-primary text-background shadow-sm dark:bg-white dark:text-black'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <Icon name="tag" className="h-4 w-4" />
          Roles
        </button>
        <button
          type="button"
          onClick={() => setTab('stats')}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all',
            tab === 'stats'
              ? 'bg-text-primary text-background shadow-sm dark:bg-white dark:text-black'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <Icon name="sparkles" className="h-4 w-4" />
          Quick Stats
        </button>
      </div>

      {tab === 'roles' ? <RolesPanel /> : <StatsPanel />}
    </div>
  )
}
