'use client'

import { useState } from 'react'
import { adminFetch, getErrorMessage, useAdminData } from '@/components/admin/api'
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
  IconButton,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Select,
  Textarea,
  Toggle,
} from '@/components/admin/ui'
import type { TechCategory, TechItem, TechStackData } from '@/components/admin/types'

type Notice = { tone: 'success' | 'error'; text: string } | null

type DeleteTarget =
  | { kind: 'category'; item: TechCategory }
  | { kind: 'item'; item: TechItem }
  | null

function logoSrc(src: string): string {
  if (!src) return ''
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src
  if (src.startsWith('/')) return src
  return '/' + src.replace(/^\.?\//, '')
}

function TechLogo({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const normalized = logoSrc(src)

  if (!normalized || failed) {
    return (
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {name.slice(0, 2)}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={normalized}
      alt=""
      onError={() => setFailed(true)}
      className="h-6 w-6 object-contain"
    />
  )
}

function CategoryModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  initial?: TechCategory
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = Boolean(initial)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
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
        isEdit
          ? `/api/admin/tech-stack/categories/${initial?.id}`
          : '/api/admin/tech-stack/categories',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            sort_order: Number(sortOrder) || 0,
            ...(isEdit ? { is_active: isActive } : {}),
          }),
        }
      )
      onSaved(
        isEdit ? 'Kategori berhasil diperbarui.' : 'Kategori baru berhasil ditambahkan.'
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
      title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
      description="Kategori mengelompokkan teknologi pada bagian Tech Stack."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="category-form" loading={saving}>
            <Icon name="save" className="h-4 w-4" />
            {isEdit ? 'Simpan Perubahan' : 'Tambah Kategori'}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="Nama kategori" required>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Frontend"
            required
          />
        </Field>
        <Field label="Deskripsi" required>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Framework dan library untuk membangun antarmuka..."
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Urutan tampil" hint="Angka kecil tampil lebih dulu.">
            <Input
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              min={0}
            />
          </Field>
          {isEdit && (
            <div className="flex items-center justify-between gap-3 self-end rounded-xl border border-text-secondary/15 px-4 py-3 dark:border-white/10">
              <span className="text-sm font-semibold text-text-primary">
                Aktif
              </span>
              <Toggle
                checked={isActive}
                onChange={setIsActive}
                label="Aktifkan kategori"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}

function ItemModal({
  open,
  categories,
  categoryId,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean
  categories: TechCategory[]
  categoryId: number
  initial?: TechItem
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = Boolean(initial)
  const [form, setForm] = useState({
    category_id: String(initial?.category_id ?? categoryId),
    name: initial?.name ?? '',
    svg_path: initial?.svg_path ?? '',
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
        isEdit
          ? `/api/admin/tech-stack/items/${initial?.id}`
          : '/api/admin/tech-stack/items',
        {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify({
            category_id: Number(form.category_id),
            name: form.name.trim(),
            svg_path: form.svg_path.trim(),
            sort_order: Number(form.sort_order) || 0,
            ...(isEdit ? { is_active: form.is_active } : {}),
          }),
        }
      )
      onSaved(
        isEdit ? 'Item berhasil diperbarui.' : 'Item baru berhasil ditambahkan.'
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
      title={isEdit ? 'Edit Item Teknologi' : 'Tambah Item Teknologi'}
      description="Item akan tampil sebagai ikon di dalam kategori yang dipilih."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="item-form" loading={saving}>
            <Icon name="save" className="h-4 w-4" />
            {isEdit ? 'Simpan Perubahan' : 'Tambah Item'}
          </Button>
        </>
      }
    >
      <form id="item-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategori" required>
            <Select
              value={form.category_id}
              onChange={(event) => set('category_id', event.target.value)}
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nama teknologi" required>
            <Input
              value={form.name}
              onChange={(event) => set('name', event.target.value)}
              placeholder="React.js"
              required
            />
          </Field>
        </div>
        <ImageUpload
          label="Ikon SVG / Logo Teknologi"
          hint="Unggah file ikon atau logo teknologi (SVG, PNG, WEBP, JPG)."
          value={form.svg_path}
          onChange={(url) => set('svg_path', url)}
          accept="image/svg+xml,image/png,image/webp,image/jpeg"
        />
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
                label="Aktifkan item"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default function TechStackPage() {
  const toast = useToast()
  const { data, setData, loading, error, reload } = useAdminData<TechStackData>(
    '/api/admin/tech-stack'
  )
  const [categoryEditor, setCategoryEditor] = useState<{
    item?: TechCategory
  } | null>(null)
  const [itemEditor, setItemEditor] = useState<{
    categoryId: number
    item?: TechItem
  } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const categories = data?.categories ?? []
  const items = data?.items ?? []

  async function toggleCategory(category: TechCategory) {
    setBusy(`category-${category.id}`)
    setNotice(null)
    const next = !category.is_active
    setData((prev) =>
      prev
        ? {
            ...prev,
            categories: prev.categories.map((entry) =>
              entry.id === category.id ? { ...entry, is_active: next } : entry
            ),
          }
        : prev
    )
    try {
      await adminFetch(`/api/admin/tech-stack/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: next }),
      })
    } catch (err) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((entry) =>
                entry.id === category.id
                  ? { ...entry, is_active: category.is_active }
                  : entry
              ),
            }
          : prev
      )
      setNotice({ tone: 'error', text: getErrorMessage(err) })
    } finally {
      setBusy(null)
    }
  }

  async function toggleItem(item: TechItem) {
    setBusy(`item-${item.id}`)
    setNotice(null)
    const next = !item.is_active
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((entry) =>
              entry.id === item.id ? { ...entry, is_active: next } : entry
            ),
          }
        : prev
    )
    try {
      await adminFetch(`/api/admin/tech-stack/items/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: next }),
      })
    } catch (err) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((entry) =>
                entry.id === item.id ? { ...entry, is_active: item.is_active } : entry
              ),
            }
          : prev
      )
      setNotice({ tone: 'error', text: getErrorMessage(err) })
    } finally {
      setBusy(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setNotice(null)
    try {
      if (deleteTarget.kind === 'category') {
        await adminFetch(
          `/api/admin/tech-stack/categories/${deleteTarget.item.id}`,
          { method: 'DELETE' }
        )
        setData((prev) =>
          prev
            ? {
                categories: prev.categories.filter(
                  (entry) => entry.id !== deleteTarget.item.id
                ),
                items: prev.items.filter(
                  (entry) => entry.category_id !== deleteTarget.item.id
                ),
              }
            : prev
        )
        setNotice({ tone: 'success', text: 'Kategori berhasil dihapus.' })
      } else {
        await adminFetch(`/api/admin/tech-stack/items/${deleteTarget.item.id}`, {
          method: 'DELETE',
        })
        setData((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.filter((entry) => entry.id !== deleteTarget.item.id),
              }
            : prev
        )
        setNotice({ tone: 'success', text: 'Item berhasil dihapus.' })
      }
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
        title="Tech Stack"
        description="Kelola kategori dan teknologi yang tampil di bagian Tech Stack."
      >
        <Button onClick={() => setCategoryEditor({})}>
          <Icon name="plus" className="h-4 w-4" />
          Tambah Kategori
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
          <LoadingState label="Memuat tech stack..." />
        </Card>
      ) : !error && categories.length === 0 ? (
        <Card>
          <EmptyState
            icon="stack"
            title="Belum ada kategori"
            description="Buat kategori terlebih dahulu, lalu tambahkan teknologi ke dalamnya."
            action={
              <Button onClick={() => setCategoryEditor({})}>
                <Icon name="plus" className="h-4 w-4" />
                Tambah Kategori
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          <p className="text-sm font-medium text-text-secondary">
            {categories.length} kategori · {items.length} teknologi
          </p>

          {categories.map((category) => {
            const categoryItems = items.filter(
              (item) => item.category_id === category.id
            )
            return (
              <Card key={category.id} className="overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-text-secondary/15 p-5 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-text-primary">
                        {category.title}
                      </h2>
                      <Badge tone="blue">{categoryItems.length} item</Badge>
                      {!category.is_active && <Badge tone="amber">Nonaktif</Badge>}
                    </div>
                    <p className="mt-1 max-w-2xl text-sm font-medium text-text-secondary">
                      {category.description}
                    </p>
                    <p className="mt-1 text-xs font-medium text-text-secondary">
                      Urutan: {category.sort_order}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-text-secondary/15 px-2.5 py-1.5 dark:border-white/10">
                      <span className="text-xs font-medium text-text-secondary">
                        Aktif
                      </span>
                      <Toggle
                        checked={category.is_active}
                        onChange={() => toggleCategory(category)}
                        disabled={busy === `category-${category.id}`}
                        label={`Aktifkan ${category.title}`}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setCategoryEditor({ item: category })}
                    >
                      <Icon name="edit" className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setDeleteTarget({ kind: 'category', item: category })
                      }
                    >
                      <Icon name="trash" className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>

                <div className="p-5">
                  {categoryItems.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-text-secondary/20 px-4 py-8 text-center text-sm font-medium text-text-secondary">
                      Belum ada teknologi di kategori ini.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className={
                            item.is_active
                              ? 'flex items-center gap-3 rounded-xl border border-text-secondary/15 bg-thirdary/20 p-3 hover:bg-thirdary/40 transition-colors dark:border-white/10'
                              : 'flex items-center gap-3 rounded-xl border border-text-secondary/15 bg-thirdary/20 p-3 opacity-60 dark:border-white/10'
                          }
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-text-secondary/15 bg-background dark:border-white/10">
                            <TechLogo src={item.svg_path} name={item.name} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-text-primary">
                              {item.name}
                            </p>
                            <p className="truncate text-xs font-mono text-text-secondary">
                              {item.svg_path || 'Tanpa ikon'} · #{item.sort_order}
                            </p>
                          </div>
                          <Toggle
                            checked={item.is_active}
                            onChange={() => toggleItem(item)}
                            disabled={busy === `item-${item.id}`}
                            label={`Aktifkan ${item.name}`}
                          />
                          <div className="flex items-center gap-1">
                            <IconButton
                              icon="edit"
                              label={`Edit ${item.name}`}
                              onClick={() =>
                                setItemEditor({
                                  categoryId: category.id,
                                  item,
                                })
                              }
                            />
                            <IconButton
                              icon="trash"
                              label={`Hapus ${item.name}`}
                              variant="danger"
                              onClick={() => setDeleteTarget({ kind: 'item', item })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => setItemEditor({ categoryId: category.id })}
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    Tambah Item
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {categoryEditor && (
        <CategoryModal
          key={categoryEditor.item?.id ?? 'new-category'}
          open
          initial={categoryEditor.item}
          onClose={() => setCategoryEditor(null)}
          onSaved={(message) => {
            setCategoryEditor(null)
            setNotice({ tone: 'success', text: message })
            toast.success(message)
            reload()
          }}
        />
      )}

      {itemEditor && (
        <ItemModal
          key={itemEditor.item?.id ?? `new-item-${itemEditor.categoryId}`}
          open
          categories={categories}
          categoryId={itemEditor.categoryId}
          initial={itemEditor.item}
          onClose={() => setItemEditor(null)}
          onSaved={(message) => {
            setItemEditor(null)
            setNotice({ tone: 'success', text: message })
            toast.success(message)
            reload()
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.kind === 'category'
            ? 'Hapus kategori?'
            : 'Hapus item teknologi?'
        }
        message={
          deleteTarget?.kind === 'category' ? (
            <>
              Kategori <strong>{deleteTarget.item.title}</strong> beserta semua item
              di dalamnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </>
          ) : (
            <>
              Item <strong>{deleteTarget?.item.name}</strong> akan dihapus permanen.
              Tindakan ini tidak dapat dibatalkan.
            </>
          )
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
