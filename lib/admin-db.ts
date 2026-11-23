import { pool } from './db'
import type {
  ProfileRow,
  ExperienceRow,
  EducationRow,
  AchievementRow,
  CertificateRow,
  ProjectRow,
  TechCategoryRow,
  TechItemRow,
} from './db'

// ─── Extended Interfaces for Admin ───────────────────────────────────────────

export interface AdminRoleRow {
  id: number
  label: string
  sort_order: number
  is_active: boolean
}

export interface AdminQuickStatRow {
  id: number
  label: string
  value: string
  message: string
  sort_order: number
  is_active: boolean
}

export interface AdminSocialRow {
  id: number
  platform: string
  url: string
  username: string | null
  sort_order: number
  is_active: boolean
}

export interface AdminUserRow {
  id: number
  username: string
  email: string
  password_hash: string
  is_active: boolean
  created_at: string
}

export interface AdminExperienceRow extends ExperienceRow {
  is_active: boolean
  updated_at: string
}

export interface AdminEducationRow extends EducationRow {
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminAchievementRow extends AchievementRow {
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminCertificateRow extends CertificateRow {
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminProjectRow extends ProjectRow {
  full_description: string | null
  is_active: boolean
  updated_at: string
}

export interface AdminTechCategoryRow extends TechCategoryRow {
  is_active: boolean
}

export interface AdminTechItemRow extends TechItemRow {
  is_active: boolean
}

// ─── Admin Users ──────────────────────────────────────────────────────────────

export async function getAdminUserCount(): Promise<number> {
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*) as count FROM admin_users')
  return parseInt(rows[0].count, 10)
}

export async function getAdminByLogin(login: string): Promise<AdminUserRow | null> {
  const { rows } = await pool.query<AdminUserRow>(
    'SELECT * FROM admin_users WHERE (username = $1 OR email = $1) AND is_active = TRUE LIMIT 1',
    [login]
  )
  return rows[0] ?? null
}

export const getAdminByUsername = getAdminByLogin

export async function createAdminUser(data: {
  username: string
  email: string
  password_hash: string
}): Promise<void> {
  await pool.query(
    'INSERT INTO admin_users (username, email, password_hash) VALUES ($1, $2, $3)',
    [data.username, data.email, data.password_hash]
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getAdminProfile(): Promise<ProfileRow | null> {
  const { rows } = await pool.query<ProfileRow>('SELECT * FROM profile LIMIT 1')
  return rows[0] ?? null
}

export async function updateProfile(id: number, data: Partial<ProfileRow>): Promise<ProfileRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<ProfileRow>(
    `UPDATE profile SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export async function getAllRoles(): Promise<AdminRoleRow[]> {
  const { rows } = await pool.query<AdminRoleRow>(
    'SELECT * FROM roles ORDER BY sort_order ASC'
  )
  return rows
}

export async function createRole(data: {
  label: string
  sort_order: number
}): Promise<AdminRoleRow> {
  const { rows } = await pool.query<AdminRoleRow>(
    'INSERT INTO roles (label, sort_order) VALUES ($1, $2) RETURNING *',
    [data.label, data.sort_order]
  )
  return rows[0]
}

export async function updateRole(id: number, data: Partial<AdminRoleRow>): Promise<AdminRoleRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<AdminRoleRow>(
    `UPDATE roles SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

export async function deleteRole(id: number): Promise<void> {
  await pool.query('DELETE FROM roles WHERE id = $1', [id])
}

// ─── Quick Stats ──────────────────────────────────────────────────────────────

export async function getAllQuickStats(): Promise<AdminQuickStatRow[]> {
  const { rows } = await pool.query<AdminQuickStatRow>(
    'SELECT * FROM quick_stats ORDER BY sort_order ASC'
  )
  return rows
}

export async function createQuickStat(data: {
  label: string
  value: string
  message: string
  sort_order: number
}): Promise<AdminQuickStatRow> {
  const { rows } = await pool.query<AdminQuickStatRow>(
    'INSERT INTO quick_stats (label, value, message, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.label, data.value, data.message, data.sort_order]
  )
  return rows[0]
}

export async function updateQuickStat(
  id: number,
  data: Partial<AdminQuickStatRow>
): Promise<AdminQuickStatRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<AdminQuickStatRow>(
    `UPDATE quick_stats SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

export async function deleteQuickStat(id: number): Promise<void> {
  await pool.query('DELETE FROM quick_stats WHERE id = $1', [id])
}

// ─── Socials ──────────────────────────────────────────────────────────────────

export async function getAllSocials(): Promise<AdminSocialRow[]> {
  const { rows } = await pool.query<AdminSocialRow>(
    'SELECT * FROM socials ORDER BY sort_order ASC'
  )
  return rows
}

export async function createSocial(data: {
  platform: string
  url: string
  username?: string
  sort_order: number
}): Promise<AdminSocialRow> {
  const { rows } = await pool.query<AdminSocialRow>(
    'INSERT INTO socials (platform, url, username, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.platform, data.url, data.username || null, data.sort_order]
  )
  return rows[0]
}

export async function updateSocial(
  id: number,
  data: Partial<AdminSocialRow>
): Promise<AdminSocialRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<AdminSocialRow>(
    `UPDATE socials SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

export async function deleteSocial(id: number): Promise<void> {
  await pool.query('DELETE FROM socials WHERE id = $1', [id])
}

// ─── Experiences ──────────────────────────────────────────────────────────────

export async function getAllExperiences(): Promise<AdminExperienceRow[]> {
  const { rows } = await pool.query<AdminExperienceRow>(
    'SELECT * FROM experiences ORDER BY sort_order ASC'
  )
  return rows
}

export async function createExperience(data: {
  company: string
  role: string
  date_range: string
  description: string
  skills: string[]
  sort_order: number
}): Promise<AdminExperienceRow> {
  const { rows } = await pool.query<AdminExperienceRow>(
    `INSERT INTO experiences (company, role, date_range, description, skills, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.company, data.role, data.date_range, data.description, data.skills, data.sort_order]
  )
  return rows[0]
}

export async function updateExperience(
  id: number,
  data: Partial<AdminExperienceRow>
): Promise<AdminExperienceRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<AdminExperienceRow>(
    `UPDATE experiences SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

export async function deleteExperience(id: number): Promise<void> {
  await pool.query('DELETE FROM experiences WHERE id = $1', [id])
}

// ─── Educations ───────────────────────────────────────────────────────────────

export async function getAllEducations(): Promise<AdminEducationRow[]> {
  const { rows } = await pool.query<AdminEducationRow>(
    'SELECT * FROM educations ORDER BY sort_order ASC'
  )
  return rows
}

export async function createEducation(data: {
  institution: string
  degree: string
  field_of_study?: string
  date_range: string
  grade?: string
  description?: string
  image_url?: string
  skills: string[]
  sort_order: number
}): Promise<AdminEducationRow> {
  const { rows } = await pool.query<AdminEducationRow>(
    `INSERT INTO educations (institution, degree, field_of_study, date_range, grade, description, image_url, skills, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      data.institution,
      data.degree,
      data.field_of_study || null,
      data.date_range,
      data.grade || null,
      data.description || null,
      data.image_url || null,
      data.skills,
      data.sort_order,
    ]
  )
  return rows[0]
}

export async function updateEducation(
  id: number,
  data: Partial<AdminEducationRow>
): Promise<AdminEducationRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<AdminEducationRow>(
    `UPDATE educations SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

export async function deleteEducation(id: number): Promise<void> {
  await pool.query('DELETE FROM educations WHERE id = $1', [id])
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function getAllAchievements(): Promise<AdminAchievementRow[]> {
  const { rows } = await pool.query<AdminAchievementRow>(
    'SELECT * FROM achievements ORDER BY sort_order ASC'
  )
  return rows
}

export async function createAchievement(data: {
  title: string
  category?: string
  issuer: string
  date: string
  description?: string
  link_url?: string
  image_url?: string
  skills?: string[]
  sort_order?: number
}): Promise<AdminAchievementRow> {
  const { rows } = await pool.query<AdminAchievementRow>(
    `INSERT INTO achievements (title, category, issuer, date, description, link_url, image_url, skills, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.title,
      data.category || 'prestasi',
      data.issuer,
      data.date,
      data.description || null,
      data.link_url || null,
      data.image_url || null,
      data.skills || [],
      data.sort_order ?? 0,
    ]
  )
  return rows[0]
}

export async function updateAchievement(
  id: number,
  data: Partial<AdminAchievementRow>
): Promise<AdminAchievementRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id' && k !== 'created_at' && k !== 'updated_at')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<AdminAchievementRow>(
    `UPDATE achievements SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

export async function deleteAchievement(id: number): Promise<void> {
  await pool.query('DELETE FROM achievements WHERE id = $1', [id])
}

// ─── Certificates ─────────────────────────────────────────────────────────────

export async function getAllCertificates(): Promise<AdminCertificateRow[]> {
  const { rows } = await pool.query<AdminCertificateRow>(
    'SELECT * FROM certificates ORDER BY sort_order ASC'
  )
  return rows
}

export async function createCertificate(data: {
  title: string
  issuer: string
  issue_date: string
  expiration_date?: string
  credential_id?: string
  credential_url?: string
  image_url?: string
  skills?: string[]
  sort_order?: number
}): Promise<AdminCertificateRow> {
  const { rows } = await pool.query<AdminCertificateRow>(
    `INSERT INTO certificates (title, issuer, issue_date, expiration_date, credential_id, credential_url, image_url, skills, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.title,
      data.issuer,
      data.issue_date,
      data.expiration_date || null,
      data.credential_id || null,
      data.credential_url || null,
      data.image_url || null,
      data.skills || [],
      data.sort_order ?? 0,
    ]
  )
  return rows[0]
}

export async function updateCertificate(
  id: number,
  data: Partial<AdminCertificateRow>
): Promise<AdminCertificateRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id' && k !== 'created_at' && k !== 'updated_at')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<AdminCertificateRow>(
    `UPDATE certificates SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

export async function deleteCertificate(id: number): Promise<void> {
  await pool.query('DELETE FROM certificates WHERE id = $1', [id])
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<AdminProjectRow[]> {
  const { rows } = await pool.query<AdminProjectRow>(
    'SELECT * FROM projects ORDER BY sort_order ASC'
  )
  return rows
}

export async function createProject(data: {
  title: string
  short_description: string
  full_description?: string
  image_path: string
  created_at_label?: string
  tech: string[]
  features: string[]
  github_url: string
  live_demo_url: string
  is_private_repo: boolean
  sort_order: number
}): Promise<AdminProjectRow> {
  const { rows } = await pool.query<AdminProjectRow>(
    `INSERT INTO projects (title, short_description, full_description, image_path, created_at_label,
       tech, features, github_url, live_demo_url, is_private_repo, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [
      data.title,
      data.short_description,
      data.full_description || null,
      data.image_path,
      data.created_at_label || null,
      data.tech,
      data.features,
      data.github_url,
      data.live_demo_url,
      data.is_private_repo,
      data.sort_order,
    ]
  )
  return rows[0]
}

export async function updateProject(
  id: number,
  data: Partial<AdminProjectRow>
): Promise<AdminProjectRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<AdminProjectRow>(
    `UPDATE projects SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

export async function deleteProject(id: number): Promise<void> {
  await pool.query('DELETE FROM projects WHERE id = $1', [id])
}

// ─── Tech Stack ───────────────────────────────────────────────────────────────

export async function getAllTechCategories(): Promise<AdminTechCategoryRow[]> {
  const { rows } = await pool.query<AdminTechCategoryRow>(
    'SELECT * FROM tech_categories ORDER BY sort_order ASC'
  )
  return rows
}

export async function createTechCategory(data: {
  title: string
  description: string
  sort_order: number
}): Promise<AdminTechCategoryRow> {
  const { rows } = await pool.query<AdminTechCategoryRow>(
    'INSERT INTO tech_categories (title, description, sort_order) VALUES ($1, $2, $3) RETURNING *',
    [data.title, data.description, data.sort_order]
  )
  return rows[0]
}

export async function updateTechCategory(
  id: number,
  data: Partial<AdminTechCategoryRow>
): Promise<AdminTechCategoryRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<AdminTechCategoryRow>(
    `UPDATE tech_categories SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

export async function deleteTechCategory(id: number): Promise<void> {
  await pool.query('DELETE FROM tech_categories WHERE id = $1', [id])
}

export async function getAllTechItems(): Promise<AdminTechItemRow[]> {
  const { rows } = await pool.query<AdminTechItemRow>(
    'SELECT * FROM tech_items ORDER BY category_id ASC, sort_order ASC'
  )
  return rows
}

export async function createTechItem(data: {
  category_id: number
  name: string
  svg_path: string
  sort_order: number
}): Promise<AdminTechItemRow> {
  const { rows } = await pool.query<AdminTechItemRow>(
    'INSERT INTO tech_items (category_id, name, svg_path, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.category_id, data.name, data.svg_path, data.sort_order]
  )
  return rows[0]
}

export async function updateTechItem(
  id: number,
  data: Partial<AdminTechItemRow>
): Promise<AdminTechItemRow> {
  const fields = Object.keys(data).filter((k) => k !== 'id')
  const values = fields.map((k) => (data as Record<string, unknown>)[k])
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ')
  const { rows } = await pool.query<AdminTechItemRow>(
    `UPDATE tech_items SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0]
}

export async function deleteTechItem(id: number): Promise<void> {
  await pool.query('DELETE FROM tech_items WHERE id = $1', [id])
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<{
  experiences: number
  educations: number
  achievements: number
  certificates: number
  projects: number
  roles: number
  socials: number
  techCategories: number
  techItems: number
  quickStats: number
}> {
  const results = await Promise.all([
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM experiences'),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM educations'),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM achievements'),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM certificates'),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM projects'),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM roles'),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM socials'),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM tech_categories'),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM tech_items'),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM quick_stats'),
  ])
  return {
    experiences: parseInt(results[0].rows[0].count, 10),
    educations: parseInt(results[1].rows[0].count, 10),
    achievements: parseInt(results[2].rows[0].count, 10),
    certificates: parseInt(results[3].rows[0].count, 10),
    projects: parseInt(results[4].rows[0].count, 10),
    roles: parseInt(results[5].rows[0].count, 10),
    socials: parseInt(results[6].rows[0].count, 10),
    techCategories: parseInt(results[7].rows[0].count, 10),
    techItems: parseInt(results[8].rows[0].count, 10),
    quickStats: parseInt(results[9].rows[0].count, 10),
  }
}
