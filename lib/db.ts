import { Pool, type PoolConfig } from 'pg'
import fs from 'node:fs'
import path from 'node:path'

// Singleton PostgreSQL pool with auto-refresh if config changes
const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined
  currentKey: string | undefined
}

function getDatabaseConfig(): PoolConfig & { key: string } {
  let connStr = process.env.DATABASE_URL || ''

  // Fallback membaca langsung dari file .env di disk (jika Next.js dev server belum di-restart)
  try {
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('DATABASE_URL=')) {
          let val = trimmed.substring('DATABASE_URL='.length).trim()
          val = val.replace(/^["']|["']$/g, '')
          if (val) connStr = val
          break
        }
      }
    }
  } catch {}

  connStr = connStr || 'postgresql://postgres:admin@localhost:5432/portfolio_db'

  const isSsl = process.env.DATABASE_SSL === 'true'

  try {
    const url = new URL(connStr)
    return {
      user: decodeURIComponent(url.username || 'postgres'),
      password: decodeURIComponent(url.password || 'admin'),
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port, 10) : 5432,
      database: url.pathname.replace(/^\//, '') || 'portfolio_db',
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      key: connStr,
    }
  } catch {
    return {
      connectionString: connStr,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      key: connStr,
    }
  }
}

export function getActivePool(): Pool {
  const config = getDatabaseConfig()

  if (!globalForPg.pgPool || globalForPg.currentKey !== config.key) {
    if (globalForPg.pgPool) {
      globalForPg.pgPool.end().catch(() => {})
    }
    const { key, ...poolOptions } = config
    globalForPg.pgPool = new Pool(poolOptions)
    globalForPg.currentKey = key
  }

  return globalForPg.pgPool
}

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const active = getActivePool() as unknown as Record<string | symbol, unknown>
    const val = active[prop]
    return typeof val === 'function' ? (val as (...args: unknown[]) => unknown).bind(active) : val
  },
})

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface ProfileRow {
  id: number
  full_name: string
  short_name: string
  bio: string
  avatar_url: string
  cv_url: string
  place_of_birth: string | null
  phone: string | null
  email: string | null
  gpa: string | null
  education: string | null
  location_name: string | null
  location_city: string | null
  maps_embed_url: string | null
  who_am_i: string | null
  my_approach: string | null
}

export interface RoleRow {
  id: number
  label: string
  sort_order: number
}

export interface QuickStatRow {
  id: number
  label: string
  value: string
  message: string
}

export interface SocialRow {
  id: number
  platform: string
  url: string
  username: string | null
}

export interface ExperienceRow {
  id: number
  company: string
  role: string
  date_range: string
  description: string
  skills: string[]
  sort_order: number
}

export interface EducationRow {
  id: number
  institution: string
  degree: string
  field_of_study: string | null
  date_range: string
  grade: string | null
  description: string | null
  image_url: string | null
  skills: string[]
  sort_order: number
}

export interface AchievementRow {
  id: number
  title: string
  category: string
  issuer: string
  date: string
  description: string | null
  link_url: string | null
  image_url: string | null
  skills: string[]
  sort_order: number
}

export interface CertificateRow {
  id: number
  title: string
  issuer: string
  issue_date: string
  expiration_date: string | null
  credential_id: string | null
  credential_url: string | null
  image_url: string | null
  skills: string[]
  sort_order: number
}

export interface ProjectRow {
  id: number
  title: string
  short_description: string
  image_path: string
  images?: string[]
  created_at_label: string | null
  tech: string[]
  features: string[]
  github_url: string
  live_demo_url: string
  is_private_repo: boolean
  sort_order: number
}

export interface TechCategoryRow {
  id: number
  title: string
  description: string
  sort_order: number
}

export interface TechItemRow {
  id: number
  category_id: number
  name: string
  svg_path: string
  sort_order: number
}

