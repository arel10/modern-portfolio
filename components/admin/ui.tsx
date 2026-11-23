'use client'

import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Icon, type IconName } from './icons'

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm font-medium text-text-secondary">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-text-secondary/15 bg-background shadow-sm dark:border-white/10 dark:bg-[#121215]/80 dark:backdrop-blur-xl',
        className
      )}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-bold text-text-primary">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs font-medium text-text-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'icon'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-text-primary text-background shadow-sm hover:opacity-90 font-bold focus-visible:ring-text-primary dark:bg-white dark:text-black dark:hover:bg-gray-100',
  secondary:
    'border border-text-secondary/20 bg-background text-text-primary shadow-sm hover:bg-text-secondary/10 focus-visible:ring-text-secondary dark:border-white/15 dark:hover:bg-white/5',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-400',
  ghost:
    'text-text-secondary hover:bg-text-secondary/10 hover:text-text-primary focus-visible:ring-text-secondary transition-colors',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8.5 gap-1.5 px-3 text-xs rounded-lg',
  md: 'h-10 gap-2 px-4 text-sm rounded-xl',
  icon: 'h-9 w-9 px-0 rounded-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-900',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName
  label: string
  variant?: ButtonVariant
}) {
  return (
    <Button
      variant={variant}
      size="icon"
      aria-label={label}
      title={label}
      className={className}
      {...props}
    >
      <Icon name={icon} className="h-4 w-4" />
    </Button>
  )
}

// ─── Form controls ────────────────────────────────────────────────────────────

const controlClasses =
  'w-full rounded-xl border border-text-secondary/20 bg-background px-3.5 py-2.5 text-sm text-text-primary shadow-sm outline-none transition placeholder:text-text-secondary/50 focus:border-text-primary focus:ring-1 focus:ring-text-primary/30 disabled:cursor-not-allowed disabled:bg-text-secondary/10 dark:border-white/10 dark:bg-[#121215]'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClasses, className)} {...props} />
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClasses, 'min-h-24 resize-y', className)} {...props} />
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClasses, 'pr-9', className)} {...props}>
      {children}
    </select>
  )
}

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-text-primary">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-text-secondary font-medium">{hint}</span>}
    </label>
  )
}

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-black',
        checked ? 'bg-text-primary dark:bg-white' : 'bg-text-secondary/25 dark:bg-white/15'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full shadow transition-transform',
          checked
            ? 'translate-x-6 bg-background dark:bg-black'
            : 'translate-x-1 bg-white dark:bg-white/80'
        )}
      />
    </button>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-text-secondary/30 accent-text-primary focus:ring-text-primary dark:border-white/20 dark:bg-[#121215]"
      />
      <span>
        <span className="block text-sm font-medium text-text-primary">
          {label}
        </span>
        {hint && <span className="block text-xs text-text-secondary">{hint}</span>}
      </span>
    </label>
  )
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

const alertTones = {
  success:
    'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400',
  error:
    'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400',
  info: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400',
}

export function Alert({
  tone = 'error',
  children,
  onClose,
}: {
  tone?: keyof typeof alertTones
  children: ReactNode
  onClose?: () => void
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-md',
        alertTones[tone]
      )}
    >
      <Icon
        name={tone === 'success' ? 'check' : tone === 'info' ? 'sparkles' : 'alert'}
        className="mt-0.5 h-4 w-4 shrink-0"
      />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pesan"
          className="rounded p-0.5 opacity-60 transition hover:opacity-100"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-text-secondary/20 border-t-text-primary" />
      <p className="text-sm font-medium text-text-secondary">{label}</p>
    </div>
  )
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
}: {
  icon?: IconName
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-text-secondary/15 bg-thirdary/40 text-text-secondary">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-sm font-bold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs font-medium text-text-secondary leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

const badgeTones = {
  gray: 'bg-text-secondary/10 text-text-secondary border border-text-secondary/15',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  red: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  violet: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
}

export function Badge({
  children,
  tone = 'gray',
  className,
}: {
  children: ReactNode
  tone?: keyof typeof badgeTones
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const modalSizes = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: keyof typeof modalSizes
}) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-text-secondary/15 bg-background shadow-2xl dark:border-white/10 dark:bg-[#121215]/95 dark:backdrop-blur-2xl sm:rounded-2xl',
          modalSizes[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-text-secondary/15 px-6 py-4 dark:border-white/10">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-text-primary">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs font-medium text-text-secondary">{description}</p>
            )}
          </div>
          <IconButton icon="x" label="Tutup" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-text-secondary/15 bg-thirdary/20 px-6 py-4 dark:border-white/10 dark:bg-white/[0.02]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Hapus',
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <Icon name="alert" className="h-5 w-5" />
        </span>
        <div className="text-sm font-medium text-text-secondary">{message}</div>
      </div>
    </Modal>
  )
}