export interface ChatMessageRow {
  id: string
  session_id: string
  sender: 'user' | 'bot'
  text: string
  created_at: number
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

export async function getProfile(): Promise<ProfileRow | null> {
  const { rows } = await pool.query<ProfileRow>(
    'SELECT * FROM profile WHERE is_active = TRUE LIMIT 1'
  )
  return rows[0] ?? null
}

export async function getRoles(): Promise<RoleRow[]> {
  const { rows } = await pool.query<RoleRow>(
    'SELECT * FROM roles WHERE is_active = TRUE ORDER BY sort_order ASC'
  )
  return rows
}

export async function getQuickStats(): Promise<QuickStatRow[]> {
  const { rows } = await pool.query<QuickStatRow>(
    'SELECT * FROM quick_stats WHERE is_active = TRUE ORDER BY sort_order ASC'
  )
  return rows
}

export async function getSocials(): Promise<SocialRow[]> {
  const { rows } = await pool.query<SocialRow>(
    'SELECT * FROM socials WHERE is_active = TRUE ORDER BY sort_order ASC'
  )
  return rows
}

export async function getSocialByPlatform(platform: string): Promise<SocialRow | null> {
  const { rows } = await pool.query<SocialRow>(
    'SELECT * FROM socials WHERE platform = $1 AND is_active = TRUE LIMIT 1',
    [platform]
  )
  return rows[0] ?? null
}

export async function getExperiences(): Promise<ExperienceRow[]> {
  const { rows } = await pool.query<ExperienceRow>(
    'SELECT * FROM experiences WHERE is_active = TRUE ORDER BY sort_order ASC'
  )
  return rows
}

export async function getEducations(): Promise<EducationRow[]> {
  const { rows } = await pool.query<EducationRow>(
    'SELECT * FROM educations WHERE is_active = TRUE ORDER BY sort_order ASC'
  )
  return rows
}

export async function getAchievements(): Promise<AchievementRow[]> {
  const { rows } = await pool.query<AchievementRow>(
    'SELECT * FROM achievements WHERE is_active = TRUE ORDER BY sort_order ASC'
  )
  return rows
}

export async function getCertificates(): Promise<CertificateRow[]> {
  const { rows } = await pool.query<CertificateRow>(
    'SELECT * FROM certificates WHERE is_active = TRUE ORDER BY sort_order ASC'
  )
  return rows
}

export async function getProjects(): Promise<ProjectRow[]> {
  await ensureProjectImagesColumn()
  const { rows } = await pool.query<ProjectRow>(
    'SELECT * FROM projects WHERE is_active = TRUE ORDER BY sort_order ASC'
  )
  return rows
}

// ─────────────────────────────────────────────────────────────────────────────
// Migrasi ringan: kolom galeri foto project.
// Dijalankan otomatis (idempotent) supaya database production di Neon
// tidak perlu diubah manual saat fitur ini pertama kali dipakai.
// ─────────────────────────────────────────────────────────────────────────────

let projectImagesColumnPromise: Promise<void> | null = null

export function ensureProjectImagesColumn(): Promise<void> {
  if (!projectImagesColumnPromise) {
    projectImagesColumnPromise = pool
      .query(
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}'`
      )
      .then(() => undefined)
      .catch((error) => {
        projectImagesColumnPromise = null
        throw error
      })
  }
  return projectImagesColumnPromise
}

export async function getTechCategoriesWithItems(): Promise<
  (TechCategoryRow & { technologies: TechItemRow[] })[]
> {
  const { rows: cats } = await pool.query<TechCategoryRow>(
    'SELECT * FROM tech_categories WHERE is_active = TRUE ORDER BY sort_order ASC'
  )
  const { rows: items } = await pool.query<TechItemRow>(
    'SELECT * FROM tech_items WHERE is_active = TRUE ORDER BY sort_order ASC'
  )

  return cats.map((cat) => ({
    ...cat,
    technologies: items.filter((item) => item.category_id === cat.id),
  }))
}

// ─── Chat (PostgreSQL) ────────────────────────────────────────────────────────

export async function ensureSession(sessionId: string): Promise<void> {
  await pool.query(
    `INSERT INTO chat_sessions (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`,
    [sessionId]
  )
}

export async function saveChatMessage(params: {
  id: string
  sessionId: string
  sender: 'user' | 'bot'
  text: string
  createdAt: number
}): Promise<void> {
  await ensureSession(params.sessionId)
  await pool.query(
    `INSERT INTO chat_messages (id, session_id, sender, text, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [params.id, params.sessionId, params.sender, params.text, params.createdAt]
  )
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessageRow[]> {
  const { rows } = await pool.query<ChatMessageRow>(
    `SELECT id, session_id, sender, text, created_at
     FROM chat_messages
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  )
  return rows
}

export async function getRecentHistory(
  sessionId: string,
  limit = 10
): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
  const { rows } = await pool.query<ChatMessageRow>(
    `SELECT sender, text
     FROM chat_messages
     WHERE session_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [sessionId, limit]
  )
  return rows.reverse().map((r) => ({
    role: r.sender === 'user' ? ('user' as const) : ('assistant' as const),
    content: r.text,
  }))
}

export async function clearSessionMessages(sessionId: string): Promise<void> {
  await pool.query('DELETE FROM chat_messages WHERE session_id = $1', [sessionId])
}
